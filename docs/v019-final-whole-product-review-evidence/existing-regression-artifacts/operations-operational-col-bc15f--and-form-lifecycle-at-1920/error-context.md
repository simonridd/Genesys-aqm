# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: operations.spec.ts >> operational collections and form lifecycle at 1920
- Location: tests/operations.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "IPI AQM home" [ref=e5] [cursor=pointer]:
      - /url: "?page=welcome"
      - img "IPI" [ref=e6]
    - strong [ref=e7]: IPI AQM
    - button "Connect Genesys Cloud" [ref=e8] [cursor=pointer]
  - main [ref=e9]:
    - region "Welcome to IPI AQM" [ref=e10]:
      - generic [ref=e11]:
        - text: Working prototype
        - paragraph [ref=e12]: AUTOMATED QUALITY MANAGEMENT FOR GENESYS CLOUD
        - heading "More conversations understood. Less manual scoring." [level=1] [ref=e13]: More conversations understood.Less manual scoring.
        - paragraph [ref=e14]: Jev answers specific quality questions in predefined formats. AQM turns those answers into transparent scores that people can inspect and challenge.
        - generic [ref=e15]:
          - button "Take the guided demo →" [ref=e16] [cursor=pointer]
          - button "Explore the prototype" [ref=e17] [cursor=pointer]
        - paragraph [ref=e18]: Five minutes · fictional data · no live requests
      - generic [ref=e19]:
        - generic [ref=e20]:
          - heading "From signal to understanding" [level=2] [ref=e21]
          - generic [ref=e22]: Fictional preview
        - paragraph [ref=e23]: Resolution guidance needs a closer look.
        - generic [ref=e24]:
          - generic [ref=e25]:
            - generic [ref=e26]: PREPARED AI ANSWER
            - strong [ref=e27]: Clear next step
          - generic [ref=e28]:
            - text: HUMAN JUDGMENT
            - strong [ref=e29]: Timeline not agreed
        - paragraph [ref=e30]: One conversation. The same published form. A useful disagreement.
        - button "See how calibration works →" [ref=e31] [cursor=pointer]
    - generic [ref=e32]:
      - text: THE OPPORTUNITY
      - heading "Manual review should inform quality. Not be the only way to see it." [level=2] [ref=e33]: Manual review should inform quality.Not be the only way to see it.
      - paragraph [ref=e34]: Increase visibility across selected conversations, investigate the evidence, and use human judgment where it matters. Controlled coverage is a policy decision, not a claim of unlimited capacity.
    - generic [ref=e35]:
      - text: WHY THIS APPROACH
      - heading "Focused decisions. Transparent scoring. Human control." [level=2] [ref=e36]
      - generic [ref=e37]:
        - article [ref=e38]:
          - heading "Ask focused questions" [level=3] [ref=e39]
          - paragraph [ref=e40]: Predefined answer formats evaluate specific criteria, with related questions batched in one request.
        - article [ref=e41]:
          - heading "Apply agreed scoring rules" [level=3] [ref=e42]
          - paragraph [ref=e43]: Weights, critical criteria and exact form versions make the score explainable.
        - article [ref=e44]:
          - heading "Learn from disagreement" [level=3] [ref=e45]
          - paragraph [ref=e46]: Human reviews preserve the original AI result and support calibration.
      - paragraph [ref=e47]:
        - text: Typed answers can still be wrong. Confidence is not measured correctness; calibrate against human judgments.
        - link "Confidence reference" [ref=e48] [cursor=pointer]:
          - /url: https://docs.typesafe.ai/confidence
        - text: · checked 2026-10-03.
    - region "Illustrative cost calculator" [ref=e49]:
      - text: EXPLORE THE ECONOMICS
      - heading "A small model bill. An honest starting point." [level=2] [ref=e50]
      - paragraph [ref=e51]: Structured, batched questions and very low model input cost make broader evaluation economically attractive. This is an illustrative planning estimate — model input cost only.
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]:
            - text: Conversations per month
            - spinbutton "Conversations per month" [ref=e55]: "100000"
            - generic [ref=e56]: 0–1,000,000,000
          - generic [ref=e57]:
            - text: Selected percentage
            - spinbutton "Selected percentage" [ref=e58]: "50"
            - generic [ref=e59]: 0–100%
          - group [ref=e60]:
            - generic "Advanced assumptions" [ref=e61] [cursor=pointer]
        - generic [ref=e62]:
          - text: ESTIMATED JEV MODEL INPUT COST · USD
          - strong [ref=e63]: $16.80/month
          - paragraph [ref=e64]: 50,000 conversations/month selected · 50,000 form evaluations · 50,000 AI requests · 400M input tokens/month.
          - paragraph [ref=e65]: "Current assumptions: 100,000 conversations/month · 50% selected · 1 form(s) per conversation · 1 AI request(s) per form · 8,000 input tokens per request."
          - paragraph [ref=e66]: Input includes transcript and quality questions. Repeated transcript input across conditional requests counts again. Average forms and requests may be fractional planning equivalents.
          - paragraph [ref=e67]:
            - link "Official Jev 1.13 pricing" [ref=e68] [cursor=pointer]:
              - /url: https://docs.typesafe.ai/models
            - text: ": $0.042/M input tokens; output free. Checked 2026-10-03; rates may change."
          - paragraph [ref=e69]:
            - strong [ref=e70]: "Excluded:"
            - text: transcription, Genesys licensing/retrieval, hosting, storage and network costs, retries, taxes and human review. Validate capacity during the pilot.
    - generic [ref=e71]:
      - text: MORE THAN A MODEL DEMONSTRATION
      - heading "A connected quality workflow." [level=2] [ref=e72]
      - generic [ref=e73]:
        - button "The customer case Was Jamie given a clear next step?" [ref=e74] [cursor=pointer]:
          - strong [ref=e75]: The customer case
          - generic [ref=e76]: Was Jamie given a clear next step?
          - generic [aria-hidden] [ref=e77]: →
        - button "Define quality See the agreed questions and scoring rules" [ref=e78] [cursor=pointer]:
          - strong [ref=e79]: Define quality
          - generic [ref=e80]: See the agreed questions and scoring rules
          - generic [aria-hidden] [ref=e81]: →
        - button "Evaluate at scale See Jev’s answers and AQM’s explainable score" [ref=e82] [cursor=pointer]:
          - strong [ref=e83]: Evaluate at scale
          - generic [ref=e84]: See Jev’s answers and AQM’s explainable score
          - generic [aria-hidden] [ref=e85]: →
        - button "Human challenge Compare independent judgments" [ref=e86] [cursor=pointer]:
          - strong [ref=e87]: Human challenge
          - generic [ref=e88]: Compare independent judgments
          - generic [aria-hidden] [ref=e89]: →
        - button "Manage & pilot Turn quality insight into an owned action" [ref=e90] [cursor=pointer]:
          - strong [ref=e91]: Manage & pilot
          - generic [ref=e92]: Turn quality insight into an owned action
          - generic [aria-hidden] [ref=e93]: →
    - generic [ref=e94]:
      - group [ref=e95]:
        - generic "Prototype status & evidence" [ref=e96] [cursor=pointer]
      - link "Plan a pilot →" [ref=e97] [cursor=pointer]:
        - /url: "#pilot"
    - generic [ref=e98]:
      - text: PLAN A PILOT
      - heading "Start narrow. Calibrate. Decide with evidence." [level=2] [ref=e99]
      - list [ref=e100]:
        - listitem [ref=e101]: Agree one queue or use case and an accountable quality lead.
        - listitem [ref=e102]: Choose representative conversations.
        - listitem [ref=e103]: Define the evaluation form.
        - listitem [ref=e104]: Run AI and human comparison.
        - listitem [ref=e105]: Measure quality insight, agreement/calibration, coverage, model cost and reviewer effort.
        - listitem [ref=e106]: Decide whether broader rollout is justified.
      - paragraph [ref=e107]: No booking or contact details are collected.
  - contentinfo [ref=e108]:
    - text: IPI AQM · Decision intelligence powered by Jev
    - button "Connection settings →" [ref=e109] [cursor=pointer]
```