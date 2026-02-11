# ☁️ AWS Practitioner Quiz App

Una Web App Flask semplice e intuitiva progettata per aiutare nella preparazione all'esame **AWS Certified Cloud Practitioner**.

L'applicazione permette di simulare l'esame attraverso una serie di quiz con domande a risposta multipla, fornendo feedback immediato e spiegazioni dettagliate.

## ✨ Funzionalità

-   **Simulazioni Multiple**: Caricamento dinamico di diversi set di domande (Simulazioni 1-6) da file JSON.
-   **Interfaccia Intuitiva**: Design pulito e user-friendly per focalizzarsi sull'apprendimento.
-   **Feedback Immediato**: Visualizzazione delle risposte corrette e spiegazioni per ogni domanda.
-   **Nessun Database Richiesto**: I dati dei quiz sono gestiti tramite semplici file JSON, rendendo l'app leggera e facile da installare.

## 🚀 Installazione e Avvio

Segui questi passaggi per eseguire l'applicazione in locale sulla tua macchina.

### Prerequisiti

Assicurati di avere **Python 3** installato sul tuo sistema.

### 1. Crea e attiva un Virtual Environment

È consigliato usare un ambiente virtuale per gestire le dipendenze.

**MacOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

### 2. Installa le dipendenze

```bash
pip install -r requirements.txt
```

### 3. Avvia l'applicazione

```bash
python3 app.py
```

L'app sarà disponibile all'indirizzo: [http://127.0.0.1:5001/](http://127.0.0.1:5001/)

> **Nota:** La porta di default è impostata su `5001` per evitare conflitti con servizi di sistema (come AirPlay su macOS).

## 📂 Struttura del Progetto

-   **`app.py`**: Il file principale dell'applicazione Flask. Gestisce le rotte e la logica di backend.
-   **`data/`**: Contiene i file JSON con le domande dei quiz (es. `Simulazione_1.json`).
-   **`templates/`**: Contiene i template HTML (interfaccia utente).
-   **`static/`**: (Opzionale) File statici come CSS, JavaScript e immagini.

## 🛠 Tecnologie Utilizzate

-   **[Python](https://www.python.org/)**
-   **[Flask](https://flask.palletsprojects.com/)** - Micro framework web.
-   **HTML/CSS/JavaScript** - Per il frontend.

## 📝 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

---

Buono studio per la tua certificazione AWS! 🚀