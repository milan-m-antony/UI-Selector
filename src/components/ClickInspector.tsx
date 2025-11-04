import { useEffect, useRef, ReactNode, useState } from 'react';
import { useUiSelector } from '../context/UiSelectorContext';

// Component to file mapping for simulation
const componentFileMap: Record<string, { path: string; lineRange: { start: number; end: number }; snippet: string }> = {
  'Button': {
    path: 'src/components/Button.tsx',
    lineRange: { start: 1, end: 50 },
    snippet: '<button className="btn-primary">\n  Submit\n</button>'
  },
  'Form': {
    path: 'src/components/Form.tsx',
    lineRange: { start: 1, end: 100 },
    snippet: '<form onSubmit={handleSubmit}>\n  <input type="text" />\n  <button>Submit</button>\n</form>'
  },
  'Card': {
    path: 'src/components/Card.tsx',
    lineRange: { start: 1, end: 80 },
    snippet: '<div className="card">\n  <h3>Card Title</h3>\n  <p>Card content</p>\n</div>'
  },
  'Input': {
    path: 'src/components/Input.tsx',
    lineRange: { start: 8, end: 20 },
    snippet: '<input\n  type="text"\n  placeholder="Enter text"\n  value={value}\n/>'
  }
};

interface ClickInspectorProps {
  children: ReactNode;
}

export const ClickInspector = ({ children }: ClickInspectorProps) => {
  const { setSelectedElement, isSelectionMode, setSelectionMode, showToast } = useUiSelector();
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setHoveredElement] = useState<HTMLElement | null>(null);
  const [highlightOverlay, setHighlightOverlay] = useState<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only handle clicks when in selection mode
      if (!isSelectionMode) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (!target || !containerRef.current?.contains(target)) return;
      
      // Don't select the panel itself
      if (target.closest('.prompt-panel-floating')) return;

      // Try to find React component name from DOM
      let componentName = 'Unknown';
      let element = target;

      // Method 1: Check for data-component attribute
      while (element && element !== containerRef.current) {
        if (element.dataset.component) {
          componentName = element.dataset.component;
          break;
        }
        element = element.parentElement as HTMLElement;
      }

      // Method 2: Try React Fiber internals (if available)
      if (componentName === 'Unknown') {
        const reactFiber = (target as any)._reactInternalFiber || 
                          (target as any).__reactInternalInstance ||
                          (target as any).__reactFiber;
        
        if (reactFiber) {
          let fiber = reactFiber;
          while (fiber) {
            if (fiber.type && typeof fiber.type === 'function') {
              componentName = fiber.type.name || fiber.type.displayName || 'Unknown';
              break;
            }
            if (fiber.type && typeof fiber.type === 'string') {
              // Native HTML element, continue up
            }
            fiber = fiber.return;
          }
        }
      }

      // Method 3: Fallback to tag name or class-based detection
      if (componentName === 'Unknown') {
        const className = target.className;
        if (typeof className === 'string') {
          if (className.includes('btn') || target.tagName === 'BUTTON') {
            componentName = 'Button';
          } else if (className.includes('card') || target.closest('.card')) {
            componentName = 'Card';
          } else if (target.tagName === 'FORM' || target.closest('form')) {
            componentName = 'Form';
          } else if (target.tagName === 'INPUT') {
            componentName = 'Input';
          } else {
            componentName = target.tagName || 'Unknown';
          }
        }
      }

      // Get metadata from mapping or use defaults
      const metadata = componentFileMap[componentName] || {
        path: `src/components/${componentName}.tsx`,
        lineRange: { start: 1, end: 50 },
        snippet: `<${target.tagName.toLowerCase()}>\n  ${target.textContent?.slice(0, 50) || '...'}\n</${target.tagName.toLowerCase()}>`
      };

      setSelectedElement({
        componentName,
        filePath: metadata.path,
        lineRange: metadata.lineRange,
        codeSnippet: metadata.snippet,
      });
      
      // Exit selection mode and show success
      setSelectionMode(false);
      showToast(`Selected ${componentName} component`, 'success');
    };

    const container = containerRef.current;
    if (container && isSelectionMode) {
      container.addEventListener('click', handleClick, true);
      return () => {
        container.removeEventListener('click', handleClick, true);
      };
    }
  }, [setSelectedElement, isSelectionMode, setSelectionMode, showToast]);

  // Add visual indicator when in selection mode
  useEffect(() => {
    if (isSelectionMode) {
      document.body.style.cursor = 'crosshair';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [isSelectionMode]);

  // Create highlight overlay element
  useEffect(() => {
    if (isSelectionMode && !overlayRef.current) {
      const overlay = document.createElement('div');
      overlay.className = 'element-highlight-overlay';
      overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        border: 3px solid #3498db;
        border-radius: 4px;
        background: rgba(52, 152, 219, 0.1);
        z-index: 9999;
        transition: all 0.1s ease;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3), 0 0 20px rgba(52, 152, 219, 0.5);
      `;
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
      setHighlightOverlay(overlay);
      
      return () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        overlayRef.current = null;
      };
    } else if (!isSelectionMode && overlayRef.current) {
      if (overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
      }
      overlayRef.current = null;
      setHighlightOverlay(null);
    }
  }, [isSelectionMode]);

  // Handle mouse move for highlighting
  useEffect(() => {
    if (!isSelectionMode || !highlightOverlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !containerRef.current?.contains(target)) {
        if (highlightOverlay) {
          highlightOverlay.style.display = 'none';
        }
        return;
      }
      
      // Don't highlight the panel itself
      if (target.closest('.prompt-panel-floating')) {
        if (highlightOverlay) {
          highlightOverlay.style.display = 'none';
        }
        return;
      }

      const rect = target.getBoundingClientRect();
      highlightOverlay.style.display = 'block';
      highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
      highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
      highlightOverlay.style.width = `${rect.width}px`;
      highlightOverlay.style.height = `${rect.height}px`;
      setHoveredElement(target);
    };

    const handleMouseLeave = () => {
      if (highlightOverlay) {
        highlightOverlay.style.display = 'none';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isSelectionMode, highlightOverlay]);

  // Handle click highlight animation
  useEffect(() => {
    if (!highlightOverlay) return;

    const handleClick = (e: MouseEvent) => {
      if (!isSelectionMode) return;
      
      const target = e.target as HTMLElement;
      if (!target || !containerRef.current?.contains(target)) return;
      if (target.closest('.prompt-panel-floating')) return;

      // Add pulse animation on click
      if (highlightOverlay) {
        highlightOverlay.style.animation = 'pulseHighlight 0.3s ease-out';
        setTimeout(() => {
          if (highlightOverlay) {
            highlightOverlay.style.animation = '';
          }
        }, 300);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isSelectionMode, highlightOverlay]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%' }}
      className={isSelectionMode ? 'selection-mode-active' : ''}
    >
      {children}
    </div>
  );
};

