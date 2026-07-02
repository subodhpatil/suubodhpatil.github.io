---
title: "Microsoft Foundry Goes GA: Same Processor, Two Hosting Paths — and Why Claude Still Isn't Azure OpenAI"
date: 2026-07-01 12:00:00 +0200
last_modified_at: 2026-07-01 12:00:00 +0200
categories: [CloudSecurity, AISecurity]
tags: [ai, azure, anthropic, openai, trust-boundary, data-protection, zero-data-retention, saas, governance, compliance]
description: "Microsoft Foundry reached general availability for Claude on June 29, 2026, adding a new Hosted on Azure option. Breaks down what actually changed, why Anthropic remains an independent data processor either way, and how that differs from Azure OpenAI's single-processor model — including who governs Zero Data Retention in each case."
---

> 🤖 **Short on time?** Copy this into ChatGPT, Copilot, Gemini, or Claude for an instant summary — or to decide if it's worth reading in full:
>
> `Summarize this article in 5 bullet points with key takeaways, and flag anything relevant to AI vendor risk, procurement, or governance decisions: https://blog.suubodhpatil.com/posts/microsoft-foundry-ga-claude-vs-azure-openai/`
{: .prompt-tip }

> **Also worth reading:** This post is a companion update to [Who Processes the Data? Trust, Responsibility, and AI Inference Beyond the Cloud](/posts/who-processes-the-data-ai-trust-boundary/) — read that one first for the full control-plane/data-plane framework this post builds on.

---

## Executive Summary

- **The core premise from the original post still holds:** Claude is always processed by Anthropic, regardless of which Microsoft Foundry hosting option you choose — Azure hosting changes where compute runs, not who processes your data.
- On June 29, 2026, Claude reached **general availability** on Microsoft Foundry with a new **Hosted on Azure** option — GPU inference, ingress, and API services now run inside Azure infrastructure, with a new US Data Zone for residency.
- The new option narrows the *infrastructure* gap between Claude and natively-Azure models, but **not the legal one**: Microsoft's own documentation states Anthropic remains the seller and operator of Claude and **"acts as an independent data processor for prompts and outputs"** under both hosting options.
- **Azure OpenAI is a fundamentally different category.** Microsoft classifies it as a "Model sold by Azure" — Microsoft is the sole processor, and OpenAI has contractually no access to your prompts or completions. Claude is a "Model from partners and community" — a Non-Microsoft Product — in both Foundry hosting modes.
- **Zero Data Retention is governed by different companies for each model.** For Claude, ZDR is an Anthropic DPA addendum that must be separately confirmed for Foundry; for Azure OpenAI, the equivalent — "Modified Abuse Monitoring" — is a Microsoft-only approval process with no third-party sign-off.
- The takeaway for the original post's evaluation checklist doesn't change: check who is named processor for prompts and completions, not just where the hardware sits.

---

## What Actually Changed on June 29, 2026

On June 29, 2026, Claude reached **general availability** on Microsoft Foundry. What was previously called "Foundry Preview" — Anthropic-hosted, outside Azure — is now formally named **Hosted on Anthropic Infrastructure**, and it's joined by a new sibling: **Hosted on Azure**. Under Hosted on Azure, Azure infrastructure performs request ingress, API services, and GPU inference (Anthropic's announcement specifically calls out NVIDIA GB300 GPUs), with data at rest kept in your selected Azure geography, including a new **US Data Zone** for residency-sensitive workloads. Supported regions at GA are **East US2** and **Sweden Central**.

| | Hosted on Anthropic Infrastructure (was "Foundry Preview") | Hosted on Azure (new, GA) |
|---|---|---|
| Where inference runs | Anthropic's own infrastructure, outside Azure | Azure infrastructure (Azure GPUs) |
| Region/residency enforcement | No — Anthropic routes globally | Yes, for the Azure geography/data zone selected |
| Feature/model availability | Full API feature set, broadest model access | Currently narrower; Microsoft states it's working toward parity |
| Data processor | Anthropic (independent) | Anthropic (independent) |

That last row is the one worth sitting with.

## Same Processor, New Address

It would be easy to read "Hosted on Azure" and assume the trust-boundary problem from the original post has been resolved — that Claude now behaves like a natively-Azure service. It hasn't, at least not legally. Microsoft's data-privacy documentation for Claude models states plainly:

> *"For both hosting options, Anthropic remains the seller and operator of Claude models in Microsoft Foundry and acts as an independent data processor for prompts and outputs associated with Claude models."* ([source](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/claude-models/data-privacy))

Split by component, here's what actually moved: under Hosted on Azure, Azure infrastructure now performs inference compute, request ingress, and API services. Anthropic continues to operate safety review and policy enforcement in both hosting modes, and remains the named data processor for prompts and completions either way. One nuance worth raising with legal rather than assuming resolved: Microsoft's documentation confirms Azure technically processes prompts and outputs during Hosted-on-Azure inference, but it does not spell out Azure's own processor or sub-processor status for that data — it simply states Anthropic is the independent processor "for both hosting options." That's a contractual gap, not a technical one, and it's worth a direct question to your Microsoft and Anthropic account teams.

Even under Hosted on Azure, "automatic safeguards flag content that might be sent to Anthropic Trust & Safety for review," and Anthropic personnel review flagged content on an exceptions basis. Deploying Claude in either mode still requires an Azure Marketplace subscription that constitutes acceptance of Anthropic's own Commercial Terms and DPA — the click-through contract the original post flagged as easy to miss.

So the original post's "Pattern A — Split Trust" now has two sub-variants rather than being replaced:

