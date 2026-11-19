import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { api, ApiError, message } from './api';
import type { Pagination, Progress } from './types';

export function useResource<T>(path: string, revision = 0) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api<T>(path, { signal: controller.signal }).then(value => {
      if (!controller.signal.aborted) setData(value);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(message(failure));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision, retry]);
  return { data, error, loading, reload: () => setRetry(value => value + 1) };
}

export function useMutation() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  async function run(action: () => Promise<void>, confirmation = 'Alteração guardada.') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(''); setFields({}); setSuccess('');
    try { await action(); setSuccess(confirmation); }
    catch (failure) { setError(message(failure)); if (failure instanceof ApiError) setFields(failure.fields); }
    finally { lock.current = false; setBusy(false); }
  }
  return { busy, error, success, fields, run };
}

export function Feedback({ error, success }: { error?: string; success?: string }) {
  return <>{error && <p role="alert" className="alert">{error}</p>}{success && <p role="status" className="success">{success}</p>}</>;
}

export function LoadState({ loading, error, reload, children }: {
  loading: boolean; error: string; reload: () => void; children: ReactNode;
}) {
  if (loading) return <p role="status" className="loading-state"><span className="loading-dot" aria-hidden="true" />A carregar…</p>;
  if (error) return <div className="resource-error"><Feedback error={error} /><button onClick={reload}>Tentar novamente</button></div>;
  return children;
}

export function ProgressCard({ progress }: { progress: Progress }) {
  return <section className="progress-card" aria-label="Progresso global do projeto">
    <div className="progress-heading"><span className="eyebrow">Progresso global</span><strong>{progress.completedPercent}% concluído</strong></div>
    <progress max={100} value={progress.completedPercent} aria-label="Percentagem concluída" />
    <span className="progress-breakdown">Total: {progress.total} · Por fazer: {progress.todo} · Em curso: {progress.inProgress} · Em revisão: {progress.inReview} · Concluídas: {progress.done}</span>
    {!progress.total && <span>Sem tarefas</span>}
  </section>;
}

export function Pager({ pagination, change }: { pagination: Pagination; change: (page: number) => void }) {
  return <nav className="pager" aria-label="Paginação">
    <button disabled={pagination.page <= 1} onClick={() => change(pagination.page - 1)}>Anterior</button>
    <span>Página {pagination.page} · {pagination.totalItems} resultados · {pagination.totalPages} páginas</span>
    <button disabled={pagination.page >= pagination.totalPages} onClick={() => change(pagination.page + 1)}>Seguinte</button>
  </nav>;
}

export function FieldError({ field, errors }: { field: string; errors: Record<string, string> }) {
  return errors[field] ? <span className="field-error" role="alert">{errors[field]}</span> : null;
}

export function submit(action: () => void) {
  return (event: FormEvent) => { event.preventDefault(); action(); };
}
