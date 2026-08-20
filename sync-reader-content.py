#!/usr/bin/env python3
"""Compile canonical Book Schematics Markdown into offline reader data.

The canonical Markdown remains outside this presentation repository. This script
reads the 23 chapter dossiers and the two completed constructive distillations,
converts them with the locally installed Pandoc, and writes reader-data.js.
"""

from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
from pathlib import Path
from typing import TypedDict

ROOT = Path(__file__).resolve().parent
SCHEMATICS = Path("/Users/lesz/.twin-sparrow/agent/memory/Book Schematics")
OUTPUT = ROOT / "reader-data.js"


class ChapterSpec(TypedDict, total=False):
    id: str
    number: str
    title: str
    kind: str
    source: str
    dossier: str
    distillation: str
    distillationTitle: str


class BookSpec(TypedDict):
    id: str
    title: str
    author: str
    register: str
    theme: str
    status: str
    evidenceBoundary: str
    root: str
    chapters: list[ChapterSpec]


BOOKS: list[BookSpec] = [
    {
        "id": "ai-2041",
        "title": "AI 2041",
        "author": "Kai-Fu Lee · Chen Qiufan",
        "register": "Volume 01 · AI & future systems",
        "theme": "yellow",
        "status": "11 mapped units · 1 constructive distillation",
        "evidenceBoundary": "Story, analysis, book-era fact, prediction, inference, and current-status unknown remain distinct.",
        "root": "AI_2041",
        "chapters": [
            {"id": "ch-00", "number": "00", "title": "Introductions", "kind": "Book frame", "source": "PDF pp. 7–19", "dossier": "CH-00-introductions.md"},
            {"id": "ch-01", "number": "01", "title": "The Golden Elephant", "kind": "Story + analysis", "source": "Story pp. 20–39 · analysis pp. 40–51", "dossier": "CH-01-the-golden-elephant.md", "distillation": "Constructive Distillations/CH-01-the-golden-elephant.md", "distillationTitle": "The Metric That Cannot See You"},
            {"id": "ch-02", "number": "02", "title": "Gods Behind the Masks", "kind": "Story + analysis", "source": "Story pp. 52–73 · analysis pp. 74–86", "dossier": "CH-02-gods-behind-the-masks.md"},
            {"id": "ch-03", "number": "03", "title": "Twin Sparrows", "kind": "Story + analysis", "source": "Story pp. 87–128 · analysis pp. 129–142", "dossier": "CH-03-twin-sparrows.md"},
            {"id": "ch-04", "number": "04", "title": "Contactless Love", "kind": "Story + analysis", "source": "Story pp. 143–174 · analysis pp. 175–189", "dossier": "CH-04-contactless-love.md"},
            {"id": "ch-05", "number": "05", "title": "My Haunting Idol", "kind": "Story + analysis", "source": "Story pp. 190–223 · analysis pp. 224–235", "dossier": "CH-05-my-haunting-idol.md"},
            {"id": "ch-06", "number": "06", "title": "The Holy Driver", "kind": "Story + analysis", "source": "Story pp. 236–271 · analysis pp. 272–281", "dossier": "CH-06-the-holy-driver.md"},
            {"id": "ch-07", "number": "07", "title": "Quantum Genocide", "kind": "Story + analysis", "source": "Story pp. 282–329 · analysis pp. 330–341", "dossier": "CH-07-quantum-genocide.md"},
            {"id": "ch-08", "number": "08", "title": "The Job Savior", "kind": "Story + analysis", "source": "Story pp. 342–372 · analysis pp. 373–386", "dossier": "CH-08-the-job-savior.md"},
            {"id": "ch-09", "number": "09", "title": "Isle of Happiness", "kind": "Story + analysis", "source": "Story pp. 387–417 · analysis pp. 418–430", "dossier": "CH-09-isle-of-happiness.md"},
            {"id": "ch-10", "number": "10", "title": "Dreaming of Plenitude", "kind": "Story + analysis", "source": "Story pp. 431–452 · analysis pp. 453–470", "dossier": "CH-10-dreaming-of-plenitude.md"},
        ],
    },
    {
        "id": "jung",
        "title": "Modern Man in Search of a Soul",
        "author": "C. G. Jung",
        "register": "Volume 02 · psychology & inner life",
        "theme": "yellow",
        "status": "12 mapped units · 1 Spiral Distillation",
        "evidenceBoundary": "Text, inference, meaning-frame, Chief-link, and caution remain distinct. Chapter maps are initial structural passes.",
        "root": "Modern_Man_in_Search_of_a_Soul",
        "chapters": [
            {"id": "ch-00", "number": "00", "title": "Translator’s Preface", "kind": "Preface · structural pass", "source": "PDF entry p. 2", "dossier": "CH-00-translators-preface.md"},
            {"id": "ch-01", "number": "01", "title": "Dream-Analysis in Its Practical Application", "kind": "Essay · structural pass", "source": "PDF pp. 4–28", "dossier": "CH-01-dream-analysis-in-its-practical-application.md", "distillation": "Constructive Distillations/CH-01-dream-analysis.md", "distillationTitle": "The Night Messenger"},
            {"id": "ch-02", "number": "02", "title": "Problems of Modern Psychotherapy", "kind": "Essay · structural pass", "source": "PDF entry p. 29", "dossier": "CH-02-problems-of-modern-psychotherapy.md"},
            {"id": "ch-03", "number": "03", "title": "The Aims of Psychotherapy", "kind": "Essay · structural pass", "source": "PDF entry p. 53", "dossier": "CH-03-the-aims-of-psychotherapy.md"},
            {"id": "ch-04", "number": "04", "title": "A Psychological Theory of Types", "kind": "Essay · structural pass", "source": "PDF entry p. 71", "dossier": "CH-04-a-psychological-theory-of-types.md"},
            {"id": "ch-05", "number": "05", "title": "The Stages of Life", "kind": "Essay · structural pass", "source": "PDF entry p. 89", "dossier": "CH-05-the-stages-of-life.md"},
            {"id": "ch-06", "number": "06", "title": "Freud and Jung—Contrasts", "kind": "Essay · structural pass", "source": "PDF entry p. 108", "dossier": "CH-06-freud-and-jung-contrasts.md"},
            {"id": "ch-07", "number": "07", "title": "Archaic Man", "kind": "Essay · structural pass", "source": "PDF entry p. 116", "dossier": "CH-07-archaic-man.md"},
            {"id": "ch-08", "number": "08", "title": "Psychology and Literature", "kind": "Essay · structural pass", "source": "PDF entry p. 141", "dossier": "CH-08-psychology-and-literature.md"},
            {"id": "ch-09", "number": "09", "title": "The Basic Postulates of Analytical Psychology", "kind": "Essay · structural pass", "source": "PDF entry p. 160", "dossier": "CH-09-the-basic-postulates-of-analytical-psychology.md"},
            {"id": "ch-10", "number": "10", "title": "The Spiritual Problem of Modern Man", "kind": "Essay · structural pass", "source": "PDF entry p. 182", "dossier": "CH-10-the-spiritual-problem-of-modern-man.md"},
            {"id": "ch-11", "number": "11", "title": "Psychotherapists or the Clergy", "kind": "Essay · structural pass", "source": "PDF entry p. 205", "dossier": "CH-11-psychotherapists-or-the-clergy.md"},
        ],
    },
]


