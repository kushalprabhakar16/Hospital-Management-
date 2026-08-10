/* ============================================================
   api.js — API client with automatic Demo Mode fallback
   Tries REST API → falls back to LocalStorage (Demo Mode)
   ============================================================ */

const API = (() => {
  const BASE_URL = localStorage.getItem('kmsh_api_url') || 'http://localhost:5000/api';
  let online = false;
  let checking = false;

  async function probe() {
    if (checking) return online;
    checking = true;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(`${BASE_URL}/health`, { signal: ctrl.signal });
      clearTimeout(t);
      online = res.ok;
    } catch { online = false; }
    checking = false;
    return online;
  }

  function isOnline() { return online; }
  function setOnline(v) { online = !!v; }

  function token() { return localStorage.getItem('kmsh_token'); }
  function authHeaders() {
    const t = token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function request(path, opts = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = { 'Content-Type': 'application/json', ...authHeaders(), ...(opts.headers || {}) };
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Request failed');
    }
    return res.status === 204 ? null : res.json();
  }

  return { probe, isOnline, setOnline, request, getBaseUrl: () => BASE_URL, token, authHeaders };
})();
