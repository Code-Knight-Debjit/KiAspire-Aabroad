(function (global) {
  'use strict';

  const API_BASE = '/api'; // point this at your real API origin if it's not same-origin
  const TOKEN_KEY = 'kiaspire_admin_token';
  const ADMIN_KEY = 'kiaspire_admin_info';

  /* ---------- token / session helpers ---------- */
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { /* storage unavailable */ }
  }
  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    } catch (e) { /* storage unavailable */ }
  }
  function isLoggedIn() {
    return !!getToken();
  }
  function getCachedAdmin() {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setCachedAdmin(admin) {
    try { localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)); } catch (e) {}
  }

  /* ---------- low-level request helper ---------- */
  async function request(path, opts) {
    opts = opts || {};
    const method = opts.method || 'GET';
    const headers = { 'Content-Type': 'application/json' };
    if (opts.auth) {
      const token = getToken();
      if (token) headers['Authorization'] = 'Bearer ' + token;
    }

    let res;
    try {
      res = await fetch(API_BASE + path, {
        method: method,
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
    } catch (networkErr) {
      const err = new Error('Could not reach the server. Check your connection and try again.');
      err.status = 0;
      throw err;
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* no/invalid JSON body */ }

    if (res.status === 401 && opts.auth) {
      // Token missing/expired on a gated call — bounce to login.
      clearToken();
      if (typeof window !== 'undefined' && window.location && !window.location.pathname.endsWith('login.html')) {
        const depth = window.location.pathname.includes('/admin/') ? '' : 'admin/';
        window.location.href = depth + 'login.html';
      }
    }

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || ('Request failed (' + res.status + ')');
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }


  // GET /api/services -> Service[]
  function getServices() {
    return request('/services');
  }

  // GET /api/story -> Story[]
  function getStories() {
    return request('/story');
  }

  // GET /api/story/{id} -> Story
  function getStory(id) {
    return request('/story/' + encodeURIComponent(id));
  }

  // POST /api/user/register  body: { name, email, phone }
  function registerUser(payload) {
    return request('/user/register', { method: 'POST', body: payload });
  }

  // POST /api/admin/login  body: { email, password } -> { token, admin }
  async function adminLogin(email, password) {
    const data = await request('/admin/login', { method: 'POST', body: { email: email, password: password } });
    if (data && data.token) {
      setToken(data.token);
      if (data.admin) setCachedAdmin(data.admin);
    }
    return data;
  }

  function adminLogout() {
    clearToken();
  }

  // GET /api/admin/profile -> Admin
  function getAdminProfile() {
    return request('/admin/profile', { auth: true });
  }

  // GET /api/admin/users -> User[]
  function getAdminUsers() {
    return request('/admin/users', { auth: true });
  }
  // GET /api/admin/users/{id} -> User
  function getAdminUser(id) {
    return request('/admin/users/' + encodeURIComponent(id), { auth: true });
  }
  // PATCH /api/admin/users/{id}/status  body: { status }
  function setAdminUserStatus(id, status) {
    return request('/admin/users/' + encodeURIComponent(id) + '/status', { method: 'PATCH', auth: true, body: { status: status } });
  }
  // DELETE /api/admin/users/{id}
  function deleteAdminUser(id) {
    return request('/admin/users/' + encodeURIComponent(id), { method: 'DELETE', auth: true });
  }

  // GET /api/services/admin/all -> Service[] (includes inactive)
  function getAdminServices() {
    return request('/services/admin/all', { auth: true });
  }
  // POST /api/services  body: Partial<Service>
  function createService(payload) {
    return request('/services', { method: 'POST', auth: true, body: payload });
  }
  // PATCH /api/services/{id}
  function updateService(id, payload) {
    return request('/services/' + encodeURIComponent(id), { method: 'PATCH', auth: true, body: payload });
  }
  // DELETE /api/services/{id}
  function deleteService(id) {
    return request('/services/' + encodeURIComponent(id), { method: 'DELETE', auth: true });
  }

  // See note at top of file re: no distinct admin listing route was specified for stories.
  function getAdminStories() {
    return request('/story', { auth: true });
  }
  // POST /api/story  body: Partial<Story>
  function createStory(payload) {
    return request('/story', { method: 'POST', auth: true, body: payload });
  }
  // PATCH /api/story/{id}
  function updateStory(id, payload) {
    return request('/story/' + encodeURIComponent(id), { method: 'PATCH', auth: true, body: payload });
  }
  // DELETE /api/story/{id}
  function deleteStory(id) {
    return request('/story/' + encodeURIComponent(id), { method: 'DELETE', auth: true });
  }

  /* ---------- export ---------- */
  global.KiAspireAPI = {
    isLoggedIn: isLoggedIn,
    getCachedAdmin: getCachedAdmin,
    clearToken: clearToken,

    getServices: getServices,
    getStories: getStories,
    getStory: getStory,
    registerUser: registerUser,

    adminLogin: adminLogin,
    adminLogout: adminLogout,
    getAdminProfile: getAdminProfile,

    getAdminUsers: getAdminUsers,
    getAdminUser: getAdminUser,
    setAdminUserStatus: setAdminUserStatus,
    deleteAdminUser: deleteAdminUser,

    getAdminServices: getAdminServices,
    createService: createService,
    updateService: updateService,
    deleteService: deleteService,

    getAdminStories: getAdminStories,
    createStory: createStory,
    updateStory: updateStory,
    deleteStory: deleteStory
  };

})(window);
