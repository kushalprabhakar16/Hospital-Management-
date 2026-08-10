/* ============================================================
   auth.js — Authentication (JWT when backend online, LocalStorage demo)
   ============================================================ */

const Auth = (() => {
  const SESSION_KEY = 'kmsh_session';

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem('kmsh_token'); }

  async function login(email, password, role) {
    if (API.isOnline()) {
      try {
        const res = await API.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, role }),
        });
        if (res.token) localStorage.setItem('kmsh_token', res.token);
        const session = { user: res.user, token: res.token, mode: 'api' };
        setSession(session);
        return session;
      } catch (e) {
        showToast(e.message || 'Login failed', 'error');
        throw e;
      }
    }
    // Demo mode
    const users = DB.all('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    if (role && user.role !== role) throw new Error(`This account is not a ${role}`);
    const session = { user: { ...user, password: undefined }, token: 'demo-' + btoa(user.id), mode: 'demo' };
    setSession(session);
    return session;
  }

  function demoLogin(role) {
    const users = DB.all('users');
    const user = users.find(u => u.role === role) || users[0];
    const session = { user: { ...user, password: undefined }, token: 'demo-' + btoa(user.id), mode: 'demo' };
    setSession(session);
    return session;
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  function requireAuth() {
    const s = getSession();
    if (!s) { window.location.href = 'login.html'; return null; }
    return s;
  }

  function currentUser() { return getSession()?.user; }
  function hasRole(...roles) {
    const u = currentUser();
    return u && roles.includes(u.role);
  }

  return { login, demoLogin, logout, requireAuth, currentUser, hasRole, getSession };
})();
