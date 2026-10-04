# Test info

- Name: role-navigation.spec.ts >> review contextual evidence and default My Reviews remain coherent on mobile
- Location: ../../../../../../../private/tmp/aqm-v020-clean/tests/role-navigation.spec.ts:76:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('navigation', { name: 'Breadcrumb' })
Expected substring: "Conversation review"
Received string:    "Workspace / Conversation detail"
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('navigation', { name: 'Breadcrumb' }) with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Breadcrumb' })
    - locator resolved to <nav class="breadcrumbs" aria-label="Breadcrumb">…</nav>
    - unexpected value "Workspace / Evaluations"
    13 × locator resolved to <nav class="breadcrumbs" aria-label="Breadcrumb">…</nav>
       - unexpected value "Workspace / Conversation detail"

```

```yaml
- navigation "Breadcrumb":
  - text: Workspace
  - strong: Conversation detail
```

