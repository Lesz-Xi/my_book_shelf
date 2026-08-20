#!/usr/bin/env python3
"""Development server for the Structured Book Shelf.

Serves the source pages (index.html, reader.html) over http://127.0.0.1
with automatic browser reload: a tiny script is injected into every HTML
response, and the server pushes a reload event over SSE whenever a watched
source file changes. Standard library only; no install step.

    python3 serve.py            # serve on the first free port from 8000
    python3 serve.py --port 8080
    python3 serve.py --no-open  # do not launch a browser tab

For a shareable offline artifact, build-standalone.py remains the tool.
"""

from __future__ import annotations

import argparse
import http.server
import socket
import socketserver
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent

WATCH_SUFFIXES = {".html", ".css", ".js", ".woff2", ".svg", ".png", ".jpg", ".jpeg", ".webp"}
WATCH_SKIP_DIRS = {".git", "__pycache__", ".impeccable"}

RELOAD_SNIPPET = b"""<script>
(() => {
  const es = new EventSource("/__livereload");
  es.onmessage = (event) => { if (event.data === "reload") location.reload(); };
})();
</script>
</body>"""

_generation = 0
_generation_lock = threading.Lock()


def current_generation() -> int:
    with _generation_lock:
        return _generation


def bump_generation() -> None:
    global _generation
    with _generation_lock:
        _generation += 1


def snapshot_mtimes() -> dict[Path, float]:
    mtimes: dict[Path, float] = {}
    for path in ROOT.rglob("*"):
        if any(part in WATCH_SKIP_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in WATCH_SUFFIXES:
            try:
                mtimes[path] = path.stat().st_mtime
            except OSError:
                continue
    return mtimes


def watch_loop() -> None:
    previous = snapshot_mtimes()
    while True:
        time.sleep(0.4)
        current = snapshot_mtimes()
        if current != previous:
            previous = current
            bump_generation()


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:  # noqa: A002 - stdlib name
        pass

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        if self.path == "/__livereload":
            self.handle_livereload()
            return
        if self.path in ("/", ""):
            self.path = "/index.html"
        if self.path.endswith(".html") or self.path == "/index.html":
            if self.serve_html_with_reload():
                return
        super().do_GET()

    def serve_html_with_reload(self) -> bool:
        target = (ROOT / self.path.lstrip("/")).resolve()
        if ROOT not in target.parents and target != ROOT:
            return False
        if not target.is_file():
            return False
        body = target.read_bytes()
        if b"</body>" in body:
            body = body.replace(b"</body>", RELOAD_SNIPPET, 1)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return True

    def handle_livereload(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        seen = current_generation()
        try:
            while True:
                time.sleep(0.25)
                generation = current_generation()
                if generation != seen:
                    seen = generation
                    self.wfile.write(b"data: reload\n\n")
                    self.wfile.flush()
                else:
                    self.wfile.write(b": keep-alive\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            return


class DevServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address) -> None:
        # A browser dropping its live-reload connection on navigation is
        # expected; keep the console clean.
        pass


def find_port(preferred: int) -> int:
    port = preferred
    while port < preferred + 20:
        with socket.socket() as probe:
            try:
                probe.bind(("127.0.0.1", port))
                return port
            except OSError:
                port += 1
    raise SystemExit("No free port found near %d" % preferred)


def main() -> None:
    parser = argparse.ArgumentParser(description="Structured Book Shelf dev server")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-open", action="store_true")
    args = parser.parse_args()

    port = find_port(args.port)
    url = "http://127.0.0.1:%d/" % port

    watcher = threading.Thread(target=watch_loop, daemon=True)
    watcher.start()

    server = DevServer(("127.0.0.1", port), DevHandler)
    print("Structured Book Shelf dev server")
    print("  %s  (auto-reload on source change; Ctrl+C to stop)" % url)
    if not args.no_open:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
