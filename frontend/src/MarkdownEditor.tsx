import { useEffect, useId, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { codePoints } from './taskTemplates';

export function safeMarkdownUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : '';
}

export function MarkdownBody({ content }: { content: string }) {
  return <div className="markdown-body"><ReactMarkdown skipHtml urlTransform={safeMarkdownUrl}
    disallowedElements={['img']} components={{ a: ({ href, children }) =>
      href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span> }}>{content}</ReactMarkdown></div>;
}

export function MarkdownEditor({ label, value, onChange, required = false }: {
  label: string; value: string; onChange: (value: string) => void; required?: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textarea.current?.setCustomValidity(!preview && codePoints(value) > 2000 ? 'Máximo: 2000 caracteres Unicode.' : '');
  }, [value, preview]);
  return <div className="markdown-editor">
    <div className="editor-toolbar"><button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>Escrever</button>
      <button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>Pré-visualizar</button></div>
    <label htmlFor={id}>{label}</label>
    <textarea ref={textarea} id={id} hidden={preview} required={required && !preview} value={value}
      onInvalid={() => setPreview(false)}
      onChange={event => onChange(event.target.value)} />
    {preview && <MarkdownBody content={value || 'Sem conteúdo.'} />}
    <p className="form-note">{codePoints(value)}/2000 caracteres · Markdown básico; sem HTML ou imagens. Ligações HTTP/HTTPS.</p>
  </div>;
}
