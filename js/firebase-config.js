/**
 * TopScuole.it — Firebase Configuration
 * =======================================
 * ISTRUZIONI SETUP (5 minuti):
 *
 * 1. Vai su https://console.firebase.google.com
 * 2. Crea un nuovo progetto (es. "topscuole-it")
 * 3. Nella home del progetto clicca "</> Web" per aggiungere un'app web
 * 4. Copia le credenziali che ti vengono mostrate e incollale qui sotto
 * 5. In "Authentication" → "Sign-in method" abilita: "Email/Password" e "Google"
 *
 * ⚠️  NON committare mai questo file con le credenziali reali su GitHub pubblico.
 */

const firebaseConfig = {
    apiKey: "INSERISCI_LA_TUA_API_KEY",
    authDomain: "INSERISCI_IL_TUO_PROJECT_ID.firebaseapp.com",
    projectId: "INSERISCI_IL_TUO_PROJECT_ID",
    storageBucket: "INSERISCI_IL_TUO_PROJECT_ID.appspot.com",
    messagingSenderId: "INSERISCI_IL_TUO_MESSAGING_SENDER_ID",
    appId: "INSERISCI_IL_TUO_APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
