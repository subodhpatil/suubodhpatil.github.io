---
layout: page
permalink: /retrospective/speed-up-your-website/
title: "Speed Up Your Website: HTTP Combiner and Caching in ASP.NET"
date: 2011-03-01 00:00:00 +0530
categories: [Retrospective]
tags: [envision, decos, web-performance, asp-net, caching, http]
---
layout: page
permalink: /retrospective/speed-up-your-website/

> **Originally published** in *Envision* — the internal magazine of Decos India, March 2011.
> Reproduced here as a personal archive. Note: this article reflects web development practices of 2011. Some tools and techniques (e.g. HTTPWatch, ASP.NET WebForms) have since evolved, but the core concepts of HTTP caching and request reduction remain valid.

---
layout: page
permalink: /retrospective/speed-up-your-website/

*By Subodh Patil*

If you Google keywords like website speed, performance, improvement you will get a lot of articles describing many ways to do this.

The question is: how easy is it to implement all of them in my project? Do I have the time and resources for this? My project has been running for the last few years — how do I incorporate all these changes now?

Believe me, I tried all these approaches on a project that had been running for over four years. You have code written by many developers, no architect controlling the way the project is developed. Every individual has their own way of development. In a large project it's not easy to manage or control the way each line is written. After a few years you find everything is a mess — even code written by yourself. "Is this what I wrote a few years back?" And then changing the code to improve speed seems daunting.

What we are going to talk about today is the **HTTP Combiner** and its implementation in ASP.NET. Non-.NET developers can still read this article as it talks more about concepts than actual code.

---
layout: page
permalink: /retrospective/speed-up-your-website/

## Understanding What Happens When a Web Page Loads

To observe this, you'll need a tool like **HTTPWatch** (basic edition is free). There are other tools like Fiddler as well.

On a typical first page load, a site like Microsoft.com might take around 9 seconds to load — downloading ~370 KB of data. Press F5 and it drops to ~6 seconds. Hit Enter (note: there's a difference between an F5 refresh and Enter) and it drops further to ~4 seconds.

What's happening? Let's understand some basic HTTP status codes:

| Code | Meaning |
|------|---------|
| **200 OK** | Standard successful response |
| **304 Not Modified** | Resource unchanged since last request — client can use its cached copy |
| **404 Not Found** | Resource not found |

On the second and third page loads, you'll see that many JavaScript files, CSS files, and images that returned `200` on the first request now return `304`. For some, you'll see `(cache)` — meaning no HTTP request was sent at all; the browser served it from local cache.

---
layout: page
permalink: /retrospective/speed-up-your-website/

## The Strategy: Reduce Requests, Cache Everything

To improve web page performance the best method is to **reduce the number of requests** sent to and received from the server. A simple web page has many requests — mostly images, CSS, and JavaScript. The key insight:

- **Determine what is static vs. dynamic.** In my experience, once a site is deployed to production, JavaScript files, CSS files, and images rarely change unless you do a version upgrade — which shouldn't happen more than every couple of months.
- **Cache static assets aggressively** by setting appropriate response headers.
- **Combine multiple files** into single requests.

---
layout: page
permalink: /retrospective/speed-up-your-website/

## Part 1: Asking the Browser to Cache Files

The structure of a `200 HTTP` response looks like this:

```
HTTP/1.x 200 OK
Transfer-Encoding: chunked
Date: Sat, 28 Nov 2009 04:36:25 GMT
Server: LiteSpeed
Pragma: public
Expires: Sat, 28 Nov 2009 05:36:25 GMT
Cache-Control: max-age=3600, public
Content-Type: text/html; charset=UTF-8
Last-Modified: Sat, 28 Nov 2009 03:50:37 GMT
```

The key field is `Last-Modified`. On the first request, add this to your response:

```csharp
context.Response.Cache.SetLastModified(DateTime.Now);
```

On the next request from the same client, inspect the incoming header:

```csharp
context.Request.Headers["If-Modified-Since"];
```

Compare that date with the file on the server. If they match, tell the browser not to re-download it:

```csharp
context.Response.Clear();
context.Response.StatusCode = 304;
context.Response.StatusDescription = "Not Modified";
return;
```

Done. Every unchanged file will now return `304` from the second request onwards.

---
layout: page
permalink: /retrospective/speed-up-your-website/

## Part 2: Combine All Files Into One Request

You've reduced load time from the second request onwards. But what about the large number of first-time requests and the latency they add?

Within the USA, average network latency is ~70ms. A page with 4 JavaScript files and 3 CSS files wastes 7 × 70ms = **490ms** before the page even starts rendering. Outside the USA, at ~200ms latency, that becomes **1,400ms of waiting** — just for file requests.

**The solution:** combine all JS files (and separately, all CSS files) into a single request.

Here's the approach:

1. Read each file from disk one by one, appending to a memory stream
2. Compress the combined byte array using GZIP
3. Send it to the client in a single HTTP response
4. Apply the caching headers from Part 1 to this single combined request

I built a control called **HTTP Combiner** that does all of this. With it, 5 JS + 5 CSS files load in a single HTTP request, with caching enabled.

---
layout: page
permalink: /retrospective/speed-up-your-website/

## Part 3: CSS Sprites for Images

You can't combine images the same way as text files — images are structurally complex. The best technique is **CSS Sprites**: combine many small images into one large image, then use CSS `background-position` to display the right portion wherever needed.

This is primarily a CSS design technique. For more detail: [CSS-Tricks: CSS Sprites](https://css-tricks.com/css-sprites/)

---
layout: page
permalink: /retrospective/speed-up-your-website/

## Summary

Three things you can do to speed up your website:

1. **Cache files** — set `Last-Modified` headers and respond with `304` for unchanged assets
2. **Combine JS/CSS** — use HTTP Combiner to merge all files into one request, with caching
3. **CSS Sprites** — combine images into one file and use CSS positioning

These are not exhaustive — there are many more techniques — but these three have the most impact for the least disruption to an existing codebase. If you know better techniques or have implemented HTTP Combiner differently, I'd love to hear from you.
