# ⛅ VR Meteo

App web per le previsioni meteo in tempo reale, sviluppata con HTML, CSS e JavaScript vanilla — nessuna dipendenza, nessuna chiave API richiesta.

> Progetto scolastico — Verde & Rotar — TPS 2025/26

---

## Funzionalità

- Ricerca meteo per nome città (geocoding automatico)
- Condizioni attuali: temperatura, umidità, velocità del vento
- Previsioni per i prossimi 7 giorni con icone meteo
- Cambio unità di misura tra °C e °F in tempo reale
- Messaggi di stato durante il caricamento e in caso di errore
- Design responsivo, ottimizzato per mobile e desktop
- Tema scuro con accenti ambra e verde

---

## Tecnologie utilizzate

| Tecnologia                                                               | Utilizzo                             |
| ------------------------------------------------------------------------ | ------------------------------------ |
| HTML5                                                                    | Struttura della pagina               |
| CSS3                                                                     | Stile, layout grid/flex, tema scuro  |
| JavaScript (ES2020)                                                      | Logica, fetch API, manipolazione DOM |
| [Open-Meteo API](https://open-meteo.com)                                 | Dati meteo gratuiti, senza chiave    |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | Conversione nome città → coordinate  |
| Google Fonts (Sora + Fira Mono)                                          | Tipografia                           |

---

## Come usarla

Non è richiesto nessun build step o installazione di dipendenze.

1. Clona il repository:
   ```bash
   git clone https://github.com/EliseyRotar/VR_Meteo.git
   ```
2. Apri `index.html` direttamente nel browser.

---

## Struttura del progetto

```
VR_Meteo/
├── index.html   # Struttura HTML della pagina
├── style.css    # Stile e tema visivo
└── script.js    # Logica applicativa e chiamate API
```

---

## Come funziona

1. L'utente inserisce il nome di una città nel campo di ricerca.
2. L'app interroga l'API di geocoding per ottenere le coordinate geografiche.
3. Con le coordinate, viene chiamata l'API Open-Meteo per ottenere meteo attuale e previsioni a 7 giorni.
4. I dati vengono visualizzati dinamicamente nel DOM, senza ricaricare la pagina.
5. L'utente può passare da °C a °F in qualsiasi momento — i dati vengono ricalcolati istantaneamente.

---

## Autori

Progetto realizzato da **Verde & Rotar** nell'ambito del corso TPS — Anno scolastico 2025/26.
