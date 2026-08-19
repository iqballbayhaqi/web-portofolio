#!/usr/bin/env python3
"""
Dev server dengan live reload.

Jalankan:  python dev-server.py            (port 8765)
           python dev-server.py 3000       (port lain)

Menyajikan file dari folder project, memantau perubahan .html/.css/.js/.json,
lalu menyuruh browser refresh sendiri lewat Server-Sent Events. Hanya memakai
pustaka bawaan Python — tidak ada yang perlu di-install.

Khusus untuk development. Jangan dipakai di server produksi.
"""

import http.server
import os
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
HOST = "127.0.0.1"

WATCH_SUFFIXES = {".html", ".css", ".js", ".json"}
IGNORE_DIRS = {".git", "node_modules", ".github", "__pycache__"}

_version = 0
_lock = threading.Lock()

RELOAD_SNIPPET = b"""
<script>
/* live reload (dev-server.py) */
(function () {
    var es = new EventSource('/__livereload');
    es.onmessage = function (e) { if (e.data === 'reload') location.reload(); };
    // On error EventSource retries on its own, so a server restart reconnects.
})();
</script>
"""


def snapshot():
    """Map of watched file -> mtime."""
    files = {}
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in WATCH_SUFFIXES:
            continue
        if IGNORE_DIRS.intersection(path.parts):
            continue
        try:
            files[str(path)] = path.stat().st_mtime
        except OSError:
            pass
    return files


def watch():
    global _version
    previous = snapshot()
    while True:
        time.sleep(0.3)
        # Nothing in here may kill the thread: if watching stops, edits silently
        # stop reloading and the server still looks healthy.
        try:
            current = snapshot()
            if current != previous:
                changed = [
                    Path(f).name
                    for f in set(current) | set(previous)
                    if current.get(f) != previous.get(f)
                ]
                previous = current
                with _lock:
                    _version += 1
                print("  reload <- " + ", ".join(sorted(changed)[:5]))
        except Exception as err:                      # noqa: BLE001
            print("  (watcher error, tetap jalan) " + repr(err))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def handle_one_request(self):
        # A browser dropping its live-reload stream on navigation is normal; without
        # this the console fills with ConnectionAborted tracebacks.
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            self.close_connection = True

    def log_message(self, fmt, *args):
        # Keep the console readable: only surface failures.
        status = args[1] if len(args) > 1 else ""
        if str(status).startswith(("4", "5")):
            sys.stderr.write("  %s %s\n" % (self.path, status))

    def end_headers(self):
        # Never let the browser cache during development, otherwise an edit can
        # look like it did nothing.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/__livereload":
            return self._serve_events()

        target = self.translate_path(self.path)
        if os.path.isdir(target):
            target = os.path.join(target, "index.html")

        if target.endswith(".html") and os.path.isfile(target):
            return self._serve_html(target)

        return super().do_GET()

    def _serve_html(self, target):
        with open(target, "rb") as fh:
            body = fh.read()
        if b"</body>" in body:
            body = body.replace(b"</body>", RELOAD_SNIPPET + b"</body>", 1)
        else:
            body += RELOAD_SNIPPET

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_events(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        seen = _version
        try:
            while True:
                time.sleep(0.3)
                with _lock:
                    current = _version
                if current != seen:
                    seen = current
                    self.wfile.write(b"data: reload\n\n")
                else:
                    self.wfile.write(b": ping\n\n")   # keeps the connection alive
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass


def main():
    # The Windows console defaults to cp1252; without this, printing a non-ASCII
    # filename would raise UnicodeEncodeError inside the watcher thread.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    threading.Thread(target=watch, daemon=True).start()

    server = http.server.ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True

    print(f"  Dev server  http://{HOST}:{PORT}/")
    print(f"  Dashboard   http://{HOST}:{PORT}/admin.html")
    print(f"  Memantau    {', '.join(sorted(WATCH_SUFFIXES))} di {ROOT}")
    print("  Ctrl+C untuk berhenti\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Berhenti.")
        server.shutdown()


if __name__ == "__main__":
    main()
