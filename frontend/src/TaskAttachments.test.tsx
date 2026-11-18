import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
  it('seleção mostra só X após metadados, por ficheiro; retirar não faz DELETE nem upload', async () => {
    const long = new File(['exemplo'], 'nome-ficticio-'.repeat(15) + '.txt', { type: 'text/plain' });
    function Picker() { const [files, change] = useState<File[]>([file, long]); return <FilePicker files={files} change={change} />; }
    render(<Picker />);
    for (const selected of [file, long]) {
      const remove = screen.getByRole('button', { name: `Retirar ${selected.name}` });
      expect(remove.textContent).toBe('');
      expect(remove).toHaveAttribute('type', 'button');
      expect(remove.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(remove.querySelector('svg')).toHaveAttribute('focusable', 'false');
      const row = remove.closest('li')!;
      expect(row.firstElementChild).toHaveTextContent(`${selected.name} (${selected.size} bytes)`);
      expect(row.firstElementChild!.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    const remove = screen.getByRole('button', { name: 'Retirar teste.txt' });
    remove.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('button', { name: 'Retirar teste.txt' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Retirar ${long.name}` })).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
  it('anexos guardados mostram metadados → download → X autorizado, sem texto visível das ações', () => {
    render(<AttachmentList base="/task" items={[{ ...attachment, canDelete: true }, { ...attachment, id: 'b', filename: 'outro.md' }]} changed={vi.fn()} />);
    const download = screen.getByRole('button', { name: 'Descarregar teste.txt' });
    const remove = screen.getByRole('button', { name: 'Eliminar teste.txt' });
    const row = download.closest('li')!;
    expect(row.firstElementChild).toHaveTextContent('teste.txt · 5 bytes · Ana');
    expect(within(row).getByText(/teste.txt · 5 bytes · Ana/).compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(row).getAllByRole('button')).toEqual([download, remove]);
    for (const action of [download, remove, screen.getByRole('button', { name: 'Descarregar outro.md' })]) {
      expect(action.textContent).toBe('');
      expect(action).toHaveAttribute('type', 'button');
      expect(action.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(action.querySelector('svg')).toHaveAttribute('focusable', 'false');
    }
    expect(screen.queryByRole('button', { name: 'Eliminar outro.md' })).not.toBeInTheDocument();
  });
  it('eliminar cancela sem pedido, bloqueia duplicação e mantém erro/sucesso explícitos', async () => {
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const changed = vi.fn();
    let reject!: (reason: unknown) => void;
    vi.mocked(write).mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; })).mockResolvedValue(undefined);
    render(<AttachmentList base="/task" items={[{ ...attachment, canDelete: true }]} changed={changed} />);
    const remove = screen.getByRole('button', { name: 'Eliminar teste.txt' });
    await userEvent.click(remove);
    expect(write).not.toHaveBeenCalled();
    confirmation.mockReturnValue(true);
    await userEvent.dblClick(remove);
    expect(write).toHaveBeenCalledExactlyOnceWith('/task/attachments/a', 'DELETE');
    expect(remove).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descarregar teste.txt' })).toBeDisabled();
    await act(async () => reject(new ApiError('Eliminação recusada.', 403)));
    expect(screen.getByRole('alert')).toHaveTextContent('Eliminação recusada.');
    expect(remove).toBeEnabled();
    expect(changed).not.toHaveBeenCalled();
    await userEvent.click(remove);
    await screen.findByText('Ficheiro eliminado.');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(2);
  });
  it('download bloqueia duplicação, usa blob/filename e revoga URL ao fim do prazo', async () => {
    vi.useFakeTimers();
    const create = vi.fn(() => 'blob:ficheiro');
    const revoke = vi.fn();
    vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('teste.txt');
      expect(this.href).toBe('blob:ficheiro');
    });
    let finish!: (value: unknown) => void;
    vi.mocked(api).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<AttachmentList base="/task" items={[attachment]} changed={vi.fn()} />);
    const download = screen.getByRole('button', { name: 'Descarregar teste.txt' });
    fireEvent.click(download);
    fireEvent.click(download);
    expect(api).toHaveBeenCalledExactlyOnceWith('/task/attachments/a', {}, 'blob');
    expect(download).toBeDisabled();
    await act(async () => finish(new Blob(['texto'])));
    expect(screen.getByRole('status')).toHaveTextContent('Download solicitado.');
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(download).toBeEnabled();
    act(() => vi.advanceTimersByTime(1000));
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:ficheiro');
  });
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
