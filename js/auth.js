/* ============================================================
   TopScuole.it — Auth System con verifica email OTP
   Flusso: Registrazione → Invio OTP via EmailJS → Verifica codice → Account attivo
   ============================================================ */

(function () {
    'use strict';

    var USERS_KEY = 'ts_users';
    var SESSION_KEY = 'ts_session';
    var PENDING_KEY = 'ts_pending_reg'; // registrazione in attesa di verifica
    var OTP_EXPIRY = 10 * 60 * 1000;  // 10 minuti

    /* ---------- Helpers ---------------------------------------- */

    function getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; }
    }
    function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

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
        var h = 0;
        for (var i = 0; i < pw.length; i++) { h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0; }
        return h.toString(36);
    }

    function uid() {
        return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    }

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function showError(msg) {
        var el = document.getElementById('authError');
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }
    function hideError() {
        var el = document.getElementById('authError');
        if (el) { el.style.display = 'none'; el.textContent = ''; }
    }
    function showOtpError(msg) {
        var el = document.getElementById('otpError');
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }
    function hideOtpError() {
        var el = document.getElementById('otpError');
        if (el) { el.style.display = 'none'; el.textContent = ''; }
    }

    function btnLoading(id, loading, label) {
        var btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = loading;
        if (loading) {
            btn.dataset._orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            btn.innerHTML = btn.dataset._orig || label || btn.innerHTML;
        }
    }

    /* ---------- EmailJS ---------------------------------------- */

    function isEmailJSConfigured() {
        var cfg = window.EMAILJS_CONFIG;
        return cfg &&
            cfg.publicKey && cfg.publicKey !== 'INCOLLA_QUI_LA_TUA_PUBLIC_KEY' &&
            cfg.serviceId && cfg.serviceId !== 'INCOLLA_QUI_IL_SERVICE_ID' &&
            cfg.templateId && cfg.templateId !== 'INCOLLA_QUI_IL_TEMPLATE_ID';
    }

    function sendOTPEmail(toEmail, toName, otp, callback) {
        if (!isEmailJSConfigured()) {
            /* EmailJS non configurato → mostra OTP diretto sulla pagina (solo dev) */
            console.warn('[TopScuole] EmailJS non configurato. OTP demo: ' + otp);
            callback(null, otp); // successo senza invio reale
            return;
        }

        if (typeof emailjs === 'undefined') {
            callback(new Error('EmailJS SDK non caricato.'));
            return;
        }

        var cfg = window.EMAILJS_CONFIG;
        emailjs.init(cfg.publicKey);

        var templateParams = {
            to_email: toEmail,
            to_name: toName.split(' ')[0],
            otp_code: otp,
            subject: 'Codice di verifica TopScuole.it - ' + otp,
            app_name: 'TopScuole.it'
        };

        emailjs.send(cfg.serviceId, cfg.templateId, templateParams)
            .then(function () { callback(null); })
            .catch(function (err) { callback(err); });
    }

    /* ---------- Modale Auth ------------------------------------ */

    window.openAuthModal = function (tab) {
        var modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(function () { modal.classList.add('open'); }, 10);
        }
        hideError();
        showPane('auth');
        if (tab) window.switchAuthTab(tab);
    };

    window.closeAuthModal = function () {
        var modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('open');
            setTimeout(function () { modal.style.display = 'none'; }, 300);
        }
        hideError();
        hideOtpError();
        showPane('auth');
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

    /* Switcha tra pannello auth e pannello OTP */
    function showPane(which) {
        var authPane = document.getElementById('authPaneWrapper');
        var otpPane = document.getElementById('otpPane');
        if (which === 'otp') {
            if (authPane) authPane.style.display = 'none';
            if (otpPane) otpPane.style.display = '';
        } else {
            if (authPane) authPane.style.display = '';
            if (otpPane) otpPane.style.display = 'none';
        }
    }

    /* ---------- Registrazione + OTP ---------------------------- */

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

        var users = getUsers();
        var emailKey = email.trim().toLowerCase();
        if (users[emailKey]) {
            showError("Email già registrata. Accedi o usa un'altra email.");
            return;
        }

        btnLoading('btnRegister', true);

        var otp = generateOTP();
        var user = {
            uid: uid(),
            name: name.trim(),
            email: emailKey,
            initials: name.trim().split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
            verified: false
        };

        /* Salva registrazione pendente */
        localStorage.setItem(PENDING_KEY, JSON.stringify({
            user: user,
            hash: hashPassword(pw),
            otp: otp,
            expiresAt: Date.now() + OTP_EXPIRY
        }));

        sendOTPEmail(emailKey, name, otp, function (err, demoOtp) {
            btnLoading('btnRegister', false);

            if (err) {
                showError('Errore invio email: ' + (err.text || err.message || 'riprova.'));
                return;
            }

            /* Mostra pannello verifica */
            var emailDisplay = document.getElementById('otpEmailDisplay');
            if (emailDisplay) emailDisplay.textContent = emailKey;

            /* Se EmailJS non configurato, mostra OTP in chiaro per test */
            if (!isEmailJSConfigured()) {
                var demoInfo = document.getElementById('otpDemoInfo');
                if (demoInfo) {
                    demoInfo.style.display = '';
                    demoInfo.innerHTML = '🔧 <strong>Modalità demo</strong>: il codice è <strong style="font-size:1.3rem;color:var(--navy);letter-spacing:4px">' + otp + '</strong>';
                }
            }

            showPane('otp');
            hideError();
            var otpInput = document.getElementById('otpInput');
            if (otpInput) { otpInput.value = ''; otpInput.focus(); }

            /* Countdown 10 minuti */
            startOtpCountdown();
        });
    };

    /* Countdown timer OTP */
    var countdownTimer = null;
    function startOtpCountdown() {
        var el = document.getElementById('otpCountdown');
        if (!el) return;
        var seconds = 600;
        clearInterval(countdownTimer);
        countdownTimer = setInterval(function () {
            seconds--;
            var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                el.textContent = '00:00';
                showOtpError('Codice scaduto. Riprova la registrazione.');
            }
        }, 1000);
    }

    /* Rinvia OTP */
    window.resendOTP = function () {
        var raw = localStorage.getItem(PENDING_KEY);
        if (!raw) { showOtpError('Sessione scaduta. Ricomincia la registrazione.'); return; }
        var pending = JSON.parse(raw);
        var newOtp = generateOTP();
        pending.otp = newOtp;
        pending.expiresAt = Date.now() + OTP_EXPIRY;
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

        sendOTPEmail(pending.user.email, pending.user.name, newOtp, function (err) {
            if (err) { showOtpError('Errore reinvio: ' + (err.text || err.message)); return; }

            if (!isEmailJSConfigured()) {
                var demoInfo = document.getElementById('otpDemoInfo');
                if (demoInfo) demoInfo.innerHTML = '🔧 <strong>Modalità demo</strong>: nuovo codice <strong style="font-size:1.3rem;color:var(--navy);letter-spacing:4px">' + newOtp + '</strong>';
            }

            hideOtpError();
            startOtpCountdown();
            showToast('Nuovo codice inviato! 📧', 'success');
        });
    };

    /* Verifica OTP inserito dall'utente */
    window.verifyOTP = function () {
        hideOtpError();
        var code = ((document.getElementById('otpInput') || {}).value || '').trim();
        if (!code || code.length !== 6) { showOtpError('Inserisci il codice a 6 cifre.'); return; }

        var raw = localStorage.getItem(PENDING_KEY);
        if (!raw) { showOtpError('Sessione scaduta. Ricomincia la registrazione.'); return; }

        var pending = JSON.parse(raw);

        if (Date.now() > pending.expiresAt) {
            showOtpError('Codice scaduto. Clicca "Reinvia codice" per ottenerne uno nuovo.');
            return;
        }

        btnLoading('btnVerifyOtp', true);
        setTimeout(function () {
            if (code !== pending.otp) {
                showOtpError('Codice errato. Riprova.');
                btnLoading('btnVerifyOtp', false);
                return;
            }

            /* OTP corretto → attiva account */
            pending.user.verified = true;
            var users = getUsers();
            users[pending.user.email] = { user: pending.user, hash: pending.hash };
            saveUsers(users);
            localStorage.removeItem(PENDING_KEY);
            clearInterval(countdownTimer);

            saveSession(pending.user);
            window.closeAuthModal();
            updateNavbarUI(pending.user);
            dispatchAuthChange(pending.user);
            showToast('Account verificato! Benvenuto, ' + pending.user.name.split(' ')[0] + '! 🎉', 'success');
            btnLoading('btnVerifyOtp', false);
        }, 400);
    };

    /* ---------- Login ------------------------------------------ */

    window.signInWithEmail = function () {
        hideError();
        var email = (document.getElementById('authEmail') || {}).value || '';
        var pw = (document.getElementById('authPassword') || {}).value || '';

        if (!email.includes('@')) { showError("Inserisci un'email valida."); return; }
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
            if (!rec.user.verified) {
                showError('Account non verificato. Completa la verifica email.');
                btnLoading('btnLoginEmail', false);
                return;
            }
            saveSession(rec.user);
            window.closeAuthModal();
            updateNavbarUI(rec.user);
            dispatchAuthChange(rec.user);
            showToast('Bentornato, ' + rec.user.name.split(' ')[0] + '! 👋', 'success');
            btnLoading('btnLoginEmail', false);
        }, 500);
    };

    /* ---------- Google (non disponibile senza Firebase) -------- */

    window.signInWithGoogle = function () {
        showError('Il login con Google richiede Firebase. Usa email e password.');
    };

    /* ---------- Logout ----------------------------------------- */

    window.handleSignOut = function () {
        clearSession();
        updateNavbarUI(null);
        dispatchAuthChange(null);
        showToast('Hai effettuato il logout.', 'success');
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
        if (dd && widget && !widget.contains(e.target)) dd.style.display = 'none';
    });

    /* ---------- Navbar / Form UI ------------------------------- */

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
        updateReviewFormUI(user);
    }

    function updateReviewFormUI(user) {
        var formWrap = document.getElementById('newReviewFormWrap');
        var loginPrompt = document.getElementById('reviewLoginPrompt');
        if (formWrap) formWrap.style.display = user ? '' : 'none';
        if (loginPrompt) loginPrompt.style.display = user ? 'none' : '';
    }

    /* ---------- Auth state event ------------------------------- */

    function dispatchAuthChange(user) {
        document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: user } }));
    }

    /* ---------- Toast ------------------------------------------ */

    function showToast(msg, type) {
        var existing = document.querySelector('.ts-toast');
        if (existing) existing.remove();
        var t = document.createElement('div');
        t.className = 'ts-toast';
        t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);'
            + 'background:' + (type === 'success' ? '#0D1B2A' : '#F4C430') + ';'
            + 'color:' + (type === 'success' ? '#fff' : '#0D1B2A') + ';'
            + 'padding:.85rem 1.75rem;border-radius:999px;font-weight:600;font-size:.9rem;'
            + 'box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:9999;white-space:nowrap;'
            + 'font-family:Inter,sans-serif;animation:fadeInUp .3s ease;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () {
            t.style.opacity = '0'; t.style.transition = 'opacity .4s';
            setTimeout(function () { t.remove(); }, 400);
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
