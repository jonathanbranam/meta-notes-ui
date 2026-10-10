# File tree pane

## Purpose

The human controls the left file tree at any window size: collapse it with a
`<<` button, bring it back with a small button on the left edge, and drag its
right edge to set its width. The browser remembers both. (Ticket nfy5.)

## Requirements

### Requirement: The tree collapses and expands at any window size  {#r-c42e}

The client SHALL show a `<<` button at the top of the file tree that hides the
tree, and, while the tree is hidden, a small button on the left edge that
shows it again. This SHALL work at every window width on a pointer screen.
On a small screen (up to 720 px) the tree stays the slide-in drawer opened by
the menu button.

#### Scenario: Collapse and expand  {#s-6872}

*Verification*: **non-executable**

- **WHEN** the user presses `<<` at the top of the tree, then the button on the left edge
- **THEN** the tree disappears and the note fills the width, then the tree returns at its last width

### Requirement: The tree width is draggable  {#r-81bd}

The client SHALL let the user drag the tree's right edge to set its width,
kept between 160 and 600 px.

#### Scenario: Width is kept in range  {#s-40e6a}

*Verification*: **executable**

- **WHEN** the tree width is set to 10, then 5000
- **THEN** the width is 160, then 600

### Requirement: The collapsed state and width are remembered  {#r-64e0}

The client SHALL keep the collapsed state and the width in the browser's
localStorage, never on the server, and restore them on load; with nothing
stored the tree is open at 280 px.

#### Scenario: Remembered across a reload  {#s-912b}

*Verification*: **executable**

- **WHEN** the tree is collapsed at width 350 and the app is loaded again
- **THEN** the tree is collapsed at width 350

#### Scenario: Nothing stored  {#s-7e6b}

*Verification*: **executable**

- **WHEN** the app is loaded with nothing stored
- **THEN** the tree is open at width 280
