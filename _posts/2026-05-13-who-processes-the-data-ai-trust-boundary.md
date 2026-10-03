---
title: "Who Processes the Data? Trust, Responsibility, and AI Inference Beyond the Cloud"
date: 2026-05-13 12:00:00 +0200
last_modified_at: 2026-06-29 12:00:00 +0200
categories: ["AI Risk & Governance", "Cloud AI Trust Boundaries"]
tags: [ai, azure, trust-boundary, data-protection, saas, governance, compliance]
mermaid: true
description: "Breaks down the split between the control plane and data plane in cloud AI platforms, showing how the same model can carry very different trust profiles depending on where inference actually runs. Looks at the limits of Zero Data Retention and why trust-boundary review has to be an ongoing process, not a one-time audit."
faq:
  - q: "Is Anthropic a Microsoft sub-processor when I use Claude in Azure AI Foundry?"
    a: "No. In Azure AI Foundry, Anthropic is an independent data processor for prompts and completions under its own data-processing terms, alongside Microsoft's DPA for the platform layer. In Microsoft 365 Copilot, by contrast, Anthropic appears on Microsoft's sub-processor list — a different contractual structure for the same model."
  - q: "What is the difference between the control plane and the data plane in a cloud AI platform?"
    a: "The control plane is the API surface, identity, quota, billing and deployment management — operated by the cloud provider. The data plane is where inference actually runs on your prompts. Trust, contracts and controls can differ between the two, and they may belong to different companies."
  - q: "Does selecting an Azure region keep my prompts in that region when I use Claude?"
    a: "Not automatically. Region selection constrains Azure-operated resources. Where inference runs on model-provider infrastructure, the region choice does not bind it; check the specific hosting option and the service documentation for where prompts are processed."
  - q: "Do customer-managed keys (CMK) protect prompts sent to a third-party model?"
    a: "No. CMK protects data at rest in Azure-operated services. It does not extend to inference performed on the model provider's infrastructure, where prompts are processed in memory under the provider's own controls."
  - q: "What does Zero Data Retention (ZDR) cover — and what does it not?"
    a: "ZDR means the inference provider does not persist prompts and completions after the request completes. It does not change who the processor is, does not cover logs you create yourself, and must be granted by the entity that actually operates inference — which is why \"who grants ZDR\" differs by platform."
  - q: "Which trust pattern applies to Claude on AWS Bedrock or Google Vertex AI?"
    a: "Pattern B — Unified Trust. The cloud provider operates both the control plane and inference under a single DPA; you have no separate processing relationship with Anthropic for your data."
  - q: "How do I find out who actually processes my prompts?"
    a: "Read the service-specific DPA to see who is named as processor for prompts and completions; confirm the hosting option in use; check whether deploying the model triggered click-through acceptance of the model provider's terms. Do not rely on a global sub-processor list — it tells you who *may* process, not who is responsible."
  - q: "How often should an AI trust-boundary review be repeated?"
    a: "Treat it as a recurring governance process: at minimum quarterly, and whenever a hosting option, sub-processor list, DPA, or region availability changes. The evaluation questions stay stable; the answers do not."
---

<style>
details.post-intro-details {
  margin-bottom: 1.5rem;
}
details.post-intro-details > summary {
  font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
  user-select: none;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}
details.post-intro-details > summary:hover {
  opacity: 0.7;
}
details.post-intro-details > summary::marker {
  content: "";
}
details.post-intro-details > summary::before {
  content: "▶";
  display: inline-block;
  font-size: 0.8em;
  transition: transform 0.3s ease;
  margin-right: 0.3rem;
}
details.post-intro-details[open] > summary::before {
  transform: rotate(90deg);
}
</style>

<details class="post-intro-details">
<summary>Short on time? >></summary>

