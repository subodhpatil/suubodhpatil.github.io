---
layout: page
title: "Speed Up Your Website: HTTP Combiner and Caching in ASP.NET"
date: 2011-03-01 00:00:00 +0530
permalink: /retrospective/speed-up-your-website/
categories: [Retrospective]
tags: [envision, decos, web-performance, asp-net, caching, http]
---

> **Originally published** in *Envision* — the internal magazine of Decos India, March 2011.
> Reproduced here as a personal archive. [View original ↗](https://envision-decosindia.blogspot.com/2011/03/speed-up-your-website.html){:target="_blank"}
>
> Note: this article reflects web development practices of 2011. Some tools and techniques (e.g. HTTPWatch, ASP.NET WebForms) have since evolved, but the core concepts of HTTP caching and request reduction remain valid.

---

[![Speed Up Your Website — Envision Decos India, March 2011](/assets/img/retrospective/envision-speed-up-website.jpg)]{: style="width:100%; border:1px solid #333; border-radius:6px; margin-bottom:1rem;"}

*By Subodh Patil*

If you Google keywords like website speed, performance, improvement you will get a lot of articles describing many ways to do this.

The question is: how easy is it to implement all of them in my project? Do I have the time and resources for this? My project has been running for the last few years — how do I incorporate all these changes now?

Believe me, I tried all these approaches on a project that had been running for over four years. You have code written by many developers, no architect controlling the way the project is developed. Every individual has their own way of development. In a large project it's not easy to manage or control the way each line is written. After a few years you find everything is a mess — even code written by yourself. "Is this what I wrote a few years back?" And then changing the code to improve speed seems daunting.

What we are going to talk about today is the **HTTP Combiner** and its implementation in ASP.NET. Non-.NET developers can still read this article as it talks more about concepts than actual code.

---

## Understanding What Happens When a Web Page Loads

To observe this, you will need a tool like **HTTPWatch** (basic edition is free). There are other tools like Fiddler as well.

On a typical first page load, a site like Microsoft.com might take around 9 seconds — downloading ~370 KB of data. Press F5 and it drops to ~6 seconds. Hit Enter (note: there is a difference between an F5 refresh and Enter) and it drops further to ~4 seconds.

Basic HTTP status codes relevant here:

| Code | Meaning |
|------|---------|
| **200 OK** | Standard successful response |
| **304 Not Modified** | Resource unchanged — client uses its cached copy |
| **404 Not Found** | Resource not found |

On the second and third page loads, many files that returned `200` now return `304`. For some you will see `(cache)` — no HTTP request at all, served from local cache.

---

## The Strategy: Reduce Requests, Cache Everything

- **Determine what is static vs dynamic.** Once deployed to production, JS/CSS/images rarely change between version releases.
- **Cache static assets aggressively** via response headers.
- **Combine multiple files** into single requests.

---

## Part 1: Asking the Browser to Cache Files

On the first request, set the Last-Modified header:

```csharp
context.Response.Cache.SetLastModified(DateTime.Now);
```

On the next request, inspect the incoming header:

```csharp
context.Request.Headers["If-Modified-Since"];
```

If the file hasn't changed, respond with 304:

```csharp
context.Response.Clear();
context.Response.StatusCode = 304;
context.Response.StatusDescription = "Not Modified";
return;
```

Every unchanged file will now return `304` from the second request onwards.

---

## Part 2: Combine All Files Into One Request

Within the USA, average network latency is ~70ms. A page with 4 JS and 3 CSS files wastes **490ms** before the page even starts rendering. Outside the USA at ~200ms latency, that is **1,400ms** of waiting.

The solution — combine all JS files (and separately CSS files) into a single request:

1. Read each file from disk, appending to a memory stream
2. Compress the combined byte array using GZIP
3. Send to the client in a single HTTP response with caching headers from Part 1

I built a control called **HTTP Combiner** that does all of this — 5 JS + 5 CSS files in a single HTTP request, cached by the browser.

---

## Part 3: CSS Sprites for Images

Images cannot be combined the same way. The best technique is **CSS Sprites** — combine many small images into one large image, then use CSS `background-position` to show the right portion. Read more at [CSS-Tricks: CSS Sprites](https://css-tricks.com/css-sprites/).

---

## Summary

1. **Cache files** — `Last-Modified` headers + `304` responses for unchanged assets
2. **Combine JS/CSS** — HTTP Combiner merges all files into one cached request
3. **CSS Sprites** — combine images, use CSS positioning
