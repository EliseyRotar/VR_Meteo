// VR Meteo - script.js
// Progetto TPS 2025/26 — Verde & Rotar (Eli6)
// API usata: Open-Meteo (https://open-meteo.com) — gratuita, nessuna chiave richiesta

// stato globale: salviamo i dati per poterli ricalcolare se cambia l'unità
let unitaCelsius = true;
let ultimoMeteo = null;
let ultimaCitta = null;

// =============================================
// MAPPATURA CODICI METEO WMO → emoji + testo
// =============================================
function getInfoMeteo(codice) {
    const mappa = {
        0:  { emoji: '☀️',  desc: 'Sereno' },
        1:  { emoji: '🌤️', desc: 'Quasi sereno' },
        2:  { emoji: '⛅',  desc: 'Parzialmente nuvoloso' },
        3:  { emoji: '☁️',  desc: 'Coperto' },
        45: { emoji: '🌫️', desc: 'Nebbia' },
        48: { emoji: '🌫️', desc: 'Nebbia con brina' },
        51: { emoji: '🌦️', desc: 'Pioggerella leggera' },
        53: { emoji: '🌦️', desc: 'Pioggerella moderata' },
        55: { emoji: '🌦️', desc: 'Pioggerella intensa' },
        61: { emoji: '🌧️', desc: 'Pioggia leggera' },
        63: { emoji: '🌧️', desc: 'Pioggia moderata' },
        65: { emoji: '🌧️', desc: 'Pioggia intensa' },
        71: { emoji: '🌨️', desc: 'Neve leggera' },
        73: { emoji: '🌨️', desc: 'Neve moderata' },
        75: { emoji: '❄️',  desc: 'Neve intensa' },
        80: { emoji: '🌦️', desc: 'Rovesci leggeri' },
        81: { emoji: '🌧️', desc: 'Rovesci moderati' },
        82: { emoji: '⛈️',  desc: 'Rovesci violenti' },
        95: { emoji: '⛈️',  desc: 'Temporale' },
        96: { emoji: '⛈️',  desc: 'Temporale con grandine' },
        99: { emoji: '⛈️',  desc: 'Temporale forte con grandine' },
    };
    return mappa[codice] ?? { emoji: '🌡️', desc: 'N/D' };
}

// =============================================
// CONVERSIONE TEMPERATURA
// =============================================
function convertiTemp(celsius) {
    if (unitaCelsius) {
        return `${Math.round(celsius)}°C`;
    }
    const f = (celsius * 9 / 5) + 32;
    return `${Math.round(f)}°F`;
}

// Ritorna l'abbreviazione del giorno della settimana (es. "Lun")
function nomeGiorno(dataStr) {
    const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const d = new Date(dataStr + 'T12:00:00'); // ore 12 per evitare problemi fuso
    return giorni[d.getDay()];
}

// =============================================
// GESTIONE MESSAGGI DI STATO
// =============================================
function mostraStato(tipo, messaggio) {
    const el = document.getElementById('status-msg');
    el.textContent = messaggio;
    // rimuovo le classi precedenti e aggiungo quella corretta
    el.className = `status-msg ${tipo}`;
}

function nascondiStato() {
    const el = document.getElementById('status-msg');
    el.classList.add('nascosto');
}

// =============================================
// CHIAMATE API (async/await)
// =============================================

// Passo 1: traduco il nome città in coordinate geografiche
async function ottieniCoordinate(citta) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citta)}&count=1&language=it&format=json`;
    const risposta = await fetch(url);

    if (!risposta.ok) {
        throw new Error('Errore di rete durante la ricerca della città');
    }

    const dati = await risposta.json();

    if (!dati.results || dati.results.length === 0) {
        throw new Error(`Città "${citta}" non trovata. Prova con un altro nome.`);
    }

    return dati.results[0];
}

// Passo 2: recupero i dati meteo usando le coordinate
async function ottieniMeteo(lat, lon) {
    const parametri = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relativehumidity_2m,windspeed_10m,weathercode',
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        timezone: 'auto',
        forecast_days: 7
    });

    const url = `https://api.open-meteo.com/v1/forecast?${parametri}`;
    const risposta = await fetch(url);

    if (!risposta.ok) {
        throw new Error('Errore nel recupero delle previsioni meteo');
    }

    return risposta.json();
}

// =============================================
// COSTRUZIONE DEL DOM
// =============================================

// Mostra il riquadro con il meteo attuale
function renderMeteoAttuale(meteo, citta) {
    const att = meteo.current;
    const info = getInfoMeteo(att.weathercode);

    const ora = new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // costruisco la stringa con regione + paese (non tutti i risultati hanno admin1)
    const luogo = [citta.admin1, citta.country].filter(Boolean).join(', ');

    document.getElementById('current-weather').innerHTML = `
        <div class="citta-nome">${citta.name}</div>
        <div class="citta-regione">${luogo}</div>
        <div class="meteo-principale">
            <span class="meteo-emoji">${info.emoji}</span>
            <span class="temp-valore">${convertiTemp(att.temperature_2m)}</span>
            <span class="meteo-desc">${info.desc}</span>
        </div>
        <div class="meteo-dettagli">
            <div class="dettaglio">
                <span class="dettaglio-etichetta">Umidità</span>
                <span class="dettaglio-valore">${att.relativehumidity_2m}%</span>
            </div>
            <div class="dettaglio">
                <span class="dettaglio-etichetta">Vento</span>
                <span class="dettaglio-valore">${att.windspeed_10m} km/h</span>
            </div>
            <div class="dettaglio">
                <span class="dettaglio-etichetta">Aggiornato</span>
                <span class="dettaglio-valore">${ora}</span>
            </div>
        </div>
    `;
}

