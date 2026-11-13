import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
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

function Login({ notice, onLogin }: { notice: string; onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
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
    <section className="card login-card"><p className="eyebrow">Bem-vindo de volta</p>
    <h1>Entrar na Matriz</h1><p className="muted">O próximo passo começa aqui.</p>
    <Feedback error={error || notice} />
    <form onSubmit={event => void submit(event)}>
      <label htmlFor="login-email">Email</label>
      <input id="login-email" type="email" autoComplete="username" autoCapitalize="none" required
        maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
      <label htmlFor="login-password">Palavra-passe</label>
      <input id="login-password" type="password" autoComplete="current-password" required
        maxLength={200} value={password} onChange={event => setPassword(event.target.value)} />
      <button type="submit" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
    </form>
    <div className="demo-accounts">
      <p className="login-note">Contas de demonstração</p>
      <div>{demoAccounts.map(account => <button key={account.email} type="button" className="button-quiet"
        onClick={() => { setEmail(account.email); setPassword(demoPassword); setError(''); }}>
        {account.name}
      </button>)}</div>
      <p className="login-note">Palavra-passe: <code>{demoPassword}</code></p>
    </div>
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
