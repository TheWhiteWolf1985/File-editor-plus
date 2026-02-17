# startup.md — Avvio progetto (Windows 10 + Docker Desktop + VS Code + Chrome)

Questo file spiega come “riaccendere tutto” dopo aver spento il PC, in ordine temporale.
Obiettivo: arrivare ad avere il container Docker `agitated_elion` attivo e la UI debuggabile su Chrome.

---

## 1) Avvia Docker Desktop (Windows)

**Terminale:** Nessuno (GUI)

1. Apri **Docker Desktop** da Start.
2. Aspetta che in basso a sinistra compaia **“Docker Desktop is running”** (o simile).
3. Se Docker Desktop chiede permessi/aggiornamenti, accetta e aspetta la fine.

> Se Docker non parte o resta “bloccato”, vai al punto **7) Emergenza**.

---

## 2) Apri il progetto in VS Code

**Terminale:** Nessuno (GUI)

1. Apri **VS Code**
2. `File → Open Folder…`
3. Seleziona la cartella del progetto.

---

## 3) Apri il terminale giusto in VS Code

**Terminale:** **VS Code Terminal → PowerShell** (consigliato su Windows)

1. In VS Code vai su `Terminal → New Terminal`
2. In alto a destra nel terminale scegli il profilo **PowerShell** (se non lo è già).

---

## 4) Controlla che Docker “risponda”

**Terminale:** **VS Code Terminal (PowerShell)**

Esegui:

```powershell
docker info
```

- Se vedi un output lungo con info su Docker: ✅ ok, vai al punto 5.
- Se vedi errori tipo _cannot connect to the Docker daemon_ / _error during connect_: vai al punto **7) Emergenza**.

---

## 5) Controlla lo stato del container `agitated_elion`

**Terminale:** **VS Code Terminal (PowerShell)**

Esegui:

```powershell
docker ps -a --filter "name=agitated_elion"
```

Caso A — lo vedi e nella colonna STATUS c’è “Up …”
✅ il container è già avviato → vai al punto 6.

Caso B — lo vedi ma STATUS è “Exited …” (o simile)
Avvialo:

```powershell
docker start agitated_elion
```

Poi ricontrolla:

```powershell
docker ps --filter "name=agitated_elion"
```

Caso C — non compare nulla
Vuol dire che il container non esiste con quel nome (o Docker sta guardando un contesto diverso). In questo caso:

- ricontrolla che Docker Desktop sia davvero running
- poi ripeti il punto 4
- se continua, serve ricrearlo (questa guida non copre la build/run iniziale).

---

## 6) Apri la UI e fai debug su Chrome

**Terminale:** Nessuno (Chrome)

1. Apri **Google Chrome**
2. Apri l’URL della UI (preferiti o documentazione del progetto).
3. Apri DevTools:
   - `F12` oppure `Ctrl + Shift + I`
4. Vai su:
   - tab **Console** (per log/errori)
   - tab **Network** (per richieste API/asset)
   - tab **Application** (storage/cache se serve)

Suggerimento anti-bug-cache:

- `Ctrl + F5` per hard refresh
- Oppure DevTools → tasto destro sul refresh → **Empty Cache and Hard Reload** (se disponibile)

---

## 7) EMERGENZA — “Docker non parte / non risponde” (comando magico)

⚠️ Questo è un piano B “da panico”: serve quando `docker info` fallisce e hai bisogno di rialzare il demone Docker.
**Nota importante:** questo comando è pensato per ambiente Linux (es. WSL / VM / container host). Su Windows 10, usalo **solo** se il progetto gira dentro WSL o un host Linux dove esiste `/var/run/docker.sock`.

### 7.1 Capisci dove stai lanciando i comandi

**Terminale possibile:**

- **WSL Terminal** (Ubuntu/Debian ecc.) _oppure_
- **Terminale VS Code** collegato a WSL (Remote - WSL)

Se NON sei in WSL/Linux (cioè sei in PowerShell “puro” di Windows), questo comando NON ha senso perché quei path Linux non esistono.

### 7.2 Esegui il comando magico (Linux/WSL)

**Terminale:** **WSL Terminal** (o VS Code Terminal in sessione WSL)

Copia e incolla TUTTO:

```bash
sudo rm -f /var/run/docker.sock
sudo dockerd --host=unix:///var/run/docker.sock --data-root=/var/lib/docker > /tmp/dockerd.log 2>&1 &
sleep 2
docker info || (tail -n 120 /tmp/dockerd.log; echo "DOCKERD_FAILED")
```

- Se `docker info` ora funziona: ✅ torna al punto 5.
- Se stampa `DOCKERD_FAILED`: leggi le ultime righe del log che ti ha appena mostrato (sono la causa).

---

## 8) Spegnimento “pulito” (consigliato)

**Terminale:** Nessuno (GUI) oppure **VS Code Terminal (PowerShell)**

Opzione semplice:

1. Chiudi VS Code
2. Chiudi Chrome
3. (Opzionale) Docker Desktop → Quit

Opzione “risparmio risorse”:

- Se vuoi fermare il container:
  **Terminale: VS Code Terminal (PowerShell)**

```powershell
docker stop agitated_elion
```

---

## Checklist finale (deve essere tutto vero)

- Docker Desktop è “Running”
- `docker info` funziona
- `docker ps` mostra `agitated_elion` come “Up”
- Chrome apre la UI e DevTools mostra log coerenti
