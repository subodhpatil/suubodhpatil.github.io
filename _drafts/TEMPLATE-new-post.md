---
title: "TITLE — same phrasing style as existing posts: descriptive, colon-split, practitioner-focused"
date: YYYY-MM-DD 12:00:00 +0200
categories: [CategoryOne, CategoryTwo]
tags: [tag-one, tag-two, tag-three]
mermaid: true   # remove this line if the post has no diagrams
description: "A plain-language, 2-line summary of what this article actually covers. No AI-prompt text, no TL;DR framing — this is what shows up in the homepage post list and link previews."
---

<!--
  BLOG TEMPLATE — kept in _drafts/ so Jekyll never publishes it (files here need a
  date-prefixed filename in _posts/ to build). Copy this file into _posts/ as
  YYYY-MM-DD-post-slug.md, fill it in, then delete this comment block.

  Standard structure for every post on this site, top to bottom:
    1. Front matter — including `description:` (drives the homepage summary, see below)
    2. AI-summary prompt block (below) — always present, always first in the body
    3. Optional context line — "Series:", "Written for:", or "Also worth reading:"
    4. Horizontal rule
    5. Executive Summary (5 bullets)
    6. Horizontal rule
    7. Body (Introduction, sections, diagrams, conclusion)
-->

> 🤖 **Short on time?** Copy this into ChatGPT, Copilot, Gemini, or Claude for an instant summary — no need to read the whole thing:
>
> `Summarize this article in 5 bullet points with key takeaways, and flag anything a cloud/security architect should act on: https://blog.suubodhpatil.com/posts/POST-SLUG/`
{: .prompt-tip }

> **Written for:** who this post is for (or use **Series:** for multi-part posts, or **Also worth reading:** to cross-link related posts).

---

## Executive Summary

- Bullet 1 — the single most important claim of the post, stated precisely enough to stand alone.
- Bullet 2 — a second key fact or finding, with a concrete detail (a number, a named control, a named standard).
- Bullet 3 — a nuance or common misconception the post corrects.
- Bullet 4 — a compliance/governance angle if relevant (PCI DSS, GDPR, HIPAA, ISO 27001, etc.).
- Bullet 5 — the practical takeaway or decision framework the reader should walk away with.

---

## Introduction

Open with a concrete hook (an incident, a stat, a scenario) before generalizing to why this topic matters. End the introduction with a one-sentence roadmap of what the post covers.

## [Body sections — as many as needed]

Use `##` for major sections and `###` for subsections. Use mermaid diagrams (` ```mermaid `) for flows/sequences where they clarify more than prose. Use tables for comparisons (e.g., key-management models, TLS versions).

## Conclusion / Key Takeaways

Close with a short, practitioner-facing summary — what to decide, what to check, what to ask a vendor or auditor.

---

## Notes for whoever fills this in

- Always fill in `description:` in the front matter with a real, plain-language 2-line summary. Chirpy's home page, RSS feed, and SEO meta tags all read `description:` — not Jekyll's built-in `excerpt:`. Without it, Chirpy auto-generates the preview from the first bit of body content, which is the AI-summary prompt block, not something a human should see on the homepage.
- Replace `POST-SLUG` in the AI-summary prompt with the exact permalink slug (matches the filename after the date, e.g. `2026-06-17-how-https-actually-works.md` → slug `how-https-actually-works`).
- Keep the `{: .prompt-tip }` line directly under the blockquote with no blank line in between — that's Chirpy's IAL syntax for the colored tip box.
- Keep the AI-summary block as the very first thing after front matter, even before the Series/Written-for line — it's the "if you're not going to read this, at least do this" shortcut.
