---
layout: page
title: Cloud AI Trust Boundaries
description: Understand where enterprise AI data is processed, who operates each layer, and how hosting choices affect security and responsibility.
permalink: /topics/cloud-ai-trust/
---

“The model is in our cloud” does not, by itself, describe who can process a prompt, where inference runs, or which organisation is responsible for each part of the service. This guide collects practical ways to map **cloud AI trust boundaries** across the control plane, data plane, model provider, and customer environment.

## Map processing before choosing controls

Follow the prompt, uploaded files, retrieved data, outputs, logs, and support access through the service. Identify the legal entity and technical operator at every step, then verify retention, region, access, and incident terms against current product documentation and contracts.

- [Who Processes the Data? Trust, Responsibility, and AI Inference Beyond the Cloud]({% post_url 2026-05-13-who-processes-the-data-ai-trust-boundary %}) — a framework for separating control-plane and data-plane responsibilities.
- [Claude in Microsoft Foundry (GA): Two Hosting Paths, One Processor — and Why It Isn't Azure OpenAI]({% post_url 2026-07-01-microsoft-foundry-ga-claude-vs-azure-openai %}) — why a hosting option does not necessarily change the processor relationship.
- [Who Answers to the Regulator? Mapping the EU AI Act and CRA onto the Cloud AI Trust Boundary]({% post_url 2026-08-02-who-answers-to-the-regulator-ai-act-cra-trust-boundary %}) — connecting architecture boundaries with regulatory roles.

## Questions for an architecture review

- Which service receives each category of data, and which party operates it?
- Where does inference occur, and where can prompts, outputs, or diagnostic logs persist?
- Which personnel or subprocessors can access the data, under what controls, and for what support purpose?
- What does a “zero data retention” setting cover, and what does it exclude?
- How do region selection, backups, abuse monitoring, and service telemetry affect the data map?
- Which contract and technical control support each answer, and who revalidates it after a product change?

Treat vendor documentation and contract terms as time-sensitive evidence. Record the source and review date rather than relying on a product label or a one-time assessment.

**Related guides:** [AI governance and risk management](/topics/ai-governance/) · [Cryptography and TLS](/topics/cryptography-tls/) · [About the author and editorial policy](/about/)