<blockquote class="prompt-info">
<p><strong>In short:</strong> In cloud AI platforms the <em>control plane</em> (API, identity, billing — run by the cloud provider) and the <em>data plane</em> (inference — where your prompts are actually processed) can belong to different companies under different contracts. The same model therefore carries different trust profiles on different platforms: Claude in Azure AI Foundry is processed by Anthropic under a separate DPA (split trust); Claude in AWS Bedrock or GCP Vertex is processed by the cloud provider (unified trust); Claude in M365 Copilot reaches Anthropic as a Microsoft sub-processor. Region selection, customer-managed keys and data-boundary commitments do not automatically extend across that boundary. <strong>The model is not the trust boundary — the platform is.</strong></p>
</blockquote>

<blockquote>
<p><strong>Written for:</strong> CISOs, cloud architects, privacy teams, and SaaS vendors evaluating AI vendor trust and data processing responsibility.</p>
</blockquote>

<blockquote class="prompt-warning">
<p>📌 <strong>Update — July 2026:</strong> On June 29, 2026, Claude reached <strong>general availability</strong> on Microsoft Foundry, adding a second hosting option — <strong>Hosted on Azure</strong> — alongside the original <strong>Hosted on Anthropic Infrastructure</strong> path (formerly "Foundry Preview") described below. Under Hosted on Azure, request ingress, API services, and GPU inference can now run inside Azure's infrastructure, with data at rest in your selected Azure geography and a new US Data Zone. That narrows the <em>infrastructure</em> gap this post describes — but not the <em>legal</em> one: Microsoft's own documentation confirms <strong>"Anthropic remains the seller and operator of Claude models... and acts as an independent data processor for prompts and outputs"</strong> under both hosting options. The dual-DPA reality below still holds; it now has two variants instead of one, and it still looks nothing like Azure OpenAI's single-processor model. Full breakdown, including Zero Data Retention governance for each case, in the companion post: <a href="/posts/microsoft-foundry-ga-claude-vs-azure-openai/">Microsoft Foundry Goes GA: Same Processor, Two Hosting Paths — and Why Claude Still Isn't Azure OpenAI</a>.</p>
</blockquote>

</details>

## Introduction

In 2026, the cloud you authenticate with is no longer the cloud that processes your data.

For most of cloud computing's history, a straightforward assumption held: the provider you authenticated with was the entity processing your data. One vendor, one contract, one Data Processing Addendum. Compliance decisions, privacy notices, and audit responses were built on this foundation. It worked because cloud services were vertically integrated — the company managing your API was the same company running the compute that touched your data.

AI has quietly disaggregated that model.

This split is not unprecedented — control and data plane separation has long existed in SaaS architectures and payment processing pipelines. But AI makes it more acute for three reasons: prompts routinely contain unstructured sensitive data that is hard to sanitise before transmission; the inference layer is largely opaque, making it difficult to audit what happens inside; and a single model provider like Anthropic is now simultaneously deployed across Azure AI Foundry, AWS Bedrock, and GCP Vertex AI — each under a different hosting arrangement, a different DPA, and a different trust profile. Procurement decisions made for one platform do not carry over to another.

When you access a foundation model through a major cloud platform today, you may be dealing with two entirely separate companies processing your data — under different contracts, in different locations, with different sub-processors. The cloud provider manages the front door. A third party may handle everything that happens inside. And this split is not always visible from the API surface or the billing dashboard.

This post examines where that boundary forms, why it matters, and — more importantly — how to evaluate it for any model, on any platform, at any point in time. The specific answers will keep changing as cloud providers evolve their AI strategies. The framework for asking the right questions will not.

---

## The Structural Split: Control Plane vs. Data Plane

In traditional cloud services, the provider controls both layers of the stack:

- The **control plane** — API endpoints, authentication, request routing, billing, and metering
- The **data plane** — the actual execution environment where your data is processed

These two layers sitting within the same provider's boundary is what made cloud compliance tractable. Your Azure region selection, your AWS VPC, your GCP DPA — all of these controlled both layers simultaneously.

Modern cloud AI platforms have broken this assumption. The control plane often remains with the cloud provider. But the data plane — where your prompt is tokenised, processed by the model, and a completion generated — may operate on infrastructure owned and managed by an entirely different company.

When these two layers split across different companies, the consequences are significant:

