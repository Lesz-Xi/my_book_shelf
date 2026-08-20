#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9341;
const PROFILE = "/tmp/structured-book-reader-chrome";
const PAGE_URL = pathToFileURL(path.join(ROOT, "structured-book-reader-standalone.html")).href;
const SCREENSHOTS = path.join(ROOT, "reader-screenshots");

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
      (this.events.get(message.method) || []).forEach((listener) => listener(message.params));
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  return result.result.value;
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

async function load(cdp, hash = "") {
  await cdp.send("Page.navigate", { url: `${PAGE_URL}${hash}` });
  await sleep(1200);
  await evaluate(cdp, "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true");
  await sleep(180);
}

async function navigate(cdp, route) {
  const found = await evaluate(cdp, `(() => {
    const link = document.querySelector('[data-route="${route}"]');
    if (!link) return false;
    link.click();
    return true;
  })()`);
  if (!found) throw new Error(`Reader route not found: ${route}`);
  await sleep(900);
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

async function scrollFraction(cdp, fraction) {
  await evaluate(cdp, `(() => {
    const page = document.querySelector('#reader-page');
    page.scrollTop = (page.scrollHeight - page.clientHeight) * ${fraction};
    page.dispatchEvent(new Event('scroll'));
    return page.scrollTop;
  })()`);
  await sleep(650);
}

async function diagnostics(cdp, label) {
  return evaluate(cdp, `(() => {
    const page = document.querySelector('#reader-page');
    const active = document.querySelector('[data-document]:not([hidden])');
    const heading = active?.querySelector('h1');
    const article = active?.querySelector('.markdown-body');
    const bounds = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    const overflow = [...document.querySelectorAll('[data-document]:not([hidden]) *')].filter((element) => {
      if (element.closest('pre, table')) return false;
      const rect = element.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      return rect.right > pageRect.right + 2 || rect.left < pageRect.left - 2;
    }).slice(0, 12).map((element) => ({ tag: element.tagName, class: element.className, rect: bounds(element) }));
    return {
      label: ${JSON.stringify(label)},
      viewport: { width: innerWidth, height: innerHeight },
      route: active?.dataset.route || null,
      activeDocuments: document.querySelectorAll('[data-document]:not([hidden])').length,
      hiddenDocuments: document.querySelectorAll('[data-document][hidden]').length,
      chapterLinks: document.querySelectorAll('.chapter-link').length,
      tocLinks: document.querySelectorAll('#article-toc a').length,
      page: { top: Math.round(page.scrollTop), height: page.scrollHeight, client: page.clientHeight },
      heading: bounds(heading),
      article: bounds(article),
      title: heading?.textContent || null,
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

  const report = { screenshots: [], diagnostics: [], interactions: {}, reducedMotion: null, noJavaScript: null };

  await setViewport(cdp, 1440, 900, false);
  await load(cdp, "#ai-2041/ch-00/dossier");
  report.screenshots.push(await capture(cdp, "desktop-ai-intro.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-ai-intro"));

  await navigate(cdp, "ai-2041/ch-01/dossier");
  await scrollFraction(cdp, 0.38);
  report.screenshots.push(await capture(cdp, "desktop-ai-dossier-mid.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-ai-dossier-mid"));

  await navigate(cdp, "ai-2041/ch-01/distillation");
  report.screenshots.push(await capture(cdp, "desktop-ai-distillation.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-ai-distillation"));

  await navigate(cdp, "jung/ch-01/dossier");
  report.screenshots.push(await capture(cdp, "desktop-jung-dossier.png"));
  report.diagnostics.push(await diagnostics(cdp, "desktop-jung-dossier"));

  await setViewport(cdp, 390, 844, true);
  await load(cdp, "#jung/ch-01/distillation");
  report.screenshots.push(await capture(cdp, "mobile-jung-distillation.png"));
  report.diagnostics.push(await diagnostics(cdp, "mobile-jung-distillation"));
  report.interactions.mobileMenu = await evaluate(cdp, `(() => {
    document.querySelector('#chapter-menu').click();
    const rail = document.querySelector('#chapter-rail');
    const rect = rail.getBoundingClientRect();
    return {
      expanded: document.querySelector('#chapter-menu').getAttribute('aria-expanded'),
      open: rail.classList.contains('is-open'),
      left: Math.round(rect.left),
      right: Math.round(rect.right)
    };
  })()`);
  await sleep(650);
  report.screenshots.push(await capture(cdp, "mobile-chapter-menu.png"));
  await navigate(cdp, "jung/ch-11/dossier");
  report.interactions.mobileSelection = await evaluate(cdp, `(() => ({
    route: document.querySelector('[data-document]:not([hidden])')?.dataset.route,
    menuExpanded: document.querySelector('#chapter-menu').getAttribute('aria-expanded'),
    menuOpen: document.querySelector('#chapter-rail').classList.contains('is-open')
  }))()`);
  report.diagnostics.push(await diagnostics(cdp, "mobile-jung-last-chapter"));

  await cdp.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });
  await load(cdp, "#ai-2041/ch-03/dossier");
  report.reducedMotion = await evaluate(cdp, `(() => ({
    route: document.querySelector('[data-document]:not([hidden])')?.dataset.route,
    activeDocuments: document.querySelectorAll('[data-document]:not([hidden])').length,
    headingVisible: getComputedStyle(document.querySelector('[data-document]:not([hidden]) h1')).visibility,
    pageOverflow: getComputedStyle(document.querySelector('#reader-page')).overflowY
  }))()`);

  await cdp.send("Emulation.setScriptExecutionDisabled", { value: true });
  await cdp.send("Page.navigate", { url: PAGE_URL });
  await sleep(650);
  report.noJavaScript = await evaluate(cdp, `(() => ({
    root: document.documentElement.className,
    documents: document.querySelectorAll('[data-document]').length,
    hiddenDocuments: document.querySelectorAll('[data-document][hidden]').length,
    chapterLinks: document.querySelectorAll('.chapter-link').length,
    firstHeadingVisible: getComputedStyle(document.querySelector('[data-document] h1')).visibility
  }))()`);
  await cdp.send("Emulation.setScriptExecutionDisabled", { value: false });

  const networkRequests = requests.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"));
  report.consoleErrors = consoleErrors;
  report.pageErrors = pageErrors;
  report.networkRequests = [...new Set(networkRequests)];

  const failed = report.consoleErrors.length > 0 ||
    report.pageErrors.length > 0 ||
    report.networkRequests.length > 0 ||
    report.diagnostics.some((item) => item.activeDocuments !== 1 || item.chapterLinks !== 23 || item.overflow.length > 0) ||
    report.interactions.mobileMenu?.expanded !== "true" ||
    report.interactions.mobileMenu?.open !== true ||
    report.interactions.mobileSelection?.route !== "jung/ch-11/dossier" ||
    report.interactions.mobileSelection?.menuExpanded !== "false" ||
    report.reducedMotion?.activeDocuments !== 1 ||
    report.reducedMotion?.headingVisible !== "visible" ||
    report.noJavaScript?.root !== "no-js" ||
    report.noJavaScript?.documents !== 25 ||
    report.noJavaScript?.hiddenDocuments !== 0 ||
    report.noJavaScript?.chapterLinks !== 23 ||
    report.noJavaScript?.firstHeadingVisible !== "visible";

  const reportPath = path.join(SCREENSHOTS, "verification-report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  cdp?.close();
  chrome.kill("SIGTERM");
  await sleep(300);
  if (process.exitCode && stderr) console.error(stderr.slice(-4000));
}
