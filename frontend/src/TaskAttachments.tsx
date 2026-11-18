import { useEffect, useRef, useState } from 'react';
import { api, ApiError, write } from './api';
import type { TaskAttachment } from './types';
import { Feedback, FieldError, LoadState, submit, useMutation, useResource } from './ui';

const accept = '.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.md,.markdown';
export function validateFiles(files: File[], existing = 0) {
  if (existing + files.length > 5) return 'Máximo de 5 ficheiros neste grupo.';
  if (files.some(file => file.size > 4194304)) return 'Cada ficheiro pode ter no máximo 4 MiB.';
  if (files.some(file => !/\.(png|jpe?g|gif|webp|pdf|txt|md|markdown)$/i.test(file.name))) return 'Formato não permitido. Use PNG, JPEG, GIF, WEBP, PDF, TXT ou Markdown.';
  return '';
}
export function FilePicker({ files, change, existing = 0, disabled = false, label = 'Ficheiros' }: {
  files: File[]; change: (files: File[]) => void; existing?: number; disabled?: boolean; label?: string;
}) {
  const [error, setError] = useState('');
  const add = (incoming: File[]) => {
    if (disabled) return;
    const next = [...files, ...incoming];
    const failure = validateFiles(next, existing);
    setError(failure);
    if (!failure) change(next);
  };
  return <div className="file-picker" onDragOver={event => event.preventDefault()} onDrop={event => {
    event.preventDefault(); add(Array.from(event.dataTransfer.files));
  }} onPaste={event => {
    const pasted = Array.from(event.clipboardData.files);
    if (pasted.length) { event.preventDefault(); add(pasted); }
  }}>
    <label>{label}<input type="file" multiple accept={accept} disabled={disabled}
      onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ''; }} /></label>
    <p className="form-note">Escolha, arraste ou cole uma captura neste campo. Até 5 ficheiros, 4 MiB cada. Só serão enviados ao submeter.</p>
    <Feedback error={error} />
    <ul className="attachment-list">{files.map((file, index) => <li key={index} className="attachment-row">
      <span className="attachment-meta">{file.name} ({file.size} bytes)</span>
      <span className="attachment-actions"><button type="button" className="icon-button" aria-label={`Retirar ${file.name}`} disabled={disabled}
        onClick={() => change(files.filter((_, position) => position !== index))}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6" /></svg>
      </button></span>
    </li>)}</ul>
  </div>;
}

export async function uploadFiles<T>(path: string, files: File[], content?: string) {
  const form = new FormData();
  if (content !== undefined) form.append('comment', new Blob([JSON.stringify({ content })], { type: 'application/json' }));
  files.forEach(file => form.append('files', file));
  return api<T>(path, { method: 'POST', body: form });
}

export function AttachmentList({ base, items, changed }: { base: string; items: TaskAttachment[]; changed: () => void }) {
  const mutation = useMutation();
  const urls = useRef(new Set<string>());
  const alive = useRef(true);
  useEffect(() => { alive.current = true; const current = urls.current; return () => {
    alive.current = false; current.forEach(url => URL.revokeObjectURL(url)); current.clear();
  }; }, []);
  return <><Feedback {...mutation} /><ul className="attachment-list">{items.map(file => <li key={file.id} className="attachment-row">
    <span className="attachment-meta">{file.filename} · {file.sizeBytes} bytes · {file.author.displayName} · <time dateTime={file.createdAt}>{new Date(file.createdAt).toLocaleString('pt-PT')}</time></span>
    <span className="attachment-actions"><button type="button" className="icon-button" aria-label={`Descarregar ${file.filename}`} disabled={mutation.busy} onClick={() => void mutation.run(async () => {
      const blob = await api<Blob>(`${base}/attachments/${file.id}`, {}, 'blob');
      if (!alive.current) return;
      const url = URL.createObjectURL(blob); urls.current.add(url);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.filename;
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 1000);
    }, 'Download solicitado.')}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg></button>
    {file.canDelete && <button type="button" className="icon-button danger" aria-label={`Eliminar ${file.filename}`} disabled={mutation.busy} onClick={() => {
      if (window.confirm(`Eliminar ${file.filename}?`)) void mutation.run(async () => {
        await write(`${base}/attachments/${file.id}`, 'DELETE'); changed();
      }, 'Ficheiro eliminado.');
    }}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6" /></svg></button>}</span>
  </li>)}</ul></>;
}

export function TaskAttachments({ base, revision, changed, draft }: { base: string; revision: number; changed: () => void; draft: (dirty: boolean) => void }) {
  const resource = useResource<{ items: TaskAttachment[] }>(base + '/attachments', revision);
  const [files, setFiles] = useState<File[]>([]);
  const mutation = useMutation();
  const change = (next: File[]) => { setFiles(next); draft(next.length > 0); };
  return <section className="card"><h2>Anexos</h2><Feedback {...mutation} />
    <LoadState {...resource}>{resource.data && <>
      {!resource.data.items.length && <p>Sem anexos diretos.</p>}
      <AttachmentList base={base} items={resource.data.items} changed={changed} />
    </>}</LoadState>
    <form onSubmit={submit(() => void mutation.run(async () => {
      const error = validateFiles(files, resource.data?.items.length ?? 0);
      if (error) throw new ApiError(error, 422, { files: error });
      await uploadFiles(base + '/attachments', files); change([]); changed();
    }, 'Anexos enviados.'))}>
      <FilePicker files={files} change={change} existing={resource.data?.items.length ?? 0} disabled={mutation.busy} label="Anexos diretos" />
      <FieldError field="files" errors={mutation.fields} />
      <button disabled={mutation.busy || !files.length || resource.loading || !!resource.error}>Enviar anexos</button>
    </form><p className="form-note">O servidor valida formato e assinatura; não é uma análise antivírus. Em falha de ligação, consulte os anexos antes de repetir.</p>
  </section>;
}