def markdown_to_html(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Reader source does not exist: {path}")
    completed = subprocess.run(
        [
            "pandoc",
            "--from=gfm+smart",
            "--to=html5",
            "--wrap=none",
            "--shift-heading-level-by=0",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    html = completed.stdout.strip()
    return re.sub(r"^<h1\b[^>]*>.*?</h1>\s*", "", html, count=1, flags=re.DOTALL)


def reading_stats(markdown: str) -> dict[str, int]:
    plain = re.sub(r"```.*?```", " ", markdown, flags=re.DOTALL)
    plain = re.sub(r"<[^>]+>|[#*_`>|\[\](){}-]", " ", plain)
    words = re.findall(r"\b[\w’'-]+\b", plain, flags=re.UNICODE)
    count = len(words)
    return {"words": count, "minutes": max(1, round(count / 220))}


def compile_layer(root: Path, relative: str) -> dict[str, object]:
    path = root / relative
    markdown = path.read_text(encoding="utf-8")
    converted = markdown_to_html(path)
    if re.search(r"<script\b", converted, flags=re.IGNORECASE):
        raise ValueError(f"Script element found in reader source: {path}")
    return {
        "html": converted,
        "stats": reading_stats(markdown),
        "canonicalPath": str(path),
    }


def route_for(book_id: str, chapter_id: str, layer: str) -> str:
    return f"{book_id}/{chapter_id}/{layer}"


def anchor_for(route: str) -> str:
    return f"doc-{route.replace('/', '-')}"


def link_label(text: str) -> str:
    escaped = html_lib.escape(text)
    return (
        '<span class="roll-w">'
        f'<span class="roll-t">{escaped}</span>'
        f'<span class="roll-t dup" aria-hidden="true">{escaped}</span>'
        "</span>"
    )


def render_navigation(books: list[dict[str, object]]) -> str:
    groups: list[str] = []
    for book in books:
        chapters = book["chapters"]
        first = chapters[0]
        first_route = route_for(str(book["id"]), str(first["id"]), "dossier")
        chapter_rows: list[str] = []
        for chapter in chapters:
            route = route_for(str(book["id"]), str(chapter["id"]), "dossier")
            pilot = '<span class="pilot-mark">DISTILLATION</span>' if chapter["distillation"] else ""
            chapter_rows.append(
                '<li>'
                f'<a class="chapter-link" href="#{anchor_for(route)}" data-route="{route}">'
                f'<span class="chapter-number">{html_lib.escape(str(chapter["number"]))}</span>'
                f'<span class="chapter-name">{html_lib.escape(str(chapter["title"]))}</span>'
                f'{pilot}'
                '</a>'
                '</li>'
            )
        groups.append(
            f'<section class="book-group book-group-{html_lib.escape(str(book["theme"]))}" data-book-group="{html_lib.escape(str(book["id"]))}">'
            '<div class="book-group-head">'
            f'<p>{html_lib.escape(str(book["register"]))}</p>'
            f'<a href="#{anchor_for(first_route)}" data-route="{first_route}" data-roll>{link_label(str(book["title"]))}</a>'
            f'<span>{html_lib.escape(str(book["status"]))}</span>'
            '</div>'
            f'<ol>{"".join(chapter_rows)}</ol>'
            '</section>'
        )
    return "\n".join(groups)


def render_layer_link(route: str, label: str, active: bool) -> str:
    current = ' aria-current="page"' if active else ""
    return (
        f'<a class="layer-link" href="#{anchor_for(route)}" data-route="{route}"{current} data-roll>'
        f'{link_label(label)}'
        '</a>'
    )


def prefix_fragment_ids(fragment: str, route: str) -> str:
    prefix = f"{anchor_for(route)}--"
    ids = re.findall(r'\bid="([^"]+)"', fragment)
    rewritten = fragment
    for identifier in ids:
        rewritten = rewritten.replace(f'id="{identifier}"', f'id="{prefix}{identifier}"')
        rewritten = rewritten.replace(f'href="#{identifier}"', f'href="#{prefix}{identifier}"')
    return rewritten


def render_document(book: dict[str, object], chapter: dict[str, object], layer_name: str) -> str:
    layer = chapter[layer_name]
    if not isinstance(layer, dict):
        raise TypeError(f"Missing {layer_name} layer for {book['id']}/{chapter['id']}")
    route = route_for(str(book["id"]), str(chapter["id"]), layer_name)
    dossier_route = route_for(str(book["id"]), str(chapter["id"]), "dossier")
    distillation_route = route_for(str(book["id"]), str(chapter["id"]), "distillation")
    distillation = chapter["distillation"]
    if distillation:
        distillation_control = render_layer_link(
            distillation_route,
            "Constructive distillation",
            layer_name == "distillation",
        )
    else:
        distillation_control = '<span class="layer-unavailable">Distillation · not yet developed</span>'

    if layer_name == "distillation":
        title = str(chapter.get("distillationTitle") or chapter["title"])
        eyebrow = f"{book['title']} · Chapter {chapter['number']} · Constructive distillation"
        status = "Interpretive learning instrument · source dossier remains authoritative"
        short_layer = "Constructive distillation"
    else:
        title = str(chapter["title"])
        eyebrow = f"{book['title']} · {chapter['kind']}"
        status = "Source-grounded chapter dossier" if book["id"] == "ai-2041" else "Initial structural pass · expandable during reading"
        short_layer = "Chapter dossier"

    stats = layer["stats"]
    return (
        f'<section class="reader-document theme-{html_lib.escape(str(book["theme"]))}" id="{anchor_for(route)}" '
        f'data-document data-route="{route}" data-book="{html_lib.escape(str(book["id"]))}" '
        f'data-chapter="{html_lib.escape(str(chapter["id"]))}" data-layer="{layer_name}" '
        f'data-canonical-path="{html_lib.escape(str(layer["canonicalPath"]), quote=True)}">'
        '<header class="document-head">'
        f'<p class="document-register">{html_lib.escape(eyebrow)}</p>'
        f'<p class="document-number" aria-hidden="true">{html_lib.escape(str(chapter["number"]))}</p>'
        f'<h1 tabindex="-1">{html_lib.escape(title)}</h1>'
        f'<p class="document-author">{html_lib.escape(str(book["author"]))}</p>'
        f'<p class="document-meta">{html_lib.escape(str(chapter["source"]))} · {html_lib.escape(short_layer)} · {stats["minutes"]} min</p>'
        '<details class="document-source">'
        '<summary>Source &amp; layer</summary>'
        f'<p>{html_lib.escape(status)}</p>'
        f'<code>{html_lib.escape(str(layer["canonicalPath"]))}</code>'
        '</details>'
        '<nav class="layer-switch" aria-label="Reading layers">'
        f'{render_layer_link(dossier_route, "Chapter dossier", layer_name == "dossier")}'
        f'{distillation_control}'
        '</nav>'
        f'<p class="evidence-boundary"><span>Evidence boundary</span>{html_lib.escape(str(book["evidenceBoundary"]))}</p>'
        '</header>'
        '<div class="document-reading-grid">'
        f'<article class="markdown-body">{prefix_fragment_ids(str(layer["html"]), route)}</article>'
        '</div>'
        '</section>'
    )


def render_documents(books: list[dict[str, object]]) -> str:
    documents: list[str] = []
    for book in books:
        for chapter in book["chapters"]:
            documents.append(render_document(book, chapter, "dossier"))
            if chapter["distillation"]:
                documents.append(render_document(book, chapter, "distillation"))
    return "\n".join(documents)


def replace_region(source: str, start: str, end: str, replacement: str) -> str:
    pattern = re.compile(
        rf"(?P<start>\s*<!-- {re.escape(start)} -->).*?(?P<end>\s*<!-- {re.escape(end)} -->)",
        flags=re.DOTALL,
    )
    matched = pattern.search(source)
    if not matched:
        raise RuntimeError(f"Could not locate generated region {start} → {end}")
    return pattern.sub(
        f'\n        <!-- {start} -->\n{replacement}\n        <!-- {end} -->',
        source,
        count=1,
    )


def public_payload(books: list[dict[str, object]]) -> dict[str, object]:
    public_books: list[dict[str, object]] = []
    for book in books:
        public_chapters: list[dict[str, object]] = []
        for chapter in book["chapters"]:
            public_chapter = {
                key: value
                for key, value in chapter.items()
                if key not in {"dossier", "distillation"}
            }
            for layer_name in ("dossier", "distillation"):
                layer = chapter[layer_name]
                public_chapter[layer_name] = (
                    {
                        "route": route_for(str(book["id"]), str(chapter["id"]), layer_name),
                        "anchor": anchor_for(route_for(str(book["id"]), str(chapter["id"]), layer_name)),
                        "stats": layer["stats"],
                        "canonicalPath": layer["canonicalPath"],
                    }
                    if layer
                    else None
                )
            public_chapters.append(public_chapter)
        public_books.append(
            {
                key: value
                for key, value in book.items()
                if key != "chapters"
            }
            | {"chapters": public_chapters}
        )
    return {
        "generatedAt": "2026-08-20",
        "books": public_books,
        "totals": {
            "books": len(public_books),
            "chapters": sum(len(book["chapters"]) for book in public_books),
            "distillations": sum(
                1
                for book in public_books
                for chapter in book["chapters"]
                if chapter["distillation"] is not None
            ),
        },
    }


def build() -> Path:
    if not SCHEMATICS.is_dir():
        raise FileNotFoundError(f"Canonical schematic root does not exist: {SCHEMATICS}")

    books: list[dict[str, object]] = []
    for book in BOOKS:
        canonical_root = SCHEMATICS / book["root"]
        chapters: list[dict[str, object]] = []
        for spec in book["chapters"]:
            chapter: dict[str, object] = {
                key: value
                for key, value in spec.items()
                if key not in {"dossier", "distillation"}
            }
            chapter["dossier"] = compile_layer(canonical_root, spec["dossier"])
            if distillation := spec.get("distillation"):
                chapter["distillation"] = compile_layer(canonical_root, distillation)
            else:
                chapter["distillation"] = None
            chapters.append(chapter)

        books.append(
            {
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "register": book["register"],
                "theme": book["theme"],
                "status": book["status"],
                "evidenceBoundary": book["evidenceBoundary"],
                "canonicalPath": str(canonical_root),
                "chapters": chapters,
            }
        )

    payload = public_payload(books)
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(
        "/* Generated by sync-reader-content.py from canonical Book Schematics. */\n"
        f"window.READER_LIBRARY = {serialized};\n",
        encoding="utf-8",
    )

    reader_path = ROOT / "reader.html"
    reader = reader_path.read_text(encoding="utf-8")
    reader = replace_region(reader, "READER_NAV_START", "READER_NAV_END", render_navigation(books))
    reader = replace_region(reader, "READER_CONTENT_START", "READER_CONTENT_END", render_documents(books))
    reader_path.write_text(reader, encoding="utf-8")
    return OUTPUT


if __name__ == "__main__":
    output = build()
    print(f"Built {output.name} ({output.stat().st_size:,} bytes)")