- The cloud provider's DPA may cover only the control plane
- Cloud region selection may constrain routing, not inference location
- Security controls you have enabled may not extend to the inference environment
- You may have a direct contractual relationship with the model provider that your legal team has never reviewed
- Your sub-processor disclosures to customers may be incomplete

None of this is hypothetical. It is the documented, contractual reality of several major cloud AI integrations today.

> **GDPR note for engineers:** Under GDPR, a *processor* processes personal data on behalf of the data controller (your organisation); a *sub-processor* is engaged by the processor to carry out specific tasks. When Anthropic is Microsoft's sub-processor (as in M365 Copilot), your compliance obligations flow through Microsoft — you audit Microsoft, and Microsoft audits Anthropic on your behalf. When Anthropic is a direct, independent processor (as in Azure AI Foundry), you have a separate legal relationship with Anthropic that your organisation must manage directly. Two further patterns exist at the edges: *joint controllers*, where two entities independently determine the purposes of processing and both bear direct GDPR obligations to you — uncommon in standard AI inference but possible in co-developed integrations; and *delegated processing*, where the cloud provider acts as a technical intermediary under the model provider's contractual terms rather than as a processor in their own right — an arrangement not always visible in standard sub-processor lists.

---

## Same Model, Different Trust: Why Platform Choice Determines Your Risk

The clearest illustration of this problem is to trace what happens when the same model is accessed through different cloud platforms. The model's capabilities are identical. The trust profile is not.

| Platform | Who hosts inference | Contractual structure | Does cloud region constrain inference? |
|---|---|---|---|
| **Azure AI Foundry** (Claude) | Anthropic — outside Azure | Dual DPA: Microsoft (infra) + Anthropic (inference) | No — Anthropic routes globally |
| **AWS Bedrock** (Claude) | AWS — inside AWS | AWS DPA primary + Anthropic terms | Yes |
| **GCP Vertex AI** (Claude) | Google — inside GCP | Single DPA: Google only | Yes — hard regional enforcement |
| **M365 Copilot** (Claude) | Anthropic — outside Azure, on AWS/GCP infra | Microsoft DPA umbrella (Anthropic = MS sub-processor) | Partial — EU Data Boundary exclusions apply |
| **Azure OpenAI** (GPT — for contrast) | Microsoft — inside Azure | Single DPA: Microsoft only | Yes |

The same Claude model. Four different trust architectures. The platform you choose determines where inference runs, which contract governs your prompts, whether your region selection has any effect, and who bears data processing responsibility. The Azure OpenAI row shows GPT as a contrast — Azure *does* fully host that model, making data residency clean. Claude on Azure AI Foundry has no equivalent.

At the trust boundary, several things change simultaneously: TLS is re-terminated under a different certificate authority; audit logs switch retention policies and jurisdictional coverage; and the contractual basis for data processing shifts from one DPA to another. The diagram below shows where that boundary sits for each platform.

```mermaid
flowchart TD
    App["Your Application\nSends a Prompt"]

    App --> AzF_CP
    App --> GCP_ALL
    App --> AWS_ALL
    App --> M365_MS

    subgraph AzF["Azure AI Foundry - Azure boundary"]
        AzF_CP["Azure Control Plane\nAPI - Auth - Billing"]
        TB1(["Trust Boundary\nData leaves Azure here"])
        AzF_CP --> TB1
    end

    AzF_DP["Anthropic Infrastructure\nInference - Global routing\nAnthropic DPA governs\nOutside Azure"]
    TB1 --> AzF_DP

    subgraph GCP["GCP Vertex AI - Claude"]
        GCP_ALL["Google Infrastructure\nControl and Inference\nData stays in GCP\nSingle DPA"]
    end

    subgraph AWS["AWS Bedrock - Claude"]
        AWS_ALL["AWS Infrastructure\nControl and Inference\nData stays in AWS\nSingle DPA"]
    end

    subgraph M365["M365 Copilot - Claude"]
        M365_MS["Microsoft Processor"]
        TB2(["Sub-processor boundary"])
        M365_ANT["Anthropic\nSub-processor under MS DPA"]
        M365_MS --> TB2 --> M365_ANT
    end
```

