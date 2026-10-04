# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: governance.spec.ts >> REVIEWER governance at 390
- Location: tests/governance.spec.ts:7:164

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - img "IPI" [ref=e6]
      - generic [ref=e7]:
        - strong [ref=e8]: IPI AQM
        - text: Automated Quality Management
    - navigation "Primary navigation" [ref=e9]:
      - group [ref=e10]:
        - generic "Quality / Review" [ref=e11] [cursor=pointer]
        - generic [ref=e12]:
          - button "Evaluations" [ref=e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=e14]: ◷
          - button "Calibration" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ◎
          - button "Analytics" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ▥
          - button "Overview" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◌
      - group [ref=e25]:
        - generic "Reference configuration" [ref=e26] [cursor=pointer]
      - group [ref=e27]:
        - generic "Interactions" [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - button "Settings" [ref=e30] [cursor=pointer]:
          - generic [aria-hidden] [ref=e31]: ⚙
        - button "About / product tour" [ref=e33] [cursor=pointer]
  - main [ref=e34]:
    - generic [ref=e35]:
      - navigation "Breadcrumb" [ref=e36]:
        - text: Workspace /
        - strong [ref=e37]: Settings
      - generic [ref=e38]:
        - generic "Current role" [ref=e39]: REVIEWER
        - text: Jev managed securely by automation service
    - generic [ref=e41]:
      - generic [ref=e43]:
        - heading "Settings" [level=1] [ref=e44]
        - paragraph [ref=e45]: Connect Genesys Cloud and manage your organization's AQM settings.
      - navigation "Settings sections" [ref=e46]:
        - button "Connection" [ref=e47] [cursor=pointer]
        - button "Access" [ref=e48] [cursor=pointer]
        - button "Reviews" [ref=e49] [cursor=pointer]
        - button "Privacy & retention" [ref=e50] [cursor=pointer]
        - button "Advanced / Development" [ref=e51] [cursor=pointer]
      - heading "Access" [active] [level=2] [ref=e52]
      - region "Governance" [ref=e53]:
        - paragraph [ref=e55]: Your access follows your current role, shown in the top bar. Contact an administrator to change role assignments.
```