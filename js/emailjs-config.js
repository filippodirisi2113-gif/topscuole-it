/* ============================================================
   TopScuole.it — EmailJS Configuration
   ============================================================
   SETUP (5 minuti):

   1. Vai su https://www.emailjs.com/ e crea un account gratuito
   2. In "Email Services" → aggiungi il tuo Gmail/Outlook → copia "Service ID"
   3. In "Email Templates" → crea un nuovo template con questo contenuto:
      Oggetto: {{subject}}
      Corpo:
        Ciao {{to_name}},
        il tuo codice di verifica TopScuole.it è:

        {{otp_code}}

        Il codice scade tra 10 minuti.
        Se non hai richiesto la registrazione, ignora questa email.
   4. Copia "Template ID" e la "Public Key" (in Account → General)
   5. Incolla i valori qui sotto e salva il file
   ============================================================ */

window.EMAILJS_CONFIG = {
    publicKey: "INCOLLA_QUI_LA_TUA_PUBLIC_KEY",   // es. "user_abc123XYZ"
    serviceId: "INCOLLA_QUI_IL_SERVICE_ID",        // es. "service_gmail_abc"
    templateId: "INCOLLA_QUI_IL_TEMPLATE_ID"        // es. "template_verifica_otp"
};
