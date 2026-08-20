#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9337;
const PROFILE = "/tmp/structured-book-shelf-chrome";
const PAGE_URL = pathToFileURL(path.join(ROOT, "structured-book-shelf-standalone.html")).href;
const SCREENSHOTS = path.join(ROOT, "screenshots");

await mkdir(SCREENSHOTS, { recursive: true });
await rm(PROFILE, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-sync",
  "--metrics-recording-only",
  "--no-first-run",
  "--no-default-browser-check",
  "--mute-audio",
  "--force-color-profile=srgb",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

let stderr = "";
chrome.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollJson(route, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}${route}`);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint did not open: ${route}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.counter = 0;
    this.pending = new Map();
    this.events = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      const listeners = this.events.get(message.method) || [];
      listeners.forEach((listener) => listener(message.params));
    });
  }

  on(method, listener) {
    const listeners = this.events.get(method) || [];
    listeners.push(listener);
    this.events.set(method, listeners);
  }

  send(method, params = {}) {
    const id = ++this.counter;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

async function capture(cdp, name) {
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const target = path.join(SCREENSHOTS, name);
  await writeFile(target, Buffer.from(result.data, "base64"));
  return target;
}

async function setViewport(cdp, width, height, mobile = false) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
}

async function load(cdp) {
  await cdp.send("Page.navigate", { url: PAGE_URL });
  await sleep(1900);
  await evaluate(cdp, `document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true`);
  await sleep(250);
}

async function scrollTo(cdp, id) {
  await evaluate(cdp, `(() => {
    const target = document.getElementById(${JSON.stringify(id)});
    const link = document.querySelector('[href="#' + ${JSON.stringify(id)} + '"][data-scroll-link]');
    if (link) link.click();
    else if (target) target.scrollIntoView({ block: 'start' });
    return Boolean(target);
  })()`);
  await sleep(2300);
}

async function scrollEnd(cdp) {
  await evaluate(cdp, `(() => {
    const scroller = document.querySelector('.page');
    scroller.scrollTop = scroller.scrollHeight;
    scroller.dispatchEvent(new Event('scroll'));
    return { top: scroller.scrollTop, height: scroller.scrollHeight };
  })()`);
  await sleep(700);
}

async function diagnostics(cdp, label) {
  return evaluate(cdp, `(() => {
    const scroller = document.querySelector('.page');
    const hero = document.querySelector('.hero');
    const title = document.querySelector('.hero h1');
    const action = document.querySelector('.action-primary');
    const veil = document.querySelector('.entry-veil');
    const bounds = (el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const overflow = [...document.querySelectorAll('body *')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > innerWidth + 2 || r.left < -2;
    }).slice(0, 12).map((el) => ({ tag: el.tagName, class: el.className, rect: bounds(el) }));
    return {
      label: ${JSON.stringify(label)},
      viewport: { width: innerWidth, height: innerHeight },
      scroller: { top: Math.round(scroller.scrollTop), height: scroller.scrollHeight, client: scroller.clientHeight },
      hero: bounds(hero),
      title: bounds(title),
      primaryAction: bounds(action),
      actionVisibleAtEntry: bounds(action).bottom <= innerHeight && bounds(action).top >= 0,
      veilDisplay: getComputedStyle(veil).display,
      motionClass: document.documentElement.className,
      overflow
    };
  })()`);
}

const consoleErrors = [];
const pageErrors = [];
const requests = [];
let cdp;

try {
  await pollJson("/json/version");
  const pages = await pollJson("/json/list");
  const target = pages.find((item) => item.type === "page");
  if (!target) throw new Error("No Chrome page target found.");

  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Network.enable"),
    cdp.send("Log.enable")
  ]);

  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error" || event.type === "warning") {
      consoleErrors.push({ type: event.type, args: event.args.map((arg) => arg.value || arg.description || "") });
    }
  });
  cdp.on("Runtime.exceptionThrown", (event) => pageErrors.push(event.exceptionDetails));
  cdp.on("Network.requestWillBeSent", (event) => requests.push(event.request.url));
  cdp.on("Log.entryAdded", (event) => {
    if (event.entry.level === "error" || event.entry.level === "warning") consoleErrors.push(event.entry);
  });

  const report = { screenshots: [], diagnostics: [], reducedMotion: null };

  await setViewport(cdp, 1440, 900, false);
  await load(cdp);
  report.screenshots.push(await capture(cdp, "desktop-entry.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-entry"));
  await scrollTo(cdp, "ai-2041");
  report.screenshots.push(await capture(cdp, "desktop-mid.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-mid"));
  await scrollEnd(cdp);
  report.screenshots.push(await capture(cdp, "desktop-end.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-end"));

  await setViewport(cdp, 390, 844, true);
  await load(cdp);
  report.screenshots.push(await capture(cdp, "mobile-entry.png"));
  report.diagnostics.push(await diagnostics(cdp, "mobile-entry"));
  await scrollTo(cdp, "jung");
  report.screenshots.push(await capture(cdp, "mobile-mid.png"));
  report.diagnostics.push(await diagnostics(cdp, "mobile-mid"));
  await scrollEnd(cdp);
  report.screenshots.push(await capture(cdp, "mobile-end.png"));
  report.diagnostics.push(await diagnostics(cdp, "mobile-end"));

  await cdp.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });
  await load(cdp);
  report.reducedMotion = await evaluate(cdp, `(() => ({
    root: document.documentElement.className,
    veil: getComputedStyle(document.querySelector('.entry-veil')).display,
    h1Visibility: getComputedStyle(document.querySelector('.hero h1')).visibility,
    scrollerOverflow: getComputedStyle(document.querySelector('.page')).overflowY
  }))()`);

  const networkRequests = requests.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"));
  report.consoleErrors = consoleErrors;
  report.pageErrors = pageErrors;
  report.networkRequests = [...new Set(networkRequests)];

  const failed = report.consoleErrors.length > 0 || report.pageErrors.length > 0 || report.networkRequests.length > 0 || report.diagnostics.some((item) => item.overflow.length > 0) || report.diagnostics.find((item) => item.label === "desktop-entry")?.actionVisibleAtEntry !== true || report.diagnostics.find((item) => item.label === "mobile-entry")?.actionVisibleAtEntry !== true || report.reducedMotion?.veil !== "none" || report.reducedMotion?.h1Visibility !== "visible";

  const reportPath = path.join(ROOT, "screenshots", "verification-report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  cdp?.close();
  chrome.kill("SIGTERM");
  await sleep(300);
  if (process.exitCode && stderr) {
    console.error(stderr.slice(-4000));
  }
}
