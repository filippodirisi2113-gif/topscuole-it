/* TopScuole.it — Seed Reviews (dati demo realistici per scuole popolari)
   Struttura: window.SEED_REVIEWS = { schoolId: [reviews] }
   Questi dati vengono usati come fallback quando non ci sono recensioni utente.
*/
window.SEED_REVIEWS = {

    /* ---------- ROMA ---------- */

    "RMPC250005": [ /* Liceo Tasso - Roma */
        {
            id: "seed_1", schoolId: "RMPC250005", user: { name: "Martina R.", uid: "seed_u1" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 3, ambiente: 4, org: 4, servizi: 3 }, helpful: 14,
            date: "febbraio 2025",
            text: "Il Tasso è una scuola di altissimo livello accademico. I professori di lettere e filosofia sono eccezionali, capaci di trasmettere vera passione per le materie. La preparazione all'università è ottima. Unico neo: la struttura è un po' datata e i bagni andrebbero ristrutturati. Il clima tra gli studenti è stimolante e competitivo nel senso positivo del termine."
        },
        {
            id: "seed_2", schoolId: "RMPC250005", user: { name: "Lorenzo P.", uid: "seed_u2" }, role: "Studente attuale",
            scores: { didattica: 4, struttura: 3, ambiente: 5, org: 3, servizi: 3 }, helpful: 9,
            date: "gennaio 2025",
            text: "Studio qui da tre anni e confermo: il livello è alto ma anche il carico di lavoro. I compiti sono tanti, soprattutto in greco e latino, ma si impara davvero. La classe è molto unita e gli scambi culturali organizzati dalla scuola sono esperienze fantastiche. Organizzazione burocratica un po' lenta, ma nel complesso sono soddisfatto della scelta."
        },
        {
            id: "seed_3", schoolId: "RMPC250005", user: { name: "Giulia M.", uid: "seed_u3" }, role: "Genitore",
            scores: { didattica: 5, struttura: 3, ambiente: 4, org: 4, servizi: 4 }, helpful: 7,
            date: "marzo 2025",
            text: "Mia figlia frequenta il secondo anno e sono davvero soddisfatta. I docenti sono molto preparati e appassionati. Il rigore didattico è alto, il che crea una solida base per il futuro. L'edificio potrebbe essere migliore ma la qualità dell'insegnamento compensa ampiamente."
        }
    ],

    "RMPS17000L": [ /* Liceo Newton - Roma */
        {
            id: "seed_10", schoolId: "RMPS17000L", user: { name: "Davide C.", uid: "seed_u10" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 4, ambiente: 4, org: 4, servizi: 4 }, helpful: 11,
            date: "dicembre 2024",
            text: "Ho frequentato il Newton dal 2019 al 2024 e ne sono uscito con una preparazione solida, soprattutto in matematica e fisica. I laboratori di scienze sono ben attrezzati e i professori di indirizzo sono competenti. Buona la programmazione di attività extra, tra cui stage e olimpiadi delle scienze. Consigliato per chi vuole andare in facoltà scientifiche."
        },
        {
            id: "seed_11", schoolId: "RMPS17000L", user: { name: "Sara B.", uid: "seed_u11" }, role: "Studente attuale",
            scores: { didattica: 4, struttura: 5, ambiente: 4, org: 3, servizi: 4 }, helpful: 6,
            date: "febbraio 2025",
            text: "Ottima scuola nel complesso. L'edificio è stato ristrutturato di recente e le aule sono comode. Professori generalmente preparati, con qualche eccezione. L'orientamento universitario è gestito bene. A volte le comunicazioni scuola-famiglia potrebbero essere più rapide, ma per il resto sono contenta."
        }
    ],

    /* ---------- MILANO ---------- */

    "MIPC01200G": [ /* Liceo Parini - Milano */
        {
            id: "seed_20", schoolId: "MIPC01200G", user: { name: "Federica T.", uid: "seed_u20" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 22,
            date: "gennaio 2025",
            text: "Il Parini è semplicemente il miglior liceo classico di Milano. Professori di straordinaria cultura, un ambiente intellettualmente vivace, attività extracurriculari ricchissime. Ho partecipato a conferenze, cineforum, gruppi di lettura. La maturità classica è impegnativa ma ti prepara a tutto. Struttura bella, nel centro di Milano. Chi ama la cultura umanistica deve venire qui."
        },
        {
            id: "seed_21", schoolId: "MIPC01200G", user: { name: "Andrea L.", uid: "seed_u21" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 4, org: 4, servizi: 3 }, helpful: 15,
            date: "novembre 2024",
            text: "Cinque anni intensissimi ma formativi. Il metodo di studio che ho acquisito al Parini è stato fondamentale all'università. I professori ti spingono a ragionare, non a memorizzare. La scuola dà molto ma chiede altrettanto: chi non è disposto a impegnarsi fatica. Patrimonio culturale della città."
        },
        {
            id: "seed_22", schoolId: "MIPC01200G", user: { name: "Chiara V.", uid: "seed_u22" }, role: "Genitore",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 3, servizi: 3 }, helpful: 8,
            date: "febbraio 2025",
            text: "Mio figlio frequenta il quarto anno. L'ambiente è stimolante e i compagni di classe sono di livello. I professori di greco e latino sono fra i migliori che abbia mai incontrato. Qualche problema con la segreteria per via dei tempi lunghi, ma l'aspetto didattico è semplicemente eccellente."
        }
    ],

    "MIPC040007": [ /* Liceo Beccaria - Milano */
        {
            id: "seed_30", schoolId: "MIPC040007", user: { name: "Marco F.", uid: "seed_u30" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 3, ambiente: 4, org: 4, servizi: 3 }, helpful: 9,
            date: "ottobre 2024",
            text: "Scuola con una lunga tradizione e un corpo docente di qualità. L'indirizzo scientifico è solido, con buona attenzione alla matematica. L'ambiente è sano e collaborativo. La struttura è nel centro storico, molto caratteristica ma un po' vecchia. Nel complesso ho avuto un'ottima preparazione universitaria."
        }
    ],

    /* ---------- NAPOLI ---------- */

    "NAPC190001": [ /* Liceo Umberto I - Napoli */
        {
            id: "seed_40", schoolId: "NAPC190001", user: { name: "Ciro E.", uid: "seed_u40" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 3, ambiente: 4, org: 3, servizi: 3 }, helpful: 12,
            date: "gennaio 2025",
            text: "L'Umberto è una scuola con storia e tradizione. I professori di lettere sono davvero bravi e appassionati. Il clima studentesco è vivace, forse a volte un po' caotico, ma genuino. La struttura è antica e potrebbe essere mantenuta meglio. Detto questo, ho imparato moltissimo e la preparazione all'università è stata ottima."
        },
        {
            id: "seed_41", schoolId: "NAPC190001", user: { name: "Alessia P.", uid: "seed_u41" }, role: "Studente attuale",
            scores: { didattica: 4, struttura: 2, ambiente: 4, org: 3, servizi: 2 }, helpful: 7,
            date: "marzo 2025",
            text: "Professori in generale molto bravi, soprattutto storia e filosofia. La struttura purtroppo lascia a desiderare: palestra piccola, risorse digitali scarse. Ma la qualità dell'insegnamento è alta e i miei compagni sono fantastici. Farò l'esame di maturità qui e non me ne pento."
        }
    ],

    /* ---------- TORINO ---------- */

    "TOPC02000C": [ /* Liceo D'Azeglio - Torino */
        {
            id: "seed_50", schoolId: "TOPC02000C", user: { name: "Elena M.", uid: "seed_u50" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 18,
            date: "dicembre 2024",
            text: "Il D'Azeglio è uno dei licei più prestigiosi d'Italia e lo merita. La tradizione è enorme — qui hanno studiato personaggi storici importanti. I professori di umanistica sono eccellenti. La biblioteca è fornita di rarità bibliografiche. L'ambiente accademico è serio ma aperto al dibattito. Cinque anni indimenticabili."
        },
        {
            id: "seed_51", schoolId: "TOPC02000C", user: { name: "Riccardo B.", uid: "seed_u51" }, role: "Genitore",
            scores: { didattica: 5, struttura: 4, ambiente: 4, org: 4, servizi: 3 }, helpful: 10,
            date: "febbraio 2025",
            text: "Mia figlia è al terzo anno. La scuola ha standard altissimi e i professori sono molto esigenti, ma si vede che ci tengono ai risultati degli studenti. Il carico di lavoro è consistente ma gestibile. Grande attenzione alle attività culturali extracurriculari."
        }
    ],

    /* ---------- FIRENZE ---------- */

    "FIPC001014": [ /* Liceo Machiavelli - Firenze */
        {
            id: "seed_60", schoolId: "FIPC001014", user: { name: "Beatrice R.", uid: "seed_u60" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 16,
            date: "gennaio 2025",
            text: "Il Machiavelli è una scuola bellissima, nel cuore di Firenze. L'ambiente è cosmopolita e stimolante grazie agli scambi internazionali molto frequenti. Professori di alto livello, soprattutto lingue. L'indirizzo linguistico europeo mi ha permesso di arrivare all'università con tre lingue solide. Esperienza formativa completa."
        }
    ],

    /* ---------- BOLOGNA ---------- */

    "BOPC01201C": [ /* Liceo Galvani - Bologna */
        {
            id: "seed_70", schoolId: "BOPC01201C", user: { name: "Matteo G.", uid: "seed_u70" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 3 }, helpful: 19,
            date: "novembre 2024",
            text: "Il Galvani è la scuola più antica di Bologna e si sente. Il rigore accademico è elevatissimo, con una tradizione umanistica impressionante. I professori di latino e greco sono a dir poco eccezionali. L'ambiente è vivacissimo: gruppi teatrali, cineforum, dibattiti politici. Ho avuto la fortuna di frequentarlo e ne sono profondamente grato."
        },
        {
            id: "seed_71", schoolId: "BOPC01201C", user: { name: "Sofia C.", uid: "seed_u71" }, role: "Studente attuale",
            scores: { didattica: 5, struttura: 3, ambiente: 5, org: 3, servizi: 3 }, helpful: 11,
            date: "marzo 2025",
            text: "Sono al quarto anno e confermo tutto quello che si dice sul Galvani. Livello altissimo, studio tanto ma imparo tantissimo. I professori di filosofia e storia dell'arte sono straordinari. La struttura è storica e affascinante ma qualche problema strutturale c'è. L'ambiente tra studenti è fantastico, ho trovato amici per la vita."
        }
    ],

    /* ---------- VENEZIA ---------- */

    "VEPC01201P": [ /* Liceo Marco Polo - Venezia */
        {
            id: "seed_80", schoolId: "VEPC01201P", user: { name: "Valentina S.", uid: "seed_u80" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 13,
            date: "gennaio 2025",
            text: "Studiare a Venezia è già di per sé speciale, e il Marco Polo amplifica questa magia. I professori sono molto preparati, con una particolare attenzione alle arti e alla storia locale. Gli scambi con scuole europee sono frequenti. La sede si trova in un palazzo storico splendido. Consigliato a chi ama bellezza e cultura."
        }
    ],

    /* ---------- PALERMO ---------- */

    "PAPC00901P": [ /* Liceo Garibaldi - Palermo */
        {
            id: "seed_90", schoolId: "PAPC00901P", user: { name: "Rosaria C.", uid: "seed_u90" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 3, ambiente: 4, org: 3, servizi: 3 }, helpful: 10,
            date: "febbraio 2025",
            text: "Il Garibaldi è una delle scuole più antiche di Palermo. I professori di materie umanistiche sono molto bravi. L'ambiente è caldo e accogliente, tipicamente siciliano. La struttura ha qualche problema di manutenzione ma l'anima della scuola è forte. Ottima preparazione per chi vuole frequentare l'università."
        }
    ],

    /* ---------- BARI ---------- */

    "BAPC13000V": [ /* Liceo Flacco - Bari */
        {
            id: "seed_100", schoolId: "BAPC13000V", user: { name: "Giuseppe D.", uid: "seed_u100" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 3, ambiente: 4, org: 4, servizi: 3 }, helpful: 14,
            date: "dicembre 2024",
            text: "Il Flacco è il liceo classico di riferimento a Bari. Professori di altissimo livello, soprattutto lettere, storia e filosofia. Cinque anni molto impegnativi ma che ti formano nel profondo. La struttura è un po' datata ma l'aspetto didattico è eccellente. Consigliato a chi vuole una formazione umanistica seria."
        },
        {
            id: "seed_101", schoolId: "BAPC13000V", user: { name: "Anna F.", uid: "seed_u101" }, role: "Studente attuale",
            scores: { didattica: 4, struttura: 3, ambiente: 5, org: 3, servizi: 3 }, helpful: 8,
            date: "marzo 2025",
            text: "Sono al secondo anno e mi trovo bene. L'atmosfera è seria ma non pesante. I miei prof di greco sono molto esigenti ma si capisce che vogliono davvero insegnare. La palestra è piccola e manca un po' di spazio per gli studenti, ma per la didattica è una scuola di rispetto."
        }
    ],

    /* ---------- GENOVA ---------- */

    "GEPC01000P": [ /* LC Doria - Genova */
        {
            id: "seed_110", schoolId: "GEPC01000P", user: { name: "Luca M.", uid: "seed_u110" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 3, ambiente: 4, org: 4, servizi: 3 }, helpful: 9,
            date: "novembre 2024",
            text: "Il Doria è una scuola solida con una bella tradizione. I professori di filosofia e letteratura sono ottimi. L'ambiente è sereno e i rapporti con i docenti sono rispettosi. La sede è nel centro di Genova, comoda da raggiungere. Buona la preparazione complessiva, mi ha permesso di entrare senza esami all'università."
        }
    ],

    /* ---------- ISTITUTI TECNICI TOP ---------- */

    "MITF070009": [ /* Feltrinelli - Milano (ITIS) */
        {
            id: "seed_120", schoolId: "MITF070009", user: { name: "Paolo V.", uid: "seed_u120" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 5, ambiente: 4, org: 4, servizi: 5 }, helpful: 17,
            date: "gennaio 2025",
            text: "Il Feltrinelli mi ha dato una preparazione tecnica di primo livello. I laboratori di informatica e elettronica sono modernissimi e sempre aggiornati. I professori dei corsi di specializzazione hanno esperienza lavorativa reale. Ho trovato lavoro subito dopo il diploma, con un contratto a tempo indeterminato. Ottima scuola per chi vuole entrare nel mondo del lavoro."
        },
        {
            id: "seed_121", schoolId: "MITF070009", user: { name: "Simona R.", uid: "seed_u121" }, role: "Genitore",
            scores: { didattica: 4, struttura: 5, ambiente: 4, org: 4, servizi: 5 }, helpful: 11,
            date: "febbraio 2025",
            text: "Mio figlio ha finito qui l'anno scorso. I laboratori sono eccellenti, molto moderni. I professori dell'area tecnica sono davvero competenti. Le aziende vengono a fare colloqui direttamente a scuola. È stata la scelta giusta: diploma tecnico ma con sbocchi concreti."
        }
    ],

    "TOTF013016": [ /* ITIS Bodoni-Paravia - Torino */
        {
            id: "seed_130", schoolId: "TOTF013016", user: { name: "Francesco A.", uid: "seed_u130" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 4, ambiente: 4, org: 4, servizi: 4 }, helpful: 12,
            date: "dicembre 2024",
            text: "Il Bodoni-Paravia è un ottimo ITIS. La preparazione in informatica ed elettronica è molto solida. I professori delle materie tecniche sono aggiornati e portano esempi pratici del mondo reale. L'alternanza scuola-lavoro è ben organizzata e porta a stage veri. Dopo il diploma ho continuato con l'ITS e sono entrato in un'azienda tech."
        }
    ],

    "PRTF010006": [ /* ITIS Leonardo da Vinci - Parma */
        {
            id: "seed_140", schoolId: "PRTF010006", user: { name: "Nicola B.", uid: "seed_u140" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 4, ambiente: 4, org: 5, servizi: 4 }, helpful: 10,
            date: "gennaio 2025",
            text: "Ottima scuola tecnica, tra le migliori in Emilia. L'organizzazione è eccellente: l'orario è rispettato, le attività extrascolastiche sono molte e ben gestite. I laboratori di automazione industriale sono all'avanguardia. Ho fatto stage da Boeing in alternanza. Fortemente consigliato per chi vuole fare ingegneria."
        }
    ],

    /* ---------- CAMPANIA/SUD ---------- */

    "NAPS22000D": [ /* Liceo Vittorini - Napoli */
        {
            id: "seed_150", schoolId: "NAPS22000D", user: { name: "Maria G.", uid: "seed_u150" }, role: "Studente attuale",
            scores: { didattica: 4, struttura: 3, ambiente: 4, org: 3, servizi: 3 }, helpful: 8,
            date: "febbraio 2025",
            text: "Il Vittorini è una delle scuole scientifiche storiche di Napoli. I professori di matematica e fisica sono davvero preparati. L'ambiente è vivo e gli studenti sono motivati. La struttura ha qualche problema ma non compromette il valore dell'istruzione. Sto imparando tantissimo e mi preparo bene per ingegneria."
        }
    ],

    "CAPS02000B": [ /* Liceo Alberti - Cagliari */
        {
            id: "seed_160", schoolId: "CAPS02000B", user: { name: "Eleonora S.", uid: "seed_u160" }, role: "Ex-alunno",
            scores: { didattica: 4, struttura: 4, ambiente: 4, org: 4, servizi: 3 }, helpful: 9,
            date: "novembre 2024",
            text: "L'Alberti è il liceo scientifico di punta a Cagliari. Matematica e scienze sono insegnate benissimo. Ho avuto professori che mi hanno fatto davvero appassionare alla fisica. Il clima tra gli studenti è competitivo ma sano. Consiglio questa scuola a chiunque voglia intraprendere studi scientifici in Sardegna."
        }
    ],

    /* ---------- TOSCANA ---------- */

    "FIPS090001": [ /* Liceo Galileo - Firenze */
        {
            id: "seed_170", schoolId: "FIPS090001", user: { name: "Tommaso F.", uid: "seed_u170" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 21,
            date: "dicembre 2024",
            text: "Il Galileo è semplicemente fenomenale. Professori di matematica e fisica di livello universitario, che ti preparano in maniera eccellente per qualunque percorso scientifico. L'ambiente è molto stimolante: studenti brillanti, conferenze frequenti con ospiti del mondo accademico, olimpiadi di matematica e fisica. Ogni giorno imparavo qualcosa di nuovo. Una delle scelte migliori della mia vita."
        },
        {
            id: "seed_171", schoolId: "FIPS090001", user: { name: "Irene B.", uid: "seed_u171" }, role: "Studente attuale",
            scores: { didattica: 5, struttura: 4, ambiente: 4, org: 4, servizi: 4 }, helpful: 13,
            date: "marzo 2025",
            text: "Quarto anno al Galileo. Il livello è molto alto ma impari tantissimo. I professori di fisica sono incredibili: spiegano con passione e profondità. Le ore di matematica sono intense ma superare ogni difficoltà dà una soddisfazione enorme. Ambiente sano, studenti che si aiutano. Non tornerei indietro."
        }
    ],

    /* ---------- VENETO ---------- */

    "VEPC04000T": [ /* Liceo Marco Foscarini - Venezia */
        {
            id: "seed_180", schoolId: "VEPC04000T", user: { name: "Giulia N.", uid: "seed_u180" }, role: "Ex-alunno",
            scores: { didattica: 5, struttura: 4, ambiente: 5, org: 4, servizi: 4 }, helpful: 16,
            date: "gennaio 2025",
            text: "Il Foscarini è uno dei licei classici più rinomati del Veneto. Cinque anni intensi e meravigliosi: professori colti e appassionati, un ambiente intellettuale rarissimo, scambi culturali frequenti. La sede storica è magnifica. Ho imparato a studiare davvero, a ragionare criticamente. La maturità qui è seria ma formativa al massimo livello."
        }
    ]

};
