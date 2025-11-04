Minimal files to include when embedding UiSelector in another project

If you want to copy only the UI selector code into your own React app (no demo), include the following files and folders from this repository.


Core files (recommended):

- `src/components/ClickInspector.tsx` — the click-to-inspect wrapper and detection logic
- `src/components/PromptPanel.tsx` — the prompt UI for displaying metadata and generating prompts
- `src/components/Toast.tsx` and `src/components/ToastContainer.tsx` — optional toast UI used by the prompt panel
- `src/context/UiSelectorContext.tsx` — provider for selection state, toasts, and helper functions
- `src/styles.css` — core styles; you can copy only the rules you need into your app's stylesheet

Note: This repository no longer includes a demo sample folder — it is library-only. If you previously saw a `src/sample/` folder, it has been removed.


Integration tips

- Ensure your project uses React 18+ and TypeScript (or adapt the .tsx files to JS).
- Add the provider high in your app tree (so the inspector can wrap UI):

```tsx
<UiSelectorProvider>
  <ClickInspector>
    {/* your app */}
  </ClickInspector>
  <PromptPanel />
</UiSelectorProvider>
```

- If you prefer a lighter integration, import only `ClickInspector` and the context provider and copy the styles you need.
