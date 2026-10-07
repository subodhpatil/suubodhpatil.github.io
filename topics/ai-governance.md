---
layout: page
title: AI Governance and Risk Management
description: Practitioner guidance on AI risk ownership, governance systems, cloud AI trust boundaries, and the EU AI Act for enterprise teams.
permalink: /topics/ai-governance/
---

This guide brings together my writing on **enterprise AI governance**: how organisations assign responsibility for AI risk, assess systems in their real deployment context, and turn standards and regulation into operating controls. It is written from a security architecture perspective for governance leads, security teams, engineering leaders, and executives.

## Start with accountability

AI governance works when decision rights are explicit. A policy or committee cannot accept risk on behalf of a business owner. Start by naming who approves a use case, who owns its outcomes, and who can pause or retire it when the risk changes.

- [The Hardest Part of AI Governance Isn't AI. It's Risk Ownership]({% post_url 2026-09-02-hardest-part-of-ai-governance-risk-ownership %}) — why AI risk decisions stall when no one owns the decision.
- [The Digital Employee Nobody Hired: Why AI Agents Need Identities, Limits and an Off Switch]({% post_url 2026-10-03-from-zero-trust-to-agent-trust %}) — a governance framing for autonomous agents, their owners, permissions, oversight, and shutdown.

## Assess the whole system

The model alone is rarely the whole risk. Data flows, hosting, model providers, human oversight, and the business process all matter. Map those boundaries before deciding which controls or regulatory roles apply.

- [Who Processes the Data? Trust, Responsibility, and AI Inference Beyond the Cloud]({% post_url 2026-05-13-who-processes-the-data-ai-trust-boundary %}) — a control-plane and data-plane view of cloud AI processing.
- [Who Answers to the Regulator? Mapping the EU AI Act and CRA onto the Cloud AI Trust Boundary]({% post_url 2026-08-02-who-answers-to-the-regulator-ai-act-cra-trust-boundary %}) — how deployment choices relate to provider and deployer responsibilities.
- [Claude in Microsoft Foundry (GA): Two Hosting Paths, One Processor — and Why It Isn't Azure OpenAI]({% post_url 2026-07-01-microsoft-foundry-ga-claude-vs-azure-openai %}) — a concrete comparison of hosting and processor boundaries.

## A practical review checklist

For each AI use case, record its purpose and affected people; the accountable business owner; the data and model providers involved; the system's risk classification and supporting evidence; human review and escalation paths; monitoring and change triggers; and who can suspend it. Revisit the assessment when the model, data, provider, or business purpose changes.

These articles are independent practitioner analysis, not legal advice. For regulatory decisions, consult the applicable primary text and qualified counsel.

**Related guides:** [Cloud AI trust boundaries](/topics/cloud-ai-trust/) · [Cryptography and TLS](/topics/cryptography-tls/) · [About the author and editorial policy](/about/)
