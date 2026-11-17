import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('./Projects', () => ({ Projects: () => <h1>Projetos acessíveis</h1> }));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});
const problem = (detail: string, status: number, errors: { field: string; message: string }[] = []) =>
  json({ detail, errors }, status);
const fetchMock = vi.fn<typeof fetch>();
let register: (init: RequestInit) => Promise<Response>;
const registrationCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/auth/register');

async function openRegistration() {
  render(<App />);
  await userEvent.click(await screen.findByRole('button', { name: 'Criar conta' }));
  expect(screen.getByLabelText('Nome')).toHaveFocus();
}

function fill(name = 'Utilizador fictício', email = 'nova@example.invalid', password = 'palavra fictícia', confirmation = password) {
  for (const [label, value] of [
    ['Nome', name], ['Email', email], ['Palavra-passe', password], ['Confirmar palavra-passe', confirmation],
  ]) fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
}

function submitRegistration() {
  fireEvent.submit(screen.getByLabelText('Nome').closest('form')!);
}

describe('Registo na Matriz', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    fetchMock.mockReset();
    register = async () => json({ message: 'Conta criada. Inicie sessão.' }, 201);
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/api/auth/me') return problem('É necessário acesso válido.', 401);
      if (url === '/api/auth/csrf') return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf-ficticio' });
      if (url === '/api/auth/register') return register(init!);
      if (url === '/api/auth/login') return json({ id: 'nova', displayName: 'Utilizador fictício' });
      if (url === '/api/auth/logout') return new Response(null, { status: 204 });
      throw new Error('Pedido não previsto: ' + String(url));
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['máximos Unicode', '\u00a0\u001c' + '🚀'.repeat(120) + '\u0085', ' ' + '🚀'.repeat(198) + ' '],
    ['mínimo sem composição', 'Nome', ' '.repeat(12)],
  ])('cria com %s via CSRF e exige login explícito sem transportar a password', async (_case, name, password) => {
    await openRegistration();
    // Backend normalizes the email before applying its 254 UTF-16-unit limit.
    const email = '  ' + 'A'.repeat(238) + '@EXAMPLE.INVALID  ';
    fill(name, email, password);
    screen.getByLabelText('Confirmar palavra-passe').focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('Conta criada. Inicie sessão.');
    expect(screen.getByRole('heading', { name: 'Entrar na Matriz' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(screen.getByLabelText('Palavra-passe')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth/me', '/api/auth/csrf', '/api/auth/register',
    ]);
    const init = registrationCalls()[0][1]!;
    expect(JSON.parse(init.body as string)).toEqual({ displayName: name, email, password });
    expect(new Headers(init.headers).get('X-CSRF-TOKEN')).toBe('csrf-ficticio');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(init.credentials).toBe('same-origin');

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Palavra-passe'), { target: { value: password } });
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('heading', { name: 'Projetos acessíveis' });
    const login = fetchMock.mock.calls.find(([url]) => url === '/api/auth/login')!;
    expect(JSON.parse(login[1]!.body as string)).toEqual({ email, password });
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(await screen.findByRole('heading', { name: 'Entrar na Matriz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ana' })).toBeInTheDocument();
  });

  it.each(['josé@example.invalid', 'nome@exemplo.inválido', '🚀@example.invalid'])(
    'permite registar %s e submeter o mesmo email no login por teclado com CSRF', async email => {
      await openRegistration();
      const password = 'palavra fictícia';
      fill('Utilizador fictício', email, password);
      await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Conta criada. Inicie sessão.');
      expect(screen.getByLabelText('Email')).toHaveFocus();
      expect(screen.getByLabelText('Palavra-passe')).toHaveValue('');
      expect(fetchMock.mock.calls.some(([url]) => url === '/api/auth/login')).toBe(false);
      expect(JSON.parse(registrationCalls()[0][1]!.body as string).email).toBe(email);

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('inputmode', 'email');
      fireEvent.change(input, { target: { value: email } });
      fireEvent.change(screen.getByLabelText('Palavra-passe'), { target: { value: password } });
      expect(input.closest('form')!.checkValidity()).toBe(true);
      screen.getByLabelText('Palavra-passe').focus();
      await userEvent.keyboard('{Enter}');
      await screen.findByRole('heading', { name: 'Projetos acessíveis' });
      const logins = fetchMock.mock.calls.filter(([url]) => url === '/api/auth/login');
      expect(logins).toHaveLength(1);
      expect(JSON.parse(logins[0][1]!.body as string)).toEqual({ email, password });
      expect(new Headers(logins[0][1]!.headers).get('X-CSRF-TOKEN')).toBe('csrf-ficticio');
      expect(logins[0][1]!.credentials).toBe('same-origin');
    },
  );

  it('valida o email no login com erro acessível e conserva credenciais; aceita password antiga curta', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Entrar na Matriz' });
    const input = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Palavra-passe');
    fireEvent.change(password, { target: { value: 'x' } });
    for (const email of ['   ', 'a@b', 'a b@example.invalid', 'a'.repeat(239) + '@example.invalid']) {
      fireEvent.change(input, { target: { value: email } });
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription('Indique um email válido com até 254 caracteres.');
      expect(input).toHaveFocus();
      expect(input).toHaveValue(email);
      expect(password).toHaveValue('x');
    }
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/auth/me']);

    fireEvent.change(input, { target: { value: 'josé@example.invalid' } });
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('heading', { name: 'Projetos acessíveis' });
    const login = fetchMock.mock.calls.find(([url]) => url === '/api/auth/login')!;
    expect(JSON.parse(login[1]!.body as string)).toEqual({ email: 'josé@example.invalid', password: 'x' });
  });

  it('recusa limites inválidos por pontos de código e confirmação exata, focando o campo sem enviar pedidos', async () => {
    await openRegistration();
    const cases = [
      { name: ' \u00a0\u0085\u001c', field: 'Nome' },
      { name: '🚀'.repeat(121), field: 'Nome' },
      { email: 'a@b', field: 'Email' },
      { email: 'a'.repeat(239) + '@example.invalid', field: 'Email' },
      { password: '🚀'.repeat(11), field: 'Palavra-passe' },
      { password: '🚀'.repeat(201), field: 'Palavra-passe' },
      { password: ' password fictícia ', confirmation: 'password fictícia', field: 'Confirmar palavra-passe' },
    ];
    for (const value of cases) {
      fill(value.name, value.email, value.password, value.confirmation ?? value.password);
      submitRegistration();
      const input = screen.getByLabelText(value.field, { exact: true });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription();
      expect(input).toHaveFocus();
    }
    expect(registrationCalls()).toHaveLength(0);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/auth/me']);
  });

  it.each([
    [422, 'Reveja o nome.', [{ field: 'displayName', message: 'Nome recusado pelo servidor.' }], 'Nome'],
    [409, 'Já existe uma conta com este email.', [{ field: 'email', message: 'Email já utilizado.' }], 'Email'],
    [429, 'Demasiados pedidos de registo. Tente novamente mais tarde.', [], undefined],
    [503, 'Serviço temporariamente indisponível.', [], undefined],
    [0, 'A ligação falhou. O resultado pode ser incerto;', [], undefined],
  ] as const)('expõe erro %s, conserva o formulário e não repete a escrita', async (status, detail, errors, field) => {
    register = async () => {
      if (status === 0) throw new TypeError('Falha de rede fictícia');
      return problem(detail, status, [...errors]);
    };
    await openRegistration();
    fill();
    submitRegistration();
    await screen.findByText(detail, { exact: false });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled());
    expect(screen.getByLabelText('Nome')).toHaveValue('Utilizador fictício');
    expect(screen.getByLabelText('Email')).toHaveValue('nova@example.invalid');
    expect(screen.getByLabelText('Palavra-passe', { exact: true })).toHaveValue('palavra fictícia');
    expect(screen.getByLabelText('Confirmar palavra-passe')).toHaveValue('palavra fictícia');
    if (field) {
      expect(screen.getByLabelText(field, { exact: true })).toHaveFocus();
      expect(screen.getByLabelText(field, { exact: true })).toHaveAccessibleDescription(errors[0].message);
    }
    expect(registrationCalls()).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('bloqueia submits síncronos duplicados e navegação durante o pedido; permite voltar por teclado depois', async () => {
    let finish!: (response: Response) => void;
    register = () => new Promise(resolve => { finish = resolve; });
    await openRegistration();
    fill();
    submitRegistration();
    submitRegistration();
    await waitFor(() => expect(registrationCalls()).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'A criar conta…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Voltar ao login' })).toBeDisabled();
    expect(screen.getByLabelText('Nome').closest('form')).toHaveAttribute('aria-busy', 'true');
    await act(async () => finish(problem('Pedido recusado.', 422)));
    screen.getByRole('button', { name: 'Voltar ao login' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByLabelText('Email')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Ana' }));
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.invalid');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('heading', { name: 'Projetos acessíveis' });
    act(() => window.dispatchEvent(new Event('session-expired')));
    expect(await screen.findByRole('alert')).toHaveTextContent('A sessão terminou. Inicie sessão novamente.');
    expect(screen.getByLabelText('Palavra-passe')).toHaveValue('');
  });
});
