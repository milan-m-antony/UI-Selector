import { UiSelectorProvider, useUiSelector } from '../context/UiSelectorContext';
import { ClickInspector } from '../components/ClickInspector';
import { PromptPanel } from '../components/PromptPanel';
import { ToastContainer } from '../components/ToastContainer';



function DemoInner() {
  const { toasts, removeToast } = useUiSelector();
  return (
    <>
        <ClickInspector>
          <div className="demo-wrap">
            <h2>UiSelector Demo</h2>
            <p>Click the button below, enable selection mode from the toolbar, then click UI elements.</p>
            <div className="demo-row">
              <button data-component="DemoButton">Demo Button</button>
              <input data-component="DemoInput" placeholder="Demo input" />
            </div>
          </div>
        </ClickInspector>
      <PromptPanel />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function DemoApp() {
  return (
    <UiSelectorProvider>
      <DemoInner />
    </UiSelectorProvider>
  );
}
