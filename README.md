# PalmApp web 2.0 – statický web

Čisté HTML + CSS + JS. Bez buildu, bez závislostí, bez npm. Stačí nahrát soubory na hosting a jde to.

## Struktura

```
index.html               Úvod (pro firmy)
zamestnanec.html         Pro zaměstnance (má vlastní inline CSS)
servis.html              Řešení – servis a výroba
obchodni-site.html       Řešení – obchodní sítě
hr.html                  Řešení – HR a zaměstnanci
interni-komunikace.html  Funkce
novinky.html             Funkce
ai-asistent.html         Funkce
cenik.html               Ceník + kalkulačka / konfigurátor
kontakt.html             Kontaktní formulář
assets/firma.css         Styly (všechny stránky kromě zamestnanec.html)
assets/firma.js          Navigace, animace, kalkulačka, předvyplnění formuláře
assets/img/               Screeny aplikace, fotky a logo Vodárny Plzeň (WebP)
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

## Kalkulačka ceníku

- Logika i ceny jsou v `assets/firma.js`, blok „CENÍK: kalkulačka“ (`servisMonthly`, `sitMonthly`, `HR_KOMPLET`, `INCLUDED`, `EXTRA_LANGS`).
- Vkládá se prvkem `<div data-pricecalc="servis|sit|hr">`. Na `cenik.html` má navíc `data-tabs` (volba řešení, kotvy `#servis`, `#sit`, `#hr`).
- Jezdec: po 25 do 100, dál po 100 do 2 500, poslední poloha je „2 500+“ (individuální nabídka). Všechny částky se zobrazují zaokrouhlené na celé koruny.
- Servis a obchodní sítě podle cenových příloh z 9. 11. 2026, ověřeno proti všem řádkům tabulek. Ceny platí do 1 000 zaměstnanců (servis od 25), mimo rozsah ukazuje kalkulačka individuální nabídku.
- Výsledek: „Měsíčně“ a „Měsíčně při roční platbě“ (× 0,8, −20 %).
- Pět funkcí je vždy v ceně a cenu nemění. Za příplatek: další jazyky (1 590 Kč za jazyk, jednorázově) a víc než 3 odkazy v rozcestníku.
- Vlajky v `assets/img/flags/` jsou z balíčku flag-icons (MIT licence, © Panayiotis Lipiridis).

## Co je potřeba dořešit před spuštěním

1. **Kontaktní formulář (`kontakt.html`) zatím nikam neodesílá.** Po odeslání ukáže „Děkujeme“, ale data se zahodí.
   Napojení: `assets/firma.js`, blok `form.addEventListener('submit', …)` (označený `TODO`). Formulář posílá pole `typ` (demo / pilot), `segment` a předvyplněnou zprávu z kalkulačky.
2. **Formulář „Doporučte nám firmu“ (`zamestnanec.html`)** také nikam neodesílá (`onsubmit="return false"`).
3. **Placeholdery v textu** se na webu zobrazují žlutě zvýrazněné (třídy `.ph` a `.ph-num`). Vyhledejte `[X]`, `[DOPLNIT`, `OVĚŘIT`:
   - `zamestnanec.html` – přihlášení, obnova hesla
4. **Výběr mzdy** je jen na `zamestnanec.html`. Firemní stránka `vyber-mzdy.html` je smazaná, pokud je na serveru, smažte ji i tam (nebo přesměrujte na `index.html`).
5. **Mockupy:** screeny aplikace a fotky jsou v `assets/img/` (WebP). Zbývající šedé boxy „Mockup · …“ čekají na podklady (administrace, servisní a obchodní asistent, pozvánka).
