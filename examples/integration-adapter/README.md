# Third-Party Integration Adapter

This example demonstrates the recommended application boundary:

```text
Your integration
      |
      v
@persian-braille/sdk
      |
      v
Persian Braille Core
```

The adapter does not know anything about Microsoft Office and does not import
Core directly.

A host can inject the returned adapter into its own UI, document model, web
service, desktop application, or accessibility workflow.
