# PalmApp web 2.0 – statický web

Čisté HTML + CSS + JS. Bez buildu, bez závislostí, bez npm. Stačí nahrát soubory na hosting a jde to.

## Struktura

```
index.html               Úvod (pro firmy)
zamestnanec.html         Pro zaměstnance (má vlastní inline CSS)
hr.html                  Oborové řešení – HR
servis.html              Oborové řešení – servis a terén
obchodni-site.html       Oborové řešení – obchodní sítě
interni-komunikace.html  Produkt
novinky.html             Produkt
ai-asistent.html         Produkt
vyber-mzdy.html          Produkt
cenik.html               Ceník + kalkulačka / konfigurátor
kontakt.html             Kontaktní formulář
assets/firma.css         Styly (všechny stránky kromě zamestnanec.html)
assets/firma.js          Navigace, animace, kalkulačka, předvyplnění formuláře
```

## Nasazení

- Soubory patří do **kořene webu** (vedle nich musí být dostupné `/assets/firma.css` a `/assets/firma.js`).
- Odkazy mezi stránkami jsou relativní (`hr.html`, `kontakt.html#…`). Web proto funguje i z podsložky.
- Na stávajícím webu www.palmapp.com **musí zůstat** tyto soubory, protože je nový web načítá absolutní URL:
  - `/logo.png`, `/michal.jpg`, `/og-image.jpg`
  - `/assets/*.webp` (loga klientů a obrázky)
  - `/zasady-ochrany-osobnich-udaju.html`
- Pozor: `index.html` přepíše stávající úvodní stránku, pokud se nahrává do kořene stávajícího repa.
- Fonty se načítají z Google Fonts (Inter, Inter Tight).

## Co je potřeba dořešit před spuštěním

1. **Kontaktní formulář (`kontakt.html`) zatím nikam neodesílá.** Po odeslání ukáže „Děkujeme“, ale data se zahodí.
   Napojení: `assets/firma.js`, blok `form.addEventListener('submit', …)` (označený `TODO`).
2. **Formulář „Doporučte nám firmu“ (`zamestnanec.html`)** také nikam neodesílá (`onsubmit="return false"`).
3. **Placeholdery v textu** se na webu zobrazují žlutě zvýrazněné (třídy `.ph` a `.ph-num`). Vyhledejte `[X]`, `[DOPLNIT`, `OVĚŘIT`:
   - `index.html`, `hr.html` – statistiky výběru mzdy (`[X] %`, `[X] výběrů`, `[období]`)
   - `vyber-mzdy.html` – statistiky, cena implementace (20 000 Kč, ověřit), FAQ
   - `zamestnanec.html` – přihlášení, obnova hesla, „zdarma [OVĚŘIT]“
4. **Mockupy** jsou zatím šedé boxy s textem „Mockup · …“ (záměrně, doplní se později).