// Mostra le previsioni per i prossimi 7 giorni
function renderPrevisioni(meteo) {
    const d = meteo.daily;
    let cards = '';

    for (let i = 0; i < d.time.length; i++) {
        const info = getInfoMeteo(d.weathercode[i]);
        const giorno = i === 0 ? 'Oggi' : nomeGiorno(d.time[i]);

        cards += `
            <div class="card-previsione" title="${info.desc}">
                <div class="prev-giorno">${giorno}</div>
                <span class="prev-emoji">${info.emoji}</span>
                <div class="prev-temperature">
                    <span class="prev-max">${convertiTemp(d.temperature_2m_max[i])}</span><br>
                    <span class="prev-min">${convertiTemp(d.temperature_2m_min[i])}</span>
                </div>
            </div>
        `;
    }

    document.getElementById('forecast-section').innerHTML = `
        <h3>Prossimi 7 giorni</h3>
        <div class="griglia-previsioni">${cards}</div>
    `;
}

// Ricalcola e ri-renderizza tutto quando cambia l'unità
function aggiornaUnita() {
    if (!ultimoMeteo || !ultimaCitta) return;
    renderMeteoAttuale(ultimoMeteo, ultimaCitta);
    renderPrevisioni(ultimoMeteo);
}

// =============================================
// FUNZIONE PRINCIPALE
// =============================================
async function cercaCitta() {
    const input = document.getElementById('city-input');
    const nomeCitta = input.value.trim();

    if (!nomeCitta) {
        mostraStato('errore', '⚠  Inserisci il nome di una città');
        return;
    }

    const btnCerca = document.getElementById('search-btn');
    btnCerca.disabled = true;

    // nascondo i risultati precedenti e mostro lo stato
    document.getElementById('result-section').classList.add('nascosto');
    mostraStato('caricamento', '⏳  Caricamento in corso...');

    try {
        // step 1: geocoding
        const datiCitta = await ottieniCoordinate(nomeCitta);

        mostraStato('caricamento', `🔍  Recupero dati per ${datiCitta.name}...`);

        // step 2: previsioni meteo
        const datiMeteo = await ottieniMeteo(datiCitta.latitude, datiCitta.longitude);

        // salvo i dati nello stato globale
        ultimoMeteo = datiMeteo;
        ultimaCitta = datiCitta;

        // aggiorno il DOM
        renderMeteoAttuale(datiMeteo, datiCitta);
        renderPrevisioni(datiMeteo);

        document.getElementById('result-section').classList.remove('nascosto');
        mostraStato('successo', `✓  Dati aggiornati per ${datiCitta.name}`);

        // dopo 3 secondi nascondo il messaggio di successo
        setTimeout(nascondiStato, 3000);

    } catch (errore) {
        mostraStato('errore', `✗  ${errore.message}`);
        console.error('Errore VR Meteo:', errore);
    } finally {
        btnCerca.disabled = false;
    }
}

// =============================================
// EVENT LISTENERS
// =============================================

// 1. Click sul pulsante Cerca
document.getElementById('search-btn').addEventListener('click', cercaCitta);

// 2. Tasto Invio nel campo di testo
document.getElementById('city-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        cercaCitta();
    }
});

// 3. Cambio unità: Celsius
document.getElementById('unit-c-btn').addEventListener('click', function () {
    if (unitaCelsius) return; // già in Celsius, non faccio nulla
    unitaCelsius = true;
    this.classList.add('unit-active');
    document.getElementById('unit-f-btn').classList.remove('unit-active');
    aggiornaUnita();
});

// 4. Cambio unità: Fahrenheit
document.getElementById('unit-f-btn').addEventListener('click', function () {
    if (!unitaCelsius) return; // già in Fahrenheit
    unitaCelsius = false;
    this.classList.add('unit-active');
    document.getElementById('unit-c-btn').classList.remove('unit-active');
    aggiornaUnita();
});

// 5. Hovering sulle card previsioni: l'utente vede la descrizione nel tooltip (title)
//    ma aggiungiamo anche un evento mouseover per evidenziare meglio
document.getElementById('forecast-section').addEventListener('mouseover', function (e) {
    const card = e.target.closest('.card-previsione');
    if (!card) return;
    // piccolo feedback visivo già gestito da CSS :hover
    // qui potremmo espandere la funzionalità in futuro
    // TODO: mostrare dettaglio giorno in un pannello laterale
});
