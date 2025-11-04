# UiSelector

A compact React utility to inspect UI elements and generate developer prompts (Copilot/Cursor-ready).

Key points
- Click any element to view metadata: component name, file path, line range, and code snippet.
- Generate formatted prompts with selectable types: Edit, Fix, Add, Refactor, Explain/Doc.
- Copy prompts to clipboard and show contextual toasts.

Quick start (demo)
1. Install dependencies:

```powershell
npm install
npm run dev
```

2. Open the Vite URL (typically `http://localhost:5173`) to preview the demo.

Include only the UI selector
- Copy these core files into your project (or add this repo as a submodule):
  - `src/context/UiSelectorContext.tsx`
  - `src/components/ClickInspector.tsx`
  - `src/components/PromptPanel.tsx`
  - `src/components/Toast.tsx` and `src/components/ToastContainer.tsx`
  - `src/styles.css`

Usage (minimal)
```tsx
import React from 'react';
import { UiSelectorProvider } from './path/to/ui-selector/context/UiSelectorContext';
import { ClickInspector } from './path/to/ui-selector/components/ClickInspector';
import { PromptPanel } from './path/to/ui-selector/components/PromptPanel';
import { ToastContainer } from './path/to/ui-selector/components/ToastContainer';
import './path/to/ui-selector/styles.css';

export default function App(){
  return (
    <UiSelectorProvider>
      <ClickInspector>
        <AppContent />
      </ClickInspector>
      <PromptPanel />
      <ToastContainer />
    </UiSelectorProvider>
  );
}
```

API (quick)
- `UiSelectorProvider` — wrap your app.
- `ClickInspector` — wrap the UI area to enable clicking/inspecting.
- `PromptPanel` — shows selected element details and prompt generator.
- `ToastContainer` — optional toast host.
- `useUiSelector()` — hook with `setSelectedElement`, `setSelectionMode`, `showToast`, etc.

Accessibility
- Uses ARIA for interactive controls. The prompt-type selector supports common accessible patterns (Edit/Fix/Add/Refactor/Explain).

Notes
- If you prefer a library-only repo, move demo files into a `demo/` folder or remove `index.html` before publishing.

Development
- Type-check: `npm run typecheck`
- Dev server: `npm run dev`

License: MIT