- **Pattern A1 (Hosted on Anthropic Infrastructure):** identical to what the original post described — no regional enforcement, dual DPA, data plane fully outside Azure.
- **Pattern A2 (Hosted on Azure):** infrastructure and residency now sit inside Azure's boundary, but the *contractual* structure is unchanged — Anthropic is still an independent processor, still subject to its own DPA, still able to review flagged content.

The model is not the trust boundary; the hosting choice is a residency decision, not a processor decision.

## Claude vs. Azure OpenAI: Two Different Categories, Not Two Flavors of the Same Thing

This is the comparison worth having with legal and procurement, because Microsoft's own taxonomy draws a hard line here — it isn't a matter of degree.

| | Azure OpenAI | Claude on Microsoft Foundry (either hosting option) |
|---|---|---|
| Microsoft's category | "Model sold by Azure" | "Model from partners and community" — Non-Microsoft Product |
| Data processor | Microsoft only | Anthropic (independent processor) |
| Model provider's access to your prompts | None — contractually walled off; Azure OpenAI "does NOT interact with any services operated by... OpenAI" | Anthropic processes prompts directly; can review flagged content |
| DPA governing prompts/completions | Single — Microsoft Products and Services DPA | Anthropic's Commercial Terms + DPA, on top of Microsoft's infra/billing DPA |
| Marketplace click-through to a third party | No | Yes |
| Base inference retention by default | Stateless — no prompts/completions stored in the model | Standard API terms retain interaction logs (30 days) unless ZDR is separately negotiated |

*(Both paths also generate standard Azure platform telemetry — API gateway logs, network logs, billing and usage records — as part of normal cloud operations. That operational telemetry is separate from, and not a substitute for, the model-level processor and retention questions addressed here.)*

To make the legal point explicit: **Claude on Microsoft Foundry is not covered under Microsoft's Azure OpenAI DPA — it is covered under Anthropic's own DPA and Commercial Terms**, in either hosting mode. The two DPAs are not interchangeable, and a vendor-risk assessment approved for one does not carry over to the other.

Two models can now run on the same Azure hardware, in the same region, and still sit on opposite sides of the "who processes my data" question. That's the sharpest evidence yet for the original post's core claim.

## Zero Data Retention: Who Actually Grants It

This is where the category difference becomes operational rather than theoretical.

**Azure OpenAI's equivalent is "Modified Abuse Monitoring."** It's a Microsoft-only process: a customer applies through a Microsoft Limited Access eligibility form, and once approved, Microsoft turns off the human-review data store used for abuse detection. Because base inference is already stateless, this is the only retention lever that exists — and Microsoft is the sole approver, operator, and auditee.

**Claude ZDR is adjudicated and approved by Anthropic, not Microsoft** — Foundry's role is purely as the marketplace and infrastructure wrapper. It's a separately negotiated agreement with Anthropic, and per Anthropic's own terms, it must be explicitly confirmed to apply to Foundry deployments specifically — a ZDR agreement in place for direct API use doesn't automatically extend to Foundry. This doesn't change under the new Hosted on Azure option: Anthropic, not Microsoft, is still who you'd negotiate with, and even under ZDR, Anthropic's User Safety classifier outputs are retained — an open question for GDPR personal-data classification that the original post already flagged.

If your organization is asking "can we get zero retention?" for both model families, you are asking two different vendors two different questions, governed by two different contracts, with two different audit trails.

## What This Means for Your Evaluation Checklist

Nothing about the original post's three-part evaluation framework — inference and residency, contracts and acceptance, controls and disclosure — needs to change. What changes is one input: when evaluating Claude on Microsoft Foundry, you now record *which hosting option* was selected, because it determines the residency answer, while the processor and ZDR-governance answers stay constant across both. Re-run the checklist at your next quarterly review, and update your sub-processor and DPA inventory to reflect the new hosting option.

---

## Key Takeaways

- Microsoft Foundry's GA for Claude adds real infrastructure choice (Hosted on Azure, with regional enforcement and a US Data Zone) but does not change who the data processor is — Anthropic, under both hosting options.
- Azure OpenAI and Claude on Microsoft Foundry are different categories in Microsoft's own documentation: "sold by Azure" (Microsoft-processed, provider has no data access) versus "partners and community" (independent third-party processor, marketplace click-through required).
- Zero Data Retention is not a single concept across vendors: for Azure OpenAI it's a Microsoft-approved configuration; for Claude it's an Anthropic contract that must be confirmed specifically for Foundry.
- Update sub-processor inventories and DPA records to note which Claude hosting option is in use for each deployment.

---

## References

- [Claude in Microsoft Foundry is now generally available — Anthropic](https://claude.com/blog/claude-in-microsoft-foundry)
- [Claude models in Microsoft Foundry — Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/claude-models)
- [Data, privacy, and security for Claude models in Microsoft Foundry — Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/claude-models/data-privacy)
- [Data, privacy, and security for Foundry Models sold by Azure — Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy)
- [Foundry Models sold by Azure abuse monitoring — Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/abuse-monitoring)
- [Anthropic Data Processing Addendum](https://www.anthropic.com/legal/data-processing-addendum)
- [Who Processes the Data? Trust, Responsibility, and AI Inference Beyond the Cloud](/posts/who-processes-the-data-ai-trust-boundary/)

---

## Disclaimer

This content reflects independent technical analysis based on publicly documented architecture and contractual terms as of the publication date. Cloud AI platform architectures, hosting arrangements, and contractual terms evolve frequently — readers should verify current documentation before making compliance or architectural decisions. This post does not represent the position of any cloud provider, model vendor, or employer.
