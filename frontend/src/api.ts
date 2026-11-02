export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fields: Record<string, string> = {}) {
    super(message);
  }
}

const API_BASE = '/api';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const method = init.method ?? 'GET';
  if (!['GET', 'HEAD'].includes(method)) {
    const csrf = await api<{ headerName: string; token: string }>('/auth/csrf');
    headers.set(csrf.headerName, csrf.token);
    if (init.body && !(init.body instanceof URLSearchParams)) headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(API_BASE + path, { ...init, headers, credentials: 'same-origin' });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(method === 'GET'
      ? 'Não foi possível contactar o servidor. Tente novamente.'
      : 'A ligação falhou. O resultado pode ser incerto; consulte os dados antes de repetir.', 0);
  }
  if (!response.ok) {
    let detail = `Operação recusada (${response.status}).`;
    const fields: Record<string, string> = {};
    if (response.headers.get('content-type')?.includes('json')) {
      const problem: unknown = await response.json();
      if (typeof problem === 'object' && problem !== null) {
        if ('detail' in problem && typeof problem.detail === 'string') detail = problem.detail;
        if ('errors' in problem && Array.isArray(problem.errors)) {
          for (const field of problem.errors) {
            if (typeof field === 'object' && field !== null && 'field' in field && 'message' in field
              && typeof field.field === 'string' && typeof field.message === 'string') fields[field.field] = field.message;
          }
        }
      }
    }
    if (response.status === 401 && path !== '/auth/me' && path !== '/auth/login') {
      window.dispatchEvent(new Event('session-expired'));
    }
    throw new ApiError(detail, response.status, fields);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function write<T>(path: string, method: string, body?: unknown): Promise<T> {
  return api<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}

export function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

export function query(values: Record<string, string | number>): string {
  return new URLSearchParams(Object.entries(values).filter(([, value]) => value !== '').map(([key, value]) => [key, String(value)])).toString();
}
