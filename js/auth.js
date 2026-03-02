/**
 * TopScuole.it — Authentication System
 * =======================================
 * Firebase Authentication: Google + Email/Password
 *
 * Dipendenze: firebase-config.js deve essere caricato prima di questo file
 * nelle pagine HTML usando <script type="module">
 *
 * Funzioni esportate:
 *  - openAuthModal(tab)   → apre il modale (tab: 'login' | 'register')
 *  - closeAuthModal()     → chiude il modale
 *  - handleSignOut()      → effettua il logout
 */

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import { app } from "./firebase-config.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* ============================================================
   STATE
   ============================================================ */
let currentUser = null;

/* ============================================================
   AUTH STATE OBSERVER
   ============================================================ */
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateNavbarUI(user);
    updateReviewFormUI(user);
});

/* ============================================================
   NAVBAR UI UPDATE
   ============================================================ */
function updateNavbarUI(user) {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWidget = document.getElementById('navUserWidget');
    const userAvatar = document.getElementById('navUserAvatar');
    const userName = document.getElementById('navUserName');

    if (!loginBtn) return; // pagina senza navbar

    if (user) {
        // Loggato
        loginBtn.style.display = 'none';
        if (userWidget) {
            userWidget.style.display = 'flex';
            if (userAvatar) {
                if (user.photoURL) {
                    userAvatar.style.backgroundImage = `url(${user.photoURL})`;
                    userAvatar.style.backgroundSize = 'cover';
                    userAvatar.textContent = '';
                } else {
                    userAvatar.textContent = user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase();
                }
            }
            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            }
        }
    } else {
        // Non loggato
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userWidget) userWidget.style.display = 'none';
    }
}

/* ============================================================
   REVIEW FORM UI UPDATE
   ============================================================ */
function updateReviewFormUI(user) {
    const reviewForm = document.getElementById('reviewFormContent');
    const reviewGate = document.getElementById('reviewAuthGate');

    if (!reviewForm && !reviewGate) return;

    if (user) {
        if (reviewForm) reviewForm.style.display = 'block';
        if (reviewGate) reviewGate.style.display = 'none';
        // Pre-fill role label with user name
        const roleLabel = document.getElementById('reviewUserName');
        if (roleLabel) roleLabel.textContent = user.displayName || user.email.split('@')[0];
    } else {
        if (reviewForm) reviewForm.style.display = 'none';
        if (reviewGate) reviewGate.style.display = 'flex';
    }
}

/* ============================================================
   GOOGLE SIGN-IN
   ============================================================ */
async function signInWithGoogle() {
    setAuthLoading(true, 'google');
    try {
        const result = await signInWithPopup(auth, provider);
        closeAuthModal();
        showToastAuth(`Benvenuto, ${result.user.displayName}! 👋`, 'success');
    } catch (err) {
        handleAuthError(err);
    } finally {
        setAuthLoading(false, 'google');
    }
}

/* ============================================================
   EMAIL SIGN-IN
   ============================================================ */
async function signInWithEmail() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;

    if (!email || !password) {
        showAuthError('Compila email e password.');
        return;
    }

    setAuthLoading(true, 'email');
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
        showToastAuth(`Bentornato! 👋`, 'success');
    } catch (err) {
        handleAuthError(err);
    } finally {
        setAuthLoading(false, 'email');
    }
}

/* ============================================================
   EMAIL REGISTRATION
   ============================================================ */
async function registerWithEmail() {
    const name = document.getElementById('regName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('regConfirm')?.value;

    clearAuthError();

    if (!name || name.length < 2) {
        showAuthError('Inserisci il tuo nome (min. 2 caratteri).');
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError('Inserisci un indirizzo email valido.');
        return;
    }
    if (!password || password.length < 8) {
        showAuthError('La password deve avere almeno 8 caratteri.');
        return;
    }
    if (password !== confirm) {
        showAuthError('Le password non coincidono.');
        return;
    }

    setAuthLoading(true, 'register');
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        closeAuthModal();
        showToastAuth(`Benvenuto su TopScuole.it, ${name}! 🎉`, 'success');
    } catch (err) {
        handleAuthError(err);
    } finally {
        setAuthLoading(false, 'register');
    }
}

/* ============================================================
   SIGN OUT
   ============================================================ */
async function handleSignOut() {
    try {
        await signOut(auth);
        showToastAuth('Sessione terminata. A presto! 👋', 'info');
        // Close user dropdown if open
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    } catch (err) {
        console.error('Logout error:', err);
    }
}

/* ============================================================
   MODAL CONTROL
   ============================================================ */
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));
    switchAuthTab(tab);
    clearAuthError();
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function switchAuthTab(tab) {
    const loginPane = document.getElementById('loginPane');
    const registerPane = document.getElementById('registerPane');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (!loginPane) return;

    if (tab === 'login') {
        loginPane.style.display = 'block';
        registerPane.style.display = 'none';
        tabLogin?.classList.add('active');
        tabRegister?.classList.remove('active');
    } else {
        loginPane.style.display = 'none';
        registerPane.style.display = 'block';
        tabLogin?.classList.remove('active');
        tabRegister?.classList.add('active');
    }
    clearAuthError();
}

/* ============================================================
   UI HELPERS
   ============================================================ */
function showAuthError(msg) {
    const el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearAuthError() {
    const el = document.getElementById('authError');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function setAuthLoading(loading, context) {
    const btnId = context === 'email' ? 'btnLoginEmail'
        : context === 'google' ? 'btnLoginGoogle'
            : context === 'register' ? 'btnRegister'
                : null;
    const btn = btnId ? document.getElementById(btnId) : null;
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn.dataset.origText = btn.innerHTML;
        btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px;"></span> Attendi...';
    } else {
        btn.innerHTML = btn.dataset.origText || btn.innerHTML;
    }
}

function handleAuthError(err) {
    const messages = {
        'auth/user-not-found': 'Nessun account trovato con questa email.',
        'auth/wrong-password': 'Password errata. Riprova.',
        'auth/email-already-in-use': 'Esiste già un account con questa email.',
        'auth/invalid-email': 'Formato email non valido.',
        'auth/weak-password': 'Password troppo debole (min. 8 caratteri).',
        'auth/too-many-requests': 'Troppi tentativi. Attendi qualche minuto.',
        'auth/popup-closed-by-user': 'Accesso annullato.',
        'auth/network-request-failed': 'Errore di rete. Controlla la connessione.',
        'auth/invalid-credential': 'Credenziali non valide. Riprova.',
    };
    const msg = messages[err.code] || `Errore: ${err.message}`;
    showAuthError(msg);
    console.error('[TopScuole Auth Error]', err.code, err.message);
}

function showToastAuth(message, type = 'success') {
    // Reuse the global showToast from main.js if available
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0D1B2A;color:#fff;padding:.85rem 1.75rem;border-radius:999px;font-weight:600;font-size:.9rem;box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:9999;font-family:Inter,sans-serif;animation:fadeInUp .3s ease;`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .4s ease'; setTimeout(() => toast.remove(), 400); }, 3500);
    }
}

/* ============================================================
   USER DROPDOWN TOGGLE
   ============================================================ */
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const widget = document.getElementById('navUserWidget');
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && widget && !widget.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('authModal');
    if (e.target === modal) closeAuthModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
});

/* ============================================================
   EXPOSE TO GLOBAL SCOPE (for onclick handlers in HTML)
   ============================================================ */
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.registerWithEmail = registerWithEmail;
window.handleSignOut = handleSignOut;
window.toggleUserDropdown = toggleUserDropdown;
window.currentUser = () => currentUser;
