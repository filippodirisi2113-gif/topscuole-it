/* ============================================================
   TopScuole.it — Auth System (localStorage, no Firebase)
   Gestisce registrazione, login, logout e stato utente.
   I dati sono salvati nel browser (localStorage).
   ============================================================ */

(function () {
    'use strict';

    var USERS_KEY = 'ts_users';
    var SESSION_KEY = 'ts_session';

    /* ---------- Helpers ---------------------------------------- */

    function getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getSession() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
    }

    function saveSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        window._currentUser = user;
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
        window._currentUser = null;
    }

    function hashPassword(pw) {
        /* semplice hash deterministico per demo - non usare in produzione */
        var h = 0;
        for (var i = 0; i < pw.length; i++) {
            h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
        }
        return h.toString(36);
    }

    function uid() {
        return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    }

    function showError(msg) {
        var el = document.getElementById('authError');
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    function hideError() {
        var el = document.getElementById('authError');
        if (el) { el.style.display = 'none'; el.textContent = ''; }
    }

    function btnLoading(id, loading) {
        var btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = loading;
        if (loading) {
            btn.dataset._orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else if (btn.dataset._orig) {
            btn.innerHTML = btn.dataset._orig;
        }
    }

    /* ---------- Auth Modal ------------------------------------- */

    window.openAuthModal = function (tab) {
        var modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(function () { modal.classList.add('open'); }, 10);
        }
        hideError();
        if (tab) window.switchAuthTab(tab);
    };

    window.closeAuthModal = function () {
        var modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('open');
            setTimeout(function () { modal.style.display = 'none'; }, 300);
        }
        hideError();
    };

    window.switchAuthTab = function (tab) {
        var loginPane = document.getElementById('loginPane');
        var regPane = document.getElementById('registerPane');
        var tabLogin = document.getElementById('tabLogin');
        var tabReg = document.getElementById('tabRegister');
        hideError();
        if (tab === 'login') {
            if (loginPane) loginPane.style.display = '';
            if (regPane) regPane.style.display = 'none';
            if (tabLogin) tabLogin.classList.add('active');
            if (tabReg) tabReg.classList.remove('active');
        } else {
            if (loginPane) loginPane.style.display = 'none';
            if (regPane) regPane.style.display = '';
            if (tabLogin) tabLogin.classList.remove('active');
            if (tabReg) tabReg.classList.add('active');
        }
    };

    /* ---------- Registrazione ---------------------------------- */

    window.registerWithEmail = function () {
        hideError();
        var name = (document.getElementById('regName') || {}).value || '';
        var email = (document.getElementById('regEmail') || {}).value || '';
        var pw = (document.getElementById('regPassword') || {}).value || '';
        var pw2 = (document.getElementById('regConfirm') || {}).value || '';

        if (!name.trim()) { showError('Inserisci nome e cognome.'); return; }
        if (!email.includes('@')) { showError('Indirizzo email non valido.'); return; }
        if (pw.length < 8) { showError('La password deve avere almeno 8 caratteri.'); return; }
        if (pw !== pw2) { showError('Le password non coincidono.'); return; }

        btnLoading('btnRegister', true);
        setTimeout(function () {
            var users = getUsers();
            var emailKey = email.trim().toLowerCase();
            if (users[emailKey]) {
                showError('Email già registrata. Accedi o usa un\'altra email.');
                btnLoading('btnRegister', false);
                return;
            }
            var user = {
                uid: uid(),
                name: name.trim(),
                email: email.trim().toLowerCase(),
                initials: name.trim().split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(),
                createdAt: new Date().toISOString()
            };
            users[emailKey] = { user: user, hash: hashPassword(pw) };
            saveUsers(users);
            saveSession(user);
            window.closeAuthModal();
            updateNavbarUI(user);
            dispatchAuthChange(user);
            showToast('Benvenuto, ' + user.name.split(' ')[0] + '! Account creato. 🎉', 'success');
            btnLoading('btnRegister', false);
        }, 600);
    };

    /* ---------- Login ------------------------------------------ */

    window.signInWithEmail = function () {
        hideError();
        var email = (document.getElementById('authEmail') || {}).value || '';
        var pw = (document.getElementById('authPassword') || {}).value || '';

        if (!email.includes('@')) { showError('Inserisci un\'email valida.'); return; }
        if (!pw) { showError('Inserisci la password.'); return; }

        btnLoading('btnLoginEmail', true);
        setTimeout(function () {
            var users = getUsers();
            var emailKey = email.trim().toLowerCase();
            var rec = users[emailKey];
            if (!rec || rec.hash !== hashPassword(pw)) {
                showError('Email o password errati.');
                btnLoading('btnLoginEmail', false);
                return;
            }
            saveSession(rec.user);
            window.closeAuthModal();
            updateNavbarUI(rec.user);
            dispatchAuthChange(rec.user);
            showToast('Bentornato, ' + rec.user.name.split(' ')[0] + '! 👋', 'success');
            btnLoading('btnLoginEmail', false);
        }, 600);
    };

    /* ---------- Google Sign-In (simulato) ---------------------- */

    window.signInWithGoogle = function () {
        hideError();
        /* In assenza di Firebase mostriamo un messaggio chiaro */
        showError('Il login con Google richiede la configurazione di Firebase. Usa email e password.');
    };

    /* ---------- Logout ----------------------------------------- */

    window.handleSignOut = function () {
        clearSession();
        updateNavbarUI(null);
        dispatchAuthChange(null);
        showToast('Hai effettuato il logout.', 'success');
        /* Chiudi dropdown se aperto */
        var dd = document.getElementById('userDropdown');
        if (dd) dd.style.display = 'none';
    };

    /* ---------- Dropdown --------------------------------------- */

    window.toggleUserDropdown = function () {
        var dd = document.getElementById('userDropdown');
        if (!dd) return;
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    };

    document.addEventListener('click', function (e) {
        var widget = document.getElementById('navUserWidget');
        var dd = document.getElementById('userDropdown');
        if (dd && widget && !widget.contains(e.target)) {
            dd.style.display = 'none';
        }
    });

    /* ---------- Navbar UI -------------------------------------- */

    function updateNavbarUI(user) {
        var loginBtn = document.getElementById('navLoginBtn');
        var userWidget = document.getElementById('navUserWidget');
        var avatar = document.getElementById('navUserAvatar');
        var userName = document.getElementById('navUserName');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userWidget) userWidget.style.display = 'flex';
            if (avatar) avatar.textContent = user.initials || user.name.slice(0, 2).toUpperCase();
            if (userName) userName.textContent = user.name.split(' ')[0];
        } else {
            if (loginBtn) loginBtn.style.display = '';
            if (userWidget) userWidget.style.display = 'none';
        }

        /* Aggiorna anche la form della recensione se presente */
        updateReviewFormUI(user);
    }

    function updateReviewFormUI(user) {
        var formWrap = document.getElementById('newReviewFormWrap');
        var loginPrompt = document.getElementById('reviewLoginPrompt');
        if (formWrap) formWrap.style.display = user ? '' : 'none';
        if (loginPrompt) loginPrompt.style.display = user ? 'none' : '';
    }

    /* ---------- Auth state change event ------------------------ */

    function dispatchAuthChange(user) {
        var ev = new CustomEvent('authStateChanged', { detail: { user: user } });
        document.dispatchEvent(ev);
    }

    /* ---------- Toast ------------------------------------------ */

    function showToast(message, type) {
        if (typeof window.showToast === 'function' && window.showToast !== showToast) {
            window.showToast(message, type); return;
        }
        var existing = document.querySelector('.ts-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'ts-toast';
        toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);'
            + 'background:' + (type === 'success' ? '#0D1B2A' : '#F4C430') + ';'
            + 'color:' + (type === 'success' ? '#fff' : '#0D1B2A') + ';'
            + 'padding:.85rem 1.75rem;border-radius:999px;font-weight:600;font-size:.9rem;'
            + 'box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:9999;white-space:nowrap;'
            + 'font-family:Inter,sans-serif;animation:fadeInUp .3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(function () { toast.remove(); }, 400);
        }, 3500);
    }

    /* ---------- Init ------------------------------------------- */

    function init() {
        var session = getSession();
        window._currentUser = session || null;
        updateNavbarUI(session);
        if (session) dispatchAuthChange(session);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
