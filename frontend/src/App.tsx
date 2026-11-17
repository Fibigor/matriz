import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { api, ApiError } from './api';
import type { User } from './types';
import { Projects } from './Projects';
import { ProjectDetail, TaskDetail } from './Tasks';
import { Feedback, useMutation } from './ui';
import { Layout } from './Layout';
import { TaskDetailPanel, requestTaskClose } from './TaskDetailPanel';

function subscribe(callback: () => void) {
  let previous = window.location.hash;
  const navigate = () => {
    if (!requestTaskClose()) window.history.replaceState(null, '', previous || '#/');
    else previous = window.location.hash;
    callback();
  };
  window.addEventListener('hashchange', navigate);
  return () => window.removeEventListener('hashchange', navigate);
}
const hash = () => window.location.hash;

const demoAccounts = [
  { name: 'Ana', email: 'ana@example.invalid' },
  { name: 'Bruno', email: 'bruno@example.invalid' },
  { name: 'Carla', email: 'carla@example.invalid' },
];
const demoPassword = 'Matriz-Demo-2026!';

function validEmail(email: string) {
  // IdentityService and AuthController use String.trim(), UTF-16 length and Java's ASCII \s.
  const normalized = email.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '').toLowerCase();
  return normalized.length <= 254 && /^[^\t\n\v\f\r @]+@[^\t\n\v\f\r @]+\.[^\t\n\v\f\r @]+$/.test(normalized);
}

function Register({ onBack, onRegistered }: { onBack: () => void; onRegistered: (message: string) => void }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => { form.current?.querySelector<HTMLInputElement>('input')?.focus(); }, []);
  useEffect(() => { form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(); }, [fields]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const invalid: Record<string, string> = {};
    // Inputs.title: Java whitespace + space characters + NEL (not JS trim's BOM).
    const name = displayName.replace(/^[\p{White_Space}\u001c-\u001f]+|[\p{White_Space}\u001c-\u001f]+$/gu, '');
    if (!name || [...name].length > 120) invalid.displayName = 'Use entre 1 e 120 caracteres, sem contar espaços nas extremidades.';
    if (!validEmail(email)) {
      invalid.email = 'Indique um email válido com até 254 caracteres.';
    }
    if ([...password].length < 12 || [...password].length > 200) invalid.password = 'Use entre 12 e 200 caracteres.';
    if (confirmation !== password) invalid.confirmation = 'As palavras-passe não coincidem.';
    setFields(invalid); setError('');
    if (Object.keys(invalid).length) return;
    lock.current = true; setBusy(true);
    try {
      const result = await api<{ message: string }>('/auth/register', {
        method: 'POST', body: JSON.stringify({ displayName, email, password }),
      });
      onRegistered(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível criar a conta.');
      if (reason instanceof ApiError) setFields(reason.fields);
    } finally {
      lock.current = false; setBusy(false);
    }
  }

  function fieldError(field: string) {
    return fields[field] ? <span id={`register-${field}-error`} className="field-error" role="alert">{fields[field]}</span> : null;
  }
  function accessibility(field: string) {
    return { 'aria-invalid': !!fields[field], 'aria-describedby': fields[field] ? `register-${field}-error` : undefined };
  }

  return <>
    <p className="eyebrow">Comece aqui</p><h1>Criar conta</h1>
    <p className="muted">Demonstração académica: a conta fica ativa sem confirmação por email. Não use credenciais reais.</p>
    <Feedback error={error} />
    <form ref={form} onSubmit={event => void submit(event)} noValidate aria-busy={busy}>
      <label htmlFor="register-displayName">Nome</label>
      <input id="register-displayName" autoComplete="name" required disabled={busy}
        {...accessibility('displayName')} value={displayName} onChange={event => setDisplayName(event.target.value)} />
      {fieldError('displayName')}
      <label htmlFor="register-email">Email</label>
      <input id="register-email" type="text" inputMode="email" autoComplete="username" autoCapitalize="none" required disabled={busy}
        {...accessibility('email')} value={email} onChange={event => setEmail(event.target.value)} />
      {fieldError('email')}
      <label htmlFor="register-password">Palavra-passe</label>
      <input id="register-password" type="password" autoComplete="new-password" required disabled={busy}
        {...accessibility('password')} value={password} onChange={event => setPassword(event.target.value)} />
      {fieldError('password')}
      <p className="muted">12–200 caracteres Unicode. Espaços são permitidos e contam; não é exigida composição específica.</p>
      <label htmlFor="register-confirmation">Confirmar palavra-passe</label>
      <input id="register-confirmation" type="password" autoComplete="new-password" required disabled={busy}
        {...accessibility('confirmation')} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
      {fieldError('confirmation')}
      <button type="submit" disabled={busy}>{busy ? 'A criar conta…' : 'Criar conta'}</button>
      <button type="button" className="button-quiet" disabled={busy} onClick={onBack}>Voltar ao login</button>
    </form>
  </>;
}

