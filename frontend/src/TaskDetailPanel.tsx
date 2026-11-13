import { useEffect, useRef, type ReactNode } from 'react';

export function requestTaskClose() {
  return window.dispatchEvent(new Event('task-close-request', { cancelable: true }));
}
export function TaskDetailPanel({ children, close, full = false }: { children: ReactNode; close: () => void; full?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (full) { panel.current?.querySelector<HTMLButtonElement>('button')?.focus(); return; }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = panel.current!;
    const inert: HTMLElement[] = [];
    // Keep the entire workspace inaccessible, without making this panel inert.
    let node: HTMLElement = root;
    while (node.parentElement && node.parentElement !== document.body) {
      Array.from(node.parentElement.children).forEach(sibling => {
        if (sibling !== node && sibling instanceof HTMLElement && !sibling.inert) { sibling.inert = true; inert.push(sibling); }
      });
      node = node.parentElement;
    }
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    root.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (requestTaskClose()) close(); }
      if (event.key === 'Tab') {
        const focusable = Array.from(root.querySelectorAll<HTMLElement>('a[href],button,input,textarea,select,[tabindex="0"]')).filter(element =>
          !element.hasAttribute('disabled') && !element.hidden && element.getClientRects().length > 0);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    root.addEventListener('keydown', keydown);
    const taskHash = window.location.hash;
    return () => {
      inert.forEach(element => { element.inert = false; }); document.body.style.overflow = overflow; root.removeEventListener('keydown', keydown);
      if (previous?.isConnected) previous.focus();
      else Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).find(anchor => anchor.getAttribute('href') === taskHash)?.focus();
    };
  }, [close, full]);
  return <div className={full ? 'task-full-page' : 'task-panel-backdrop'}><div ref={panel} className={full ? '' : 'task-panel'} role={full ? undefined : 'dialog'} aria-modal={full ? undefined : true} aria-label={full ? undefined : 'Detalhe da tarefa'}>
    <div className="task-panel-toolbar"><button onClick={() => { if (requestTaskClose()) close(); }}>Fechar detalhe</button>
      <a href={window.location.hash} data-task-preserve="true" onClick={event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); window.dispatchEvent(new Event('task-full-page'));
      }}>Abrir em página completa</a></div>
    {children}
  </div></div>;
}
