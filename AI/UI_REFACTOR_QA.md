# UI Refactor QA Checklist

Checklist manuale per validare la UI refactor in tema `dark` e `light`, con confronto verso la reference in `.temp/`.

## Scope

- UI target: `file_editor_plus/frontend` (Lit app)
- Reference: `.temp/index.html`
- CSS reference: `.temp/src/styles/editor.css`

## Checklist QA (Dark + Light)

- [ ] Topbar: hover coerente, effetto glass (blur + noise) presente e leggibile.
- [ ] Activity bar: active indicator visibile, icone a `24px` coerenti.
- [ ] Explorer header: presenti 3 action button (new file, new folder, upload) con icone a `14px`.
- [ ] Tree: chevron teal, folder arancione, file blu, selected con teal-alpha.
- [ ] Top actions: `primary` con hover shadow + `translateY(-1px)`; `secondary/ghost` senza effetto primary.
- [ ] Status bar: sfondo teal-alpha + border-top teal-alpha in dark e light.
- [ ] Focus ring: bordo teal `2px` con offset coerente.
- [ ] Hygiene icone: zero emoji nelle aree migrate.
- [ ] Hygiene icone: zero MDI nelle aree migrate.

## Confronto Con Reference

- [ ] Confronto visuale side-by-side con `.temp/index.html` (desktop).
- [ ] Confronto stati hover/focus/active principali (topbar, activity, explorer, actions, status).
- [ ] Confronto dark: contrasto testo/icone e gerarchia visiva.
- [ ] Confronto light: assenza di blocchi colore non tematici e contrasto consistente.
- [ ] Verifica finale: differenze residue annotate prima di procedere agli step successivi.