function Login({ notice, onLogin }: { notice: string; onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const lock = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!registering) emailInput.current?.focus(); }, [registering]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    setError('');
    setEmailError('');
    if (!validEmail(email)) {
      setEmailError('Indique um email válido com até 254 caracteres.');
      emailInput.current?.focus();
      return;
    }
    if ([...password].length > 200) {
      setError('A palavra-passe admite até 200 caracteres Unicode.');
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      onLogin(await api<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }));
    } catch (reason) {
      setError(reason instanceof ApiError && reason.status === 401
        ? 'Email ou palavra-passe incorretos.'
        : reason instanceof Error ? reason.message : 'Não foi possível iniciar sessão.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return <main className="login-page">
    <section className="login-intro">
      <div className="login-brand"><span className="brand-mark" aria-hidden="true">M</span> MATRIZ</div>
      <p className="eyebrow">O seu espaço de trabalho</p>
      <h2>Menos dispersão.<br /><span>Mais progresso.</span></h2>
      <p>Organize projetos, partilhe o trabalho com a equipa e acompanhe cada passo.</p>
      <div className="login-decoration" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
    </section>
    <section className="card login-card">{registering
      ? <Register onBack={() => setRegistering(false)} onRegistered={message => {
        setPassword(''); setError(''); setSuccess(message); setRegistering(false);
      }} />
      : <><p className="eyebrow">Bem-vindo de volta</p>
    <h1>Entrar na Matriz</h1><p className="muted">O próximo passo começa aqui.</p>
    <Feedback error={error || (success ? '' : notice)} success={success} />
    <form onSubmit={event => void submit(event)}>
      <label htmlFor="login-email">Email</label>
      <input ref={emailInput} id="login-email" type="text" inputMode="email" autoComplete="username" autoCapitalize="none" required
        aria-invalid={!!emailError} aria-describedby={emailError ? 'login-email-error' : undefined}
        value={email} onChange={event => setEmail(event.target.value)} />
      {emailError && <span id="login-email-error" className="field-error" role="alert">{emailError}</span>}
      <label htmlFor="login-password">Palavra-passe</label>
      <input id="login-password" type="password" autoComplete="current-password" required
        maxLength={400} value={password} onChange={event => setPassword(event.target.value)} />
      <button type="submit" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
      <button type="button" className="button-quiet" disabled={busy} onClick={() => {
        setPassword(''); setError(''); setEmailError(''); setSuccess(''); setRegistering(true);
      }}>Criar conta</button>
    </form>
    <div className="demo-accounts">
      <p className="login-note">Contas de demonstração</p>
      <div>{demoAccounts.map(account => <button key={account.email} type="button" className="button-quiet"
        onClick={() => { setEmail(account.email); setPassword(demoPassword); setError(''); setEmailError(''); }}>
        {account.name}
      </button>)}</div>
    </div></>}
    </section>
  </main>;
}

export default function App() {
  const path = useSyncExternalStore(subscribe, hash).replace(/^#\/?/, '');
  const route = path.split('/');
  const [user, setUser] = useState<User>();
  const [starting, setStarting] = useState(true);
  const [notice, setNotice] = useState('');
  const logout = useMutation();
  const [background, setBackground] = useState<string>();
  const [full, setFull] = useState(false);
  const closePanel = useCallback(() => {
    setBackground(previous => { if (previous) window.location.hash = '/' + previous; return undefined; });
  }, []);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest('a');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
      const match = anchor.getAttribute('href')?.match(/^#\/projects\/([^/]+)\/tasks\/([^/]+)$/);
      if (!match || !window.matchMedia('(min-width: 961px)').matches) return;
      const current = window.location.hash.replace(/^#\/?/, '');
      if (current !== 'projects/' + match[1]) return;
      event.preventDefault(); setBackground(current); setFull(false); window.location.hash = anchor.hash;
    };
    const fullPage = () => setFull(true);
    document.addEventListener('click', click); window.addEventListener('task-full-page', fullPage);
    const deleted = () => setBackground(undefined);
    window.addEventListener('task-deleted', deleted);
    return () => { document.removeEventListener('click', click); window.removeEventListener('task-full-page', fullPage); window.removeEventListener('task-deleted', deleted); };
  }, []);
  useEffect(() => {
    if (background && (!path.startsWith(background + '/tasks/') || route.length !== 4)) setBackground(undefined);
  }, [path]);
  useEffect(() => {
    const expired = () => { setUser(undefined); setNotice('A sessão terminou. Inicie sessão novamente.'); };
    window.addEventListener('session-expired', expired);
    api<User>('/auth/me').then(setUser).catch((error: unknown) => {
      if (!(error instanceof ApiError && error.status === 401)) setNotice(error instanceof Error ? error.message : 'Falha ao consultar sessão.');
    }).finally(() => setStarting(false));
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (starting) return <main className="session-loading"><p role="status">A verificar sessão…</p></main>;
  if (!user) return <Login notice={notice} onLogin={setUser} />;
  let content = <Projects dashboard />;
  const panel = !!background && route[0] === 'projects' && route[2] === 'tasks' && !!route[3];
  if (route[0] === 'projects') {
    if (panel) content = <ProjectDetail key={route[1]} id={route[1]} />;
    else if (route[1] && route[2] === 'tasks' && route[3]) content = <TaskDetail key={route[3]} projectId={route[1]} id={route[3]} />;
    else if (route[1]) content = <ProjectDetail key={route[1]} id={route[1]} />;
    else content = <Projects />;
  }
  return <Layout user={user} route={path} busy={logout.busy} onLogout={() => {
    if (!requestTaskClose()) return;
    void logout.run(async () => {
        await api('/auth/logout', { method: 'POST' }); setUser(undefined); setNotice('Sessão terminada.'); window.location.hash = '/';
      }, '');
    }}>
    <Feedback error={logout.error} /><div hidden={panel && full}>{content}</div>
    {panel && <TaskDetailPanel key={route[3]} close={closePanel} full={full}><TaskDetail key={route[3]} projectId={route[1]} id={route[3]} /></TaskDetailPanel>}
  </Layout>;
}
