import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { api, ApiError, write } from './api';
import { AttachmentList, FilePicker, TaskAttachments, uploadFiles, validateFiles } from './TaskAttachments';
import type { TaskAttachment } from './types';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));
const file = new File(['texto'], 'teste.txt', { type: 'text/plain' });
const attachment: TaskAttachment = { id: 'a', taskId: 't', commentId: null, filename: 'teste.txt', contentType: 'text/plain', sizeBytes: 5, author: { id: 'u', displayName: 'Ana' }, createdAt: '2026-11-13T00:00:00Z', canDelete: false };
describe('Anexos', () => {
  beforeEach(() => vi.resetAllMocks());
  it('valida quantidade, extensão e tamanho sem alegar validação do conteúdo', () => {
    expect(validateFiles([file])).toBe('');
    expect(validateFiles(Array(6).fill(file))).toContain('5');
    expect(validateFiles([new File([new Uint8Array(4194305)], 'large.pdf')])).toContain('4 MiB');
    expect(validateFiles([new File(['x'], 'script.html')])).toContain('Formato');
    expect(validateFiles([file], 5)).toContain('5');
  });
  it('recebe chooser, drop e paste sem enviar automaticamente', async () => {
    function Picker() { const [files, change] = useState<File[]>([]); return <FilePicker files={files} change={change} />; }
    const { container } = render(<Picker />);
    await userEvent.upload(screen.getByLabelText('Ficheiros'), file);
    fireEvent.drop(container.firstChild!, { dataTransfer: { files: [new File(['a'], 'drop.md')] } });
    fireEvent.paste(screen.getByLabelText('Ficheiros'), { clipboardData: { files: [new File(['a'], 'paste.png')] } });
    expect(screen.getByRole('button', { name: 'Retirar teste.txt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retirar drop.md' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retirar paste.png' })).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });
  it('monta multipart com parte JSON tipada e files repetidos', async () => {
    vi.mocked(api).mockResolvedValue({});
    await uploadFiles('/comments', [file, file], 'Olá');
    const form = vi.mocked(api).mock.calls[0][1]?.body as FormData;
    expect(form.getAll('files')).toHaveLength(2);
    expect((form.get('comment') as Blob).type).toBe('application/json');
    expect(vi.mocked(api).mock.calls[0][1]?.headers).toBeUndefined();
  });
  it('preserva ficheiros numa falha e mostra erro canónico files', async () => {
    vi.mocked(api).mockImplementation(async (_path, init) => {
      if (init?.method === 'POST') throw new ApiError('Formato recusado.', 422, { files: 'Assinatura inválida.' });
      return { items: [] };
    });
    const changed = vi.fn();
    render(<TaskAttachments base="/task" revision={0} changed={changed} draft={vi.fn()} />);
    await screen.findByText('Sem anexos diretos.');
    await userEvent.upload(screen.getByLabelText('Anexos diretos'), file);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar anexos' }));
    expect(await screen.findByText('Assinatura inválida.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retirar teste.txt' })).toBeInTheDocument();
    expect(changed).not.toHaveBeenCalled();
  });
  it('aplica canDelete e trata download 401 sem criar URL', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError('Sessão terminada.', 401));
    render(<AttachmentList base="/task" items={[attachment]} changed={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Eliminar teste.txt' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Descarregar teste.txt' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sessão terminada.');
    expect(api).toHaveBeenCalledWith('/task/attachments/a', {}, 'blob');
    expect(write).not.toHaveBeenCalled();
  });
  it('revoga o URL de download quando desmonta', async () => {
    const create = vi.fn(() => 'blob:teste');
    const revoke = vi.fn();
    vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.mocked(api).mockResolvedValue(new Blob(['texto']));
    const { unmount } = render(<AttachmentList base="/task" items={[attachment]} changed={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Descarregar teste.txt' }));
    expect(await screen.findByText('Download solicitado.')).toBeInTheDocument();
    expect(create).toHaveBeenCalledTimes(1);
    unmount(); expect(revoke).toHaveBeenCalledWith('blob:teste');
    vi.unstubAllGlobals();
  });
  it('o cliente real deixa o boundary multipart ao browser e usa CSRF', async () => {
    const actual = await vi.importActual<typeof import('./api')>('./api');
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ headerName: 'X-CSRF-TOKEN', token: 'fictional-test-token' }), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    const form = new FormData(); form.append('files', file);
    await actual.api('/task/attachments', { method: 'POST', body: form });
    const init = fetch.mock.calls[1][1] as RequestInit;
    expect(new Headers(init.headers).get('Content-Type')).toBeNull();
    expect(new Headers(init.headers).get('X-CSRF-TOKEN')).toBe('fictional-test-token');
    expect(init.credentials).toBe('same-origin');
    vi.unstubAllGlobals();
  });
  it('o cliente real devolve bytes e emite expiração de sessão num 401 JSON', async () => {
    const actual = await vi.importActual<typeof import('./api')>('./api');
    const expired = vi.fn(); window.addEventListener('session-expired', expired);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('bytes', { headers: { 'content-type': 'text/plain' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Sessão inválida.' }), { status: 401, headers: { 'content-type': 'application/problem+json' } })));
    const blob = await actual.api<Blob>('/task/attachments/a', {}, 'blob');
    expect(blob.size).toBe(5);
    await expect(actual.api('/task/attachments/a', {}, 'blob')).rejects.toMatchObject({ status: 401, message: 'Sessão inválida.' });
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener('session-expired', expired); vi.unstubAllGlobals();
  });
});