---

## Deep Dive: Azure AI Foundry and Anthropic Claude

Azure AI Foundry is the most instructive case study because the trust boundary is explicitly documented by Microsoft itself.

> *"The API gives you access to the model that Anthropic service hosts and manages."* ([source](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/claude-models/data-privacy))

> *"When you transact for Claude in Foundry, you will agree to Anthropic's terms of use and Anthropic (not Microsoft) is the processor of the data."* ([source](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/claude-models/data-privacy))

There is no ambiguity here. Azure AI Foundry is an API gateway, an authentication layer, and a billing mechanism. Inference runs on Anthropic-managed infrastructure outside Microsoft Azure. Azure region selection does not constrain where Anthropic processes prompts — Anthropic's infrastructure spans multiple geographies and routes requests dynamically.

```mermaid
flowchart TB
    subgraph CP["Azure AI Foundry - Microsoft"]
        B[API Endpoint]
        C[Authentication]
        D[Request Routing]
        E[Billing and Telemetry]
        B --> C --> D --> E
    end

    A["Your Application\nPrompts and Context"] --> B
    TB(["Trust Boundary\nPrompt crosses here"])
    E --> TB

    subgraph DP["Anthropic Infrastructure"]
        F[Model Hosting]
        G[Prompt Processing]
        H[Inference]
        I[Response Generation]
        F --> G --> H --> I
    end

    TB --> F
    I --> B
    B --> A
```

### Two Contracts, Two Scopes

This architecture produces a dual-DPA reality. Both contracts are in force simultaneously, but they govern entirely different parts of the data flow.

**Microsoft DPA** governs: the Foundry API infrastructure, authentication metadata, usage telemetry, and billing records.

**Anthropic DPA** governs: user prompts, model completions, and any personal data contained within AI interactions.

Strengthening your contractual position with Microsoft — through enterprise agreements, DPA amendments, or compliance addenda — does not change what happens to your prompts after they cross into Anthropic's environment.

### What Security Controls Do Not Cover

**Customer Managed Keys (CMK):** CMK via Azure Key Vault covers data stored within Azure — project files, evaluation artefacts, uploaded documents. It does not apply to prompts or completions processed by Anthropic's infrastructure. Organisations enabling CMK believing it gives full cryptographic control over AI interactions are working with an incomplete picture.

**EU Data Boundary (as of May 2026):** Microsoft's EU Data Boundary programme currently excludes Claude models across Azure AI Foundry, M365 Copilot, Copilot Studio, and Power Platform. EU-based organisations cannot rely on this commitment for prompt and inference data.

**Azure sovereign cloud deployments:** Azure Government and other sovereign cloud variants provide infrastructure isolation within Azure's boundary. That isolation does not extend to Anthropic's inference environment.

### The Contract You May Not Know You Signed

