# Changelog

## 0.2.18

- 🐛 Debug log: richiesta log Supervisor/Core con header corretti (no fallback /core/api), note chiare su 403 e auto-inclusione dei log runtime dell’add-on.
- 🌳 Tree: flag dirty + refresh automatico quando il filesystem cambia, così i nuovi file compaiono senza ricarichi manuali.

## 0.2.17

- 🐛 Debug log: richiesta ai log Supervisor con header/token corretti e fallback su endpoint alternativo, messaggi FAILED solo se l’API nega l’accesso.
- 🌳 Tree: refresh automatico dopo le operazioni file (save, replace, debug log) così i nuovi artefatti compaiono subito senza refresh manuale.

## 0.2.15

- 🛠️ Utility: nuovo comando “Genera debug log” (salva in /config/.fep-config con info sistema e ultimi log Supervisor).

## 0.2.16

- 🛠️ Debug log migliorato: gestione 403 Supervisor logs con fallback ai log Home Assistant e messaggi chiari.

## 0.2.14

- 🛠️ Compatibilità: estesa la matrice di build per includere ARM64/aarch64 (preparazione release multi-arch).

## 0.2.12

- 🧰 **Toolbar** (View → Menù strumenti): comandi rapidi **Save, Save all, Undo, Redo, Search, Replace, Indent, Split, Compare**. Preferenza persistente; i 3 pulsanti nella **crumbs** vengono nascosti quando la toolbar è attiva.
- 🧭 **Indent guides** (View → Indent guides): guide leggere e “pulite” (niente effetto pagina a righe), con guida attiva e segmentazione corretta per blocchi.
- 🎨 **Editor/tema**: selezione e caret ora theme-aware (light/dark) per mantenere l’overlay sempre leggibile; migliorata anche la colorazione chiavi.
- ⌨️ **Tab/Shift+Tab**: indent/outdent su selezione senza cancellare testo, con selezione mantenuta.
- 💾 **Modifiche non salvate**: modale su cambio file (Salva/Non salvare/Annulla) + warning in chiusura/refresh tab.
- 🪢 **Stabilità overlay**: fix allineamenti gutter/textarea/overlay con indent guides.
- 🐛 Fix: GitHub **#7**, **#8** + improvements **#9**, **#10**.
