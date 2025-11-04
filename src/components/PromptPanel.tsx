import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiSelector } from '../context/UiSelectorContext';

export const PromptPanel = () => {
  const {
    selectedElement,
    userPrompt,
    setUserPrompt,
    setSelectedElement,
    isSelectionMode,
    setSelectionMode,
    showToast,
    showToasts,
    setShowToasts,
  } = useUiSelector();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [selectedPromptType, setSelectedPromptType] = useState<'edit'|'fix'|'add'|'refactor'|'explain'>('edit');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Keep simple fixed position for toolbar; no complex drag state
  const panelRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Keep track of previous selection so we only auto-open when selection changes
  const prevSelectedRef = useRef<typeof selectedElement | null>(null);

  useEffect(() => {
    if (selectedElement && prevSelectedRef.current !== selectedElement) {
      setIsExpanded(true);
    }
    prevSelectedRef.current = selectedElement;
  }, [selectedElement]);

  const detectIntent = (prompt: string): 'add' | 'edit' => {
    const lower = prompt.toLowerCase();
    const adds = ['add', 'create', 'new', 'insert', 'introduce'];
    return adds.some(k => lower.includes(k)) ? 'add' : 'edit';
  };

  const generatePrompt = () => {
    if (!selectedElement || !userPrompt.trim()) {
      showToast('Please select an element and enter a prompt', 'error');
      return;
    }

    const { filePath, lineRange, componentName } = selectedElement;
    const type = selectedPromptType || (detectIntent(userPrompt) === 'add' ? 'add' : 'edit');

    let formatted = '';
    switch (type) {
      case 'add':
        formatted = `💡 Copilot Prompt:\n\nIn ${filePath}, ${userPrompt}. Ensure it's properly connected and follows the existing code patterns.`;
        break;
      case 'fix':
        formatted = `💡 Copilot Prompt:\n\nIn ${filePath} lines ${lineRange.start}–${lineRange.end}, fix the ${componentName.toLowerCase()} so ${userPrompt}.`;
        break;
      case 'refactor':
        formatted = `💡 Copilot Prompt:\n\nIn ${filePath} lines ${lineRange.start}–${lineRange.end}, refactor the ${componentName.toLowerCase()} to ${userPrompt}, preserving existing behavior.`;
        break;
      case 'explain':
        formatted = `💡 Copilot Prompt:\n\nExplain the logic of ${filePath} lines ${lineRange.start}–${lineRange.end} and ${userPrompt}`;
        break;
      case 'edit':
      default:
        formatted = `💡 Copilot Prompt:\n\nIn ${filePath} lines ${lineRange.start}–${lineRange.end}, update the ${componentName.toLowerCase()} component to ${userPrompt}.`;
        break;
    }

    setGeneratedPrompt(formatted);
    showToast('Prompt generated successfully!', 'success');
  };

  const copyToClipboard = async () => {
    if (!generatedPrompt || !generatedPrompt.trim()) {
      showToast('Please generate a prompt first', 'error');
      return;
    }

    const fullText = `🧩 File: ${selectedElement?.filePath}\n🔢 Lines: ${selectedElement?.lineRange.start}–${selectedElement?.lineRange.end}\n\n🧠 Context:\n${selectedElement?.codeSnippet}\n\n${generatedPrompt}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const hasGenerated = Boolean(generatedPrompt && generatedPrompt.trim());

  // Accessible prompt type selector (radiogroup)
  const promptTypes = ['edit', 'fix', 'add', 'refactor', 'explain'] as const;
  const typeLabels: Record<typeof promptTypes[number], string> = {
    edit: 'Edit',
    fix: 'Fix',
    add: 'Add',
    refactor: 'Refactor',
    explain: 'Explain / Doc',
  };
  const buttonRefs = useRef<Array<HTMLInputElement | null>>([]);

  

  const handleEdit = () => {
    setSelectionMode(!isSelectionMode);
    showToast(isSelectionMode ? 'Selection mode disabled' : 'Selection mode enabled - Click on any UI element', 'info');
  };

  const handleDisable = () => {
    setIsDisabled(!isDisabled);
    if (!isDisabled) {
      setSelectedElement(null);
      setIsExpanded(false);
      setSelectionMode(false);
    }
  };

  // Drag handlers: allow moving the floating toolbar by dragging the bar
  const startDrag = (e: React.MouseEvent) => {
    const panel = panelRef.current;
    const bar = barRef.current;
    if (!panel || !bar) return;

    const rect = panel.getBoundingClientRect();
    // convert fixed bottom-left placement to explicit top/left to allow moving
    panel.style.bottom = 'auto';
    panel.style.top = `${rect.top}px`;
    panel.style.left = `${rect.left}px`;

    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    draggingRef.current = true;
    panel.classList.add('dragging');

    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !panel) return;
      const newX = ev.clientX - dragOffsetRef.current.x;
      const newY = ev.clientY - dragOffsetRef.current.y;
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      panel.style.left = `${clampedX}px`;
      panel.style.top = `${clampedY}px`;
    };

    const onUp = () => {
      draggingRef.current = false;
      panel.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (isExpanded) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isExpanded]);

  if (isDisabled) return null;

  return (
    <div ref={panelRef} className="prompt-panel-floating bottom-left">
  <div ref={barRef} className="prompt-panel-bar glass" onMouseDown={startDrag}>
        <div className="bar-left">
          <svg className="magnify-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="bar-title">UI-Selector</span>
        </div>

        <div className="bar-right">
          <button className={`toolbar-btn primary ${isSelectionMode ? 'active' : ''}`} onClick={handleEdit}>{isSelectionMode ? 'Selecting...' : 'Edit'}</button>
          <button className="toolbar-btn danger" onClick={handleDisable}>Disable</button>
          <button className="toolbar-btn secondary" title="Instructions" onClick={() => setIsHelpOpen(s => !s)}>Help</button>
          <button className={`toolbar-btn neutral toast-toggle ${showToasts ? 'active' : ''}`} title={showToasts ? 'Disable toasts' : 'Enable toasts'} onClick={() => setShowToasts(!showToasts)}>{showToasts ? 'Toasts: On' : 'Toasts: Off'}</button>
        </div>
      </div>

      {/* Help modal */}
      {isHelpOpen && createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsHelpOpen(false)}>
          <div className="modal-center">
            <div className="prompt-panel-content modal-content glass glass-panel small-modal" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="btn-close" aria-label="Close help" onClick={(e) => { e.stopPropagation(); setIsHelpOpen(false); }}>×</button>
              <h3>Quick usage</h3>
              <p className="help-text">Click "Edit" to enable selection mode, then click any element to inspect it. Generate a prompt and copy to clipboard.</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Settings modal (kept for parity) */}
      {isSettingsOpen && createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-center">
            <div className="prompt-panel-content modal-content glass glass-panel small-modal" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close" onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); }}>×</button>
              <h3>Settings</h3>
              <div className="settings-row settings-row-spaced">
                <div>
                  <div className="settings-label">Toasts</div>
                  <div className="settings-desc">Enable or disable toast notifications</div>
                </div>
                <button className={`settings-toggle ${showToasts ? 'on' : 'off'}`} onClick={() => setShowToasts(!showToasts)}>{showToasts ? 'On' : 'Off'}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Prompt modal (lightning-box style, portaled) */}
      {isExpanded && createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => { setIsExpanded(false); setSelectionMode(false); }}>
          <div className="modal-center">
            <div className="prompt-panel-content modal-content glass-panel small-modal" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setSelectionMode(false); }}>×</button>
              <h3 className="modal-title">Inspect & Generate</h3>

              <div className="settings-row settings-row-spaced">
                <div>
                  <div className="settings-label">File</div>
                  <div className="settings-desc">{selectedElement ? selectedElement.filePath : 'No file selected'}</div>
                </div>
                <div>
                  <div className="settings-label">Lines</div>
                  <div className="settings-desc">{selectedElement ? `${selectedElement.lineRange.start}–${selectedElement.lineRange.end}` : '-'}</div>
                </div>
              </div>

              <div className="type-selector" role="radiogroup" aria-label="Prompt type">
                {promptTypes.map((t, i) => (
                  <label key={t} className={`type-btn ${selectedPromptType === t ? 'active' : ''}`}>
                    <input
                      ref={(el) => (buttonRefs.current[i] = el)}
                      type="radio"
                      name="prompt-type"
                      value={t}
                      checked={selectedPromptType === t}
                      onChange={() => setSelectedPromptType(t)}
                      className="sr-only"
                    />
                    {typeLabels[t]}
                  </label>
                ))}
              </div>

              <div className="input-section">
                <label htmlFor="user-prompt">Your Change Request</label>
                <textarea id="user-prompt" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} placeholder="Describe the change (e.g., 'Make this button larger')" rows={4} />
              </div>

              <div className="button-group">
                <button onClick={generatePrompt} className="btn-primary">Generate Prompt</button>
                <button onClick={copyToClipboard} className="btn-secondary" disabled={!hasGenerated}>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
