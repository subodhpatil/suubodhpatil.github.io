---
layout: page
title: Cryptography, TLS, and Key Management
description: Practical explanations of HTTPS, TLS, cloud key management, private-key protection, and post-quantum migration planning.
permalink: /topics/cryptography-tls/
---

This guide connects my writing on **cryptography and secure communications** to the architecture decisions behind it: what TLS protects, where private keys should live, how cloud key control works, and how to plan for post-quantum change.

## Understand the protocol and its limits

- [How HTTPS Actually Works: A Practical Deep Dive for Engineers]({% post_url 2025-12-13-how-https-actually-works %}) — the handshake, certificates, encryption, and what HTTPS cannot hide.
- [From SSL 2.0 to TLS 1.3: The Evolution of Secure Communication]({% post_url 2026-07-01-ssl-to-tls-evolution-of-secure-communication %}) — the security failures and design changes behind modern TLS.

## Protect keys and plan for change

- [Encryption Demystified (Part 1): Building the Foundation for Data-at-Rest Security in the Cloud]({% post_url 2025-10-02-Encryption-Demystified-Part1 %}), [Part 2]({% post_url 2025-10-03-Encryption-Demystified-Part2 %}), and [Part 3]({% post_url 2025-10-04-Encryption-Demystified-Part3 %}) — cloud encryption and the key-control spectrum.
- [Post-Quantum Cryptography: Why Even TLS 1.3 Isn't Safe Forever]({% post_url 2026-07-08-post-quantum-cryptography-tls-not-safe-forever %}) — harvest-now-decrypt-later risk, standards, hybrid deployment, and crypto agility.

## Questions for a key-management review

Identify who can use, administer, rotate, disable, and recover each key. Distinguish key custody from control over the service encrypted by that key. Check how workloads authenticate to the key service, how rotation and recovery are tested, and what audit evidence exists. For long-lived sensitive data, include cryptographic inventory and migration dependencies in post-quantum planning.

The articles explain general architecture principles. Verify current product capabilities and applicable standards against their primary documentation before making implementation decisions.

**Related guides:** [AI governance and risk management](/topics/ai-governance/) · [Cloud AI trust boundaries](/topics/cloud-ai-trust/) · [About the author and editorial policy](/about/)