Accepting the Azure Marketplace terms when enabling Claude in Foundry constitutes click-through acceptance of [Anthropic's Commercial Terms](https://www.anthropic.com/legal/commercial-terms) and [Data Processing Addendum](https://www.anthropic.com/legal/data-processing-addendum). A direct contractual relationship between your organisation and Anthropic is created automatically — often without the involvement of legal or procurement teams. This is worth auditing.

### Data Retention and Zero Data Retention

Under standard terms, Anthropic retains API interaction logs for 30 days. Enterprise customers can negotiate a Zero Data Retention (ZDR) addendum ([Anthropic DPA](https://www.anthropic.com/legal/data-processing-addendum)), under which prompts and completions are not stored after the response is returned. ZDR requires a separately executed agreement and must be confirmed for Foundry deployments specifically.

One important nuance: even under ZDR, Anthropic retains outputs from its User Safety classifier — the component that evaluates prompts for policy violations such as harmful content or jailbreak attempts. These outputs persist after the underlying prompts are erased. Whether they constitute personal data under GDPR is an open compliance question that requires legal review.

---

## Three Architectural Patterns

Across today's cloud AI platforms, three distinct trust architectures emerge. I refer to them as the **Cloud AI Trust-Boundary Patterns**. A *trust boundary* in cloud AI is the point at which prompts and completions leave the infrastructure and contract of one legal entity and enter another's; the pattern is determined by who operates the inference data plane and under which data-processing agreement — not by which model you chose. Understanding which pattern applies is the first step in evaluating any integration.
{: #cloud-ai-trust-boundary-patterns }

- **Pattern A — Split Trust:** control plane and inference are operated by different companies under two separate DPAs (e.g. Claude in Azure AI Foundry).
- **Pattern B — Unified Trust:** the cloud provider operates both planes under a single DPA (e.g. Claude in AWS Bedrock or GCP Vertex AI).
- **Pattern C — Sub-processor Chain:** inference runs outside the cloud, but under the SaaS provider's umbrella DPA with the model provider as sub-processor (e.g. Claude in M365 Copilot).

**Table — Cloud AI Trust-Boundary Patterns compared: who hosts inference, DPA structure, your relationship with the model provider, and whether region selection constrains inference.**

| | Pattern A — Split Trust | Pattern B — Unified Trust | Pattern C — Sub-processor Chain |
|---|---|---|---|
| **Example** | Azure AI Foundry (Claude) | GCP Vertex AI, AWS Bedrock (Claude) | M365 Copilot (Claude) |
| **Who hosts inference** | Model provider — outside cloud | Cloud provider — inside cloud | Model provider — outside cloud |
| **DPA structure** | Dual DPA — two separate contracts | Single DPA — one contract | Single DPA — MS umbrella covers chain |
| **Your relationship with model provider** | Direct and independent | None — cloud provider is sole processor | Via Microsoft — Anthropic is sub-processor |
| **Does region selection constrain inference?** | No | Yes — hard enforcement | Partial — EU exclusions apply |

**Pattern A — Split Trust** is the Azure AI Foundry architecture. The cloud provider handles the control plane; the model provider independently handles inference under a separate DPA. Two contracts, two processors, two audit relationships.

**Pattern B — Unified Trust** describes GCP Vertex AI and AWS Bedrock. On GCP (as of May 2026), Claude is fully managed within Google's infrastructure. Requests go to Google Vertex AI endpoints — data never reaches Anthropic. Regional endpoints enforce hard data residency backed by infrastructure, not routing preference. [Google's sub-processor list](https://cloud.google.com/terms/subprocessors) does not include Anthropic, which is the contractual proof. AWS Bedrock follows the same pattern — AWS hosts and serves Claude under a single AWS DPA.

**Pattern C — Sub-processor Chain** is the M365 Copilot model, covered in detail in the next section.

**A word of caution on Pattern B:** "fully hosted" should not be read as "fully governed." It is worth asking whether AWS sends model telemetry or weight-update metrics back to Anthropic, and whether Google uses any third-party compute paths outside GCP's contractual boundary. If you cannot find a documented answer, that is a vendor questionnaire item, not a safe assumption. Use this checklist to verify:

- Does the cloud provider's sub-processor list for this specific service include the model developer?
- Does the cloud DPA explicitly state the provider processes inference data — not just infrastructure metadata?
- Does the model provider's privacy policy contain "usage data" or "service improvement" clauses that could allow telemetry flows?
- Has the model provider confirmed in writing that no inference data is returned to them in this hosting arrangement?

Vendor documentation changes. "Fully hosted" is a technical description, not a perpetual contractual guarantee. Even in fully hosted deployments, some model providers embed "service improvement" clauses in their terms that permit statistical telemetry to flow back to the model developer — check the model provider's privacy policy for such language even when the cloud provider hosts the model entirely.

**The model is not the trust boundary. The platform is.** Choosing a model and choosing a platform are separate decisions with separate trust implications.

---

## The M365 Copilot Nuance

M365 Copilot with Claude (as of May 2026) presents Pattern C — the sub-processor chain. Anthropic still hosts the inference on its own infrastructure (running on AWS/GCP datacenters), but the contractual structure is fundamentally different from Azure AI Foundry: Anthropic operates as a sub-processor *of Microsoft*, sitting under Microsoft's DPA umbrella rather than as a direct, independent processor.

This distinction has concrete governance implications:

| Governance dimension | Azure AI Foundry (Claude) | M365 Copilot (Claude) |
|---|---|---|
| **Your processor** | Anthropic — direct, independent | Microsoft — Anthropic is their sub-processor |
| **Liability** | Split: Microsoft for infra, Anthropic for inference | Microsoft bears full processor accountability |
| **Audit rights** | Audit Microsoft for infra; audit Anthropic separately under Anthropic DPA | Audit Microsoft; Microsoft audits Anthropic on your behalf |
| **Data residency** | Anthropic routes globally; Azure region has no effect | EU Data Boundary exclusions still apply |
| **Breach notification** | Two separate obligations, two timelines | Microsoft's 72-hour GDPR obligation covers the full chain |

From a GDPR perspective, an organisation using M365 Copilot deals with Microsoft as their processor — not with Anthropic directly. This simplifies the contractual relationship but does not eliminate the underlying architectural reality: inference still occurs outside Microsoft's infrastructure, and the EU Data Boundary exclusions that apply to Azure AI Foundry apply here too.

On breach notification, the sub-processor chain has a concrete implication: Microsoft's 72-hour GDPR notification obligation covers the full chain. In practice this means that if Anthropic detects a breach, they must notify Microsoft, and Microsoft must notify you — your 72-hour clock starts from when Microsoft becomes aware, not from when Anthropic does. Organisations should confirm with Microsoft how quickly Anthropic is contractually required to notify them, since a delay in that upstream notification compresses your own response window. This is a governance point worth raising during vendor review.

---

## The Evolving Landscape

The specific state of each platform in this post reflects documentation available in mid-2026 — and it will continue to change.

Microsoft has been developing regional data zone support for Claude in Foundry. EU data zone availability has been on the roadmap, which would bring inference residency controls closer to what GCP and AWS currently offer. If native hosted deployments of third-party models become available within Azure's infrastructure boundary, the dual-DPA structure described here would no longer apply.

**Any specific answer to "where does my data go?" has an expiry date.** Governance decisions need to be revisited when a service moves from preview to GA, when a cloud provider updates its sub-processor list, when a model gains a new regional deployment, or when a provider announces a hosting architecture change. Critically, cloud providers sometimes change hosting arrangements without prominent announcements — a model hosted natively in GCP today may be routed differently in a future update. Monitoring sub-processor list change notices and DPA revision dates is the most reliable early warning signal; do not assume that an answer verified six months ago is still current.

---

## How to Evaluate Your Trust Boundary

For any AI model integration — on any platform, at any point in time — three areas of inquiry determine the actual trust profile.

**Inference and residency:**
- Who physically hosts the model — the cloud provider or the model developer? Is this explicitly documented?
- Does the cloud provider's DPA name them as the data processor for prompts and completions, or does it defer to a third party?
- Does cloud region selection constrain where inference runs, or only where the API endpoint operates?
- Is this model explicitly included in or excluded from the cloud provider's data boundary programme?

**Contracts and acceptance:**
- How many DPAs govern this data flow? Which one covers prompts and completions specifically?
- Has your organisation reviewed and accepted the model provider's terms? Through what mechanism, and when?
- If there is a click-through acceptance path, has your legal team reviewed what was accepted?
- Which entities must be disclosed to your customers as sub-processors under GDPR Article 28?

**Controls and disclosure:**
- Do encryption controls extend to the inference environment, or only to data stored in the cloud provider's storage layer?
- What is the model provider's data retention period? Is ZDR available, activated, and confirmed for this specific integration?
- Does your privacy notice accurately describe where inference actually occurs?
- Have you cross-checked both the cloud provider's and model provider's sub-processor lists?

---

## Governance Process

Treat AI trust boundary evaluation as a governance process, not a one-time audit.

**Assign ownership:** Legal, security, and procurement all need input. Legal reviews DPA coverage; security verifies the technical boundary; procurement confirms the contractual path matches the vendor's actual architecture. One function should own the decision trail.

**Establish a review cadence:** Re-evaluate quarterly, and ad-hoc whenever a provider announces a service update, regional deployment, sub-processor list change, or shift from preview to GA. The answers from six months ago may no longer be correct.

**Document the decision trail:** For each AI integration, record who evaluated the boundary, when, which documentation they relied on, and what conclusion they reached. This is what auditors will ask for.

---

## Conclusion

The trust boundary question will not stay answered. As models shift between hosting arrangements, as cloud providers build native inference capacity, and as regulators catch up to multi-party AI architectures, the specific answers in this post will change. The discipline should not. Ask who physically processes your data, under which contract, and what controls actually reach that environment. Then ask again next quarter. The framework is stable even when the answers are not. In AI, the model is not the trust boundary — the platform is.

---

## Key Takeaways

- Cloud AI platforms frequently separate the control plane (API, auth, billing) from the data plane (inference). These two layers may belong to entirely different companies under different contracts.
- The same model operates under fundamentally different trust profiles depending on the platform — demonstrated by Claude's different architectures across Azure AI Foundry, GCP Vertex AI, AWS Bedrock, and M365 Copilot.
- Cloud region selection, Customer Managed Keys, and data boundary commitments may not extend to third-party model inference. Each control needs to be evaluated against what it actually covers.
- Contractual acceptance of model provider terms can occur automatically through cloud marketplace click-through. Audit which AI model agreements are in force and how they were accepted.
- The specific answers will change as platforms evolve. The evaluation process — who hosts the model, which DPA governs inference, what do controls actually reach — remains constant.

---

> 💡 **Pro Tip:** The sub-processor list is a starting point, not a trust boundary map — Anthropic appears on Microsoft's list for M365 Copilot, yet inference still runs on Anthropic infrastructure outside Azure. To find the actual boundary, check the service-specific DPA for who is named as processor for prompts and completions, and verify whether deploying the model triggered click-through acceptance of the model provider's own terms. Remember: cloud providers often maintain multiple sub-processor lists — global, service-specific, and product-specific — which can contradict each other; only the service-specific list is authoritative for a given integration, lists may lag behind actual architecture changes, and neither substitutes for reading the service-level DPA — the rule is simple: list = who *may* process, DPA = who is *responsible*, architecture = where data *actually* goes.

{% include ai-selector-init.html %}

---

{% include faq.html %}

---

## References

- [Azure AI Foundry — Claude Models Data Privacy](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/claude-models/data-privacy)
- [Azure AI Foundry Models Overview](https://learn.microsoft.com/en-us/azure/foundry-classic/concepts/foundry-models-overview#models-from-partners-and-community)
- [Microsoft Products and Services Data Protection Addendum](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA)
- [Anthropic Data Processing Addendum](https://www.anthropic.com/legal/data-processing-addendum)
- [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms)
- [Anthropic Trust Center](https://trust.anthropic.com)
- [Google Cloud Vertex AI — Partner Models](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude)
- [Google Cloud Vertex AI — Data Governance](https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance)
- [Google Cloud Sub-processors](https://cloud.google.com/terms/subprocessors)
- [Anthropic — Claude on Google Vertex AI](https://www.anthropic.com/news/google-vertex-general-availability)

---

## Limitations

This analysis covers managed cloud AI integrations where a foundation model is accessed through a third-party platform's API. It does not cover:

- **On-premise deployments** or self-hosted open-weight models, where the trust boundary is entirely within your own infrastructure.
- **Fine-tuning data flows**, where training data may be stored or retained under different terms than inference prompts.
- **Multi-tenant versus single-tenant inference**, which affects isolation guarantees.
- **Sovereign cloud nuances beyond Azure**, such as AWS GovCloud or Google Cloud Sovereign Controls.

Readers should not assume that conclusions drawn for managed API inference apply to these scenarios without separate evaluation.

---

## Disclaimer

This content reflects independent technical analysis based on publicly documented architecture and contractual terms as of the publication date. Cloud AI platform architectures, hosting arrangements, and contractual terms evolve frequently — readers should verify current documentation before making compliance or architectural decisions. This post does not represent the position of any cloud provider, model vendor, or employer.
