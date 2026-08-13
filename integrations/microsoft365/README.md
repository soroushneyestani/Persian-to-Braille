# Microsoft 365 Integration

Official Microsoft 365 Office Add-in consumer for Word, Excel, and PowerPoint.

Responsibilities:
- integrate Persian Braille capabilities into Microsoft 365 through supported Office APIs;
- consume the public SDK;
- keep Office-specific behavior isolated from the core engine.

Dependency rule:
- may depend on `packages/sdk`;
- must not be imported by `packages/core` or `packages/sdk`.
