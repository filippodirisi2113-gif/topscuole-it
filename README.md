# TopScuole.it

**Il TripAdvisor delle Scuole Italiane** — Portale di valutazione e orientamento scolastico.

---

## 🚀 Deploy su Vercel (3 passaggi)

### 1. Prerequsiti
```bash
npm install -g vercel
```

### 2. Deploy
```bash
cd website
vercel --prod
```

> Vercel rileva automaticamente il sito statico grazie al file `vercel.json` incluso.

---

## 🔐 Setup Firebase Authentication

### A. Crea il progetto Firebase

1. Vai su [console.firebase.google.com](https://console.firebase.google.com)
2. Clicca **"Aggiungi progetto"** → Nominalo `topscuole-it`
3. Disabilita Google Analytics (opzionale per MVP)

### B. Aggiungi l'app Web

1. Nella home del progetto, clicca **`</>`** (Web)
2. Registra l'app con il nome `TopScuole Web`
3. **Copia il blocco `firebaseConfig`** mostrato

### C. Incolla le credenziali

Apri il file `js/firebase-config.js` e sostituisci i placeholder:

```javascript
const firebaseConfig = {
  apiKey:            "LA_TUA_API_KEY",
  authDomain:        "topscuole-it.firebaseapp.com",
  projectId:         "topscuole-it",
  storageBucket:     "topscuole-it.appspot.com",
  messagingSenderId: "IL_TUO_SENDER_ID",
  appId:             "IL_TUO_APP_ID"
};
```

### D. Abilita i provider di accesso

Nella console Firebase:
1. **Authentication** → **Sign-in method**
2. Abilita: ✅ **Email/Password** e ✅ **Google**
3. Per Google: imposta l'email di contatto del progetto

### E. Aggiungi il dominio a Firebase Auth

1. **Authentication** → **Settings** → **Authorized domains**
2. Aggiungi il tuo dominio Vercel: `topscuole-it.vercel.app`
3. Quando avrai il dominio custom: aggiungi anche `topscuole.it`

---

## 📊 Dati MIUR — Aggiornamento Dataset

Le scuole sono caricate da `data/schools-milano.json` con dati ufficiali MIUR.

Per importare tutte le scuole italiane:

1. Scarica il CSV dal [Portale Open Data MIUR](https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Scuole)
2. Usa lo script di conversione (da creare):
   ```bash
   node scripts/convert-miur-csv.js input.csv output.json
   ```
3. Sostituisci `data/schools-milano.json` con il JSON generato

---

## 📁 Struttura del Progetto

```
website/
├── index.html              Landing page + Hero + SEO
├── schools.html            Mappa Leaflet + Risultati
├── school-detail.html      Dettaglio scuola + Recensioni
├── vercel.json             Configurazione Vercel
├── styles/
│   ├── main.css            Design system (Navy + Gold)
│   └── animations.css      Keyframes + scroll-reveal
├── js/
│   ├── main.js             UI interactions + animations
│   ├── map.js              Leaflet + dati MIUR
│   ├── reviews.js          StarRating + review cards
│   ├── auth.js             Firebase Auth completo
│   └── firebase-config.js  ← INSERIRE QUI LE CREDENZIALI
├── data/
│   └── schools-milano.json Scuole reali MIUR (Milano)
└── assets/
    └── logo.png
```

---

## 🛡️ Privacy & Moderazione

- Le recensioni sono soggette a moderazione prima della pubblicazione
- Nessun dato personale viene memorizzato lato client
- Firebase gestisce l'autenticazione in modo sicuro (OAuth 2.0)
- Dati scolastici da fonte ufficiale MIUR (Open Data, licenza CC BY)

---

## 📋 Checklist Pre-Launch

- [ ] Inserire credenziali Firebase in `js/firebase-config.js`
- [ ] Configurare dominio autorizzato su Firebase Auth
- [ ] Verificare CORS per `data/schools-milano.json` su Vercel
- [ ] Configurare regole Firestore per le recensioni
- [ ] Aggiungere Google Analytics / Search Console
- [ ] Registrare e configurare dominio `topscuole.it`
