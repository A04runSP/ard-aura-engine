# ARD Workspace — Responsive Design Standards

## CSS unit conventions

- `px`: CSS pixels for borders, shadows, and fine visual details.
- `%`: relative to the containing block for flexible widths and layout proportions.
- `vw`: relative to viewport width for viewport-relative sections and fluid scaling.
- `em`: relative to the current element's font size for component-local padding and sizing.
- `rem`: relative to the root font size for typography, global spacing, and consistent sizing.

These are defaults, not prohibitions. Choose the unit that matches the sizing relationship.

## Fluid sizing

- Use `clamp(min, preferred, max)` for fluid typography and page gutters.
- Use `min()`, `max()`, and `minmax()` to constrain layouts.
- Prefer Grid and Flexbox over fixed-position layout for primary page structure.
- Use content-driven breakpoints where the layout needs to change, not device labels alone.

## Viewport and device behaviour

- Use `100dvh` when a full-height mobile layout must account for changing browser chrome.
- Test narrow mobile, wide mobile, tablet, and desktop widths.
- Prevent horizontal overflow at every supported width.
- Preserve readable line lengths with a content max-width.
- Respect `prefers-reduced-motion`.

## Accessibility

- Interactive controls need accessible names and keyboard focus states.
- Form fields need programmatic labels and associated hint/error text.
- Disabled states must be communicated semantically, not by colour alone.
- Use semantic landmarks and heading order.

## Validation

Responsive styles must be checked in a real browser at mobile and desktop widths. Automated CSS-token tests do not replace visual QA.
