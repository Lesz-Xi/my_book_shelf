#!/usr/bin/env python3
"""Build the offline Structured Book Shelf deliverable.

The output inlines CSS, fonts, application JavaScript, GSAP, ScrollTrigger,
SplitText, and Lenis. It is intended to be opened directly over file://.
"""

from __future__ import annotations

import base64
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

LANDING_SCRIPTS = (
    "assets/vendor/gsap.min.js",
    "assets/vendor/ScrollTrigger.min.js",
    "assets/vendor/SplitText.min.js",
    "assets/vendor/lenis.min.js",
    "app.js",
)

READER_SCRIPTS = (
    "assets/vendor/gsap.min.js",
    "assets/vendor/ScrollTrigger.min.js",
    "assets/vendor/lenis.min.js",
    "reader-data.js",
    "reader.js",
)


def data_uri(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if path.suffix.lower() == ".ttf":
        mime = "font/ttf"
    elif path.suffix.lower() == ".woff2":
        mime = "font/woff2"
    elif path.suffix.lower() == ".svg":
        mime = "image/svg+xml"
    if mime is None:
        mime = "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def inline_css_assets(css: str) -> str:
    pattern = re.compile(r"url\((['\"]?)(assets/[^)'\"]+)\1\)")

    def replace(match: re.Match[str]) -> str:
        relative = match.group(2)
        asset = ROOT / relative
        if not asset.is_file():
            raise FileNotFoundError(f"CSS asset does not exist: {relative}")
        return f'url("{data_uri(asset)}")'

    return pattern.sub(replace, css)


def inline_html_assets(html: str, source_name: str) -> str:
    pattern = re.compile(r'src="(assets/[^"]+)"')

    def replace(match: re.Match[str]) -> str:
        relative = match.group(1)
        asset = ROOT / relative
        if not asset.is_file():
            raise FileNotFoundError(f"{source_name} references missing asset: {relative}")
        return f'src="{data_uri(asset)}"'

    return pattern.sub(replace, html)


def safe_script(source: str) -> str:
    source = re.sub(r"\n?//# sourceMappingURL=.*?(?=\n|$)", "", source)
    return source.replace("</script", "<\\/script")


def inline_script(html: str, relative: str) -> str:
    script_path = ROOT / relative
    if not script_path.is_file():
        raise FileNotFoundError(f"Script does not exist: {relative}")
    source = safe_script(script_path.read_text(encoding="utf-8"))
    pattern = re.compile(
        rf'<script\s+src=["\']{re.escape(relative)}["\']\s*></script>',
        re.IGNORECASE,
    )
    replacement = f'<script data-inline-source="{relative}">\n{source}\n</script>'
    html, count = pattern.subn(lambda _: replacement, html, count=1)
    if count != 1:
        raise RuntimeError(f"Expected exactly one script tag for {relative}; found {count}.")
    return html


def build_document(
    source_name: str,
    style_name: str,
    output_name: str,
    script_paths: tuple[str, ...],
) -> Path:
    source = ROOT / source_name
    styles = ROOT / style_name
    output = ROOT / output_name
    html = source.read_text(encoding="utf-8")
    css = inline_css_assets(styles.read_text(encoding="utf-8"))

    stylesheet = f'<link rel="stylesheet" href="{style_name}">'
    if html.count(stylesheet) != 1:
        raise RuntimeError(f"Expected one local stylesheet link in {source_name}.")
    html = html.replace(stylesheet, f'<style data-inline-source="{style_name}">\n{css}\n</style>')

    for relative in script_paths:
        html = inline_script(html, relative)

    html = inline_html_assets(html, source_name)

    external_script = re.search(r'<script[^>]+src=["\'](?:https?:)?//', html, re.IGNORECASE)
    external_style = re.search(r'<link[^>]+href=["\'](?:https?:)?//', html, re.IGNORECASE)
    residual_local_script = re.search(r'<script[^>]+src=["\']', html, re.IGNORECASE)
    residual_local_style = re.search(r'<link[^>]+rel=["\']stylesheet["\']', html, re.IGNORECASE)
    if external_script or external_style:
        raise RuntimeError(f"{output_name} still contains a network-loading script or stylesheet.")
    if residual_local_script or residual_local_style:
        raise RuntimeError(f"{output_name} still contains an uninlined script or stylesheet.")
    if re.search(r'src="assets/', html):
        raise RuntimeError(f"{output_name} still contains an uninlined local asset.")

    temporary = output.with_suffix(".tmp")
    temporary.write_text(html, encoding="utf-8")
    temporary.replace(output)
    return output


def build() -> tuple[Path, Path]:
    landing = build_document(
        "index.html",
        "styles.css",
        "structured-book-shelf-standalone.html",
        LANDING_SCRIPTS,
    )
    reader = build_document(
        "reader.html",
        "reader.css",
        "structured-book-reader-standalone.html",
        READER_SCRIPTS,
    )
    return landing, reader


if __name__ == "__main__":
    for output in build():
        print(f"Built {output.name} ({output.stat().st_size:,} bytes)")
