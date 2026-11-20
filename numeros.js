// Números en inglés: pasar de cifras a palabras, revisar lo que escribió el alumno y armar las rondas.
// Lo usan index.html (en el navegador) y probar.js (con node).
(function (root) {
  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  // 1 a 999, forma británica (la del libro): "one hundred and five", "twenty-one".
  function under1000(n) {
    const h = Math.floor(n / 100), r = n % 100;
    const parts = [];
    if (h) parts.push(ONES[h] + " hundred");
    if (r) {
      const w = r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? "-" + ONES[r % 10] : "");
      parts.push(h ? "and " + w : w);
    }
    return parts.join(" ");
  }

  // 0 a 1.000.000 en palabras.
  function toWords(n) {
    if (!Number.isInteger(n) || n < 0 || n > 1000000) throw new Error("Fuera de rango: " + n);
    if (n === 0) return "zero";
    if (n === 1000000) return "one million";
    const th = Math.floor(n / 1000), r = n % 1000;
    const parts = [];
    if (th) parts.push(under1000(th) + " thousand");
    if (r) parts.push(th && r < 100 ? "and " + under1000(r) : under1000(r));
    return parts.join(" ");
  }

  // Lo mismo, a la manera de EE. UU. (sin "and").
  function toWordsUS(n) { return toWords(n).replace(/ and /g, " "); }

  // Deja una respuesta en palabras sueltas para comparar:
  // sin mayúsculas, sin guiones ni comas, sin "and"; "a hundred" = "one hundred"; "nought" = "zero".
  function tokens(s) {
    let t = String(s).toLowerCase()
      .replace(/[‐-―\-_]/g, " ")
      .replace(/[.,;:!?¿¡'"’]/g, " ")
      .split(/\s+/).filter(Boolean);
    t = t.filter(w => w !== "and" && w !== "&");
    t = t.map((w, i) => (w === "a" && /^(hundred|thousand|million)$/.test(t[i + 1] || "")) ? "one" : w);
    if (t.length === 1 && (t[0] === "nought" || t[0] === "oh" || t[0] === "o")) t = ["zero"];
    return t;
  }

  // Errores típicos de los que vale la pena avisar.
  const TYPOS = {
    fourty: "forty (sin u)", ninty: "ninety (con e)", nintey: "ninety", fiveteen: "fifteen", fivety: "fifty",
    twoteen: "twelve", twelf: "twelve", twelv: "twelve", threeteen: "thirteen", thirdteen: "thirteen", threety: "thirty",
    thirdy: "thirty", eightteen: "eighteen (con una sola t)", eigthteen: "eighteen", eigthy: "eighty", eigty: "eighty",
    eighthy: "eighty", fourtheen: "fourteen", tweenty: "twenty", twinty: "twenty", tventy: "twenty",
    ninteen: "nineteen (con e)", nineten: "nineteen", hundret: "hundred", houndred: "hundred",
    hundread: "hundred", thousend: "thousand", tousand: "thousand", thousan: "thousand", milion: "million (con dos l)",
    millon: "million", mllion: "million", cero: "zero", tree: "three (con h)",
    for: "four (con u)", fiften: "fifteen", sixten: "sixteen", seventen: "seventeen", eigt: "eight", eigh: "eight",
    nin: "nine", twelfe: "twelve", elevan: "eleven", eleve: "eleven"
  };

  // Revisa una respuesta escrita en palabras. Devuelve { ok, notes[] }.
  function check(n, answer) {
    const want = tokens(toWords(n)), got = tokens(answer);
    const ok = want.length === got.length && want.every((w, i) => w === got[i]);
    const notes = [];
    const raw = String(answer).toLowerCase();
    got.forEach(w => { if (TYPOS[w]) notes.push(`«${w}» se escribe ${TYPOS[w]}.`); });
    if (got.some(w => /^(hundreds|thousands|millions)$/.test(w)))
      notes.push("Después de un número, hundred, thousand y million van sin s: two hundred, five thousand.");
    if (ok) {
      // Decenas compuestas (21 a 99) llevan guion: twenty-one.
      const comp = toWords(n).match(/\b[a-z]+-[a-z]+\b/g) || [];
      const missing = comp.filter(c => !raw.includes(c));
      if (missing.length) notes.push(`Va con guion: ${missing.join(", ")}.`);
    }
    return { ok, notes: [...new Set(notes)] };
  }

  // Revisa un dictado (el alumno escribe el número en cifras).
  function checkDigits(n, answer) {
    const clean = String(answer).replace(/[\s.,'’]/g, "");
    return { ok: /^\d+$/.test(clean) && Number(clean) === n, notes: [] };
  }

  // Compara palabra por palabra (para marcar en rojo lo que está mal).
  function diff(n, answer) {
    const a = tokens(answer), b = tokens(toWords(n));
    const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
      for (let j = b.length - 1; j >= 0; j--)
        L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const goodA = new Array(a.length).fill(false), goodB = new Array(b.length).fill(false);
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { goodA[i] = goodB[j] = true; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
    }
    return { mine: a.map((w, k) => ({ w, ok: goodA[k] })), want: b.map((w, k) => ({ w, ok: goodB[k] })) };
  }

  // Pista: deja lo que ya está bien y agrega la palabra que sigue.
  function hint(n, answer) {
    const words = toWords(n).split(" ");            // "one hundred and twenty-one" -> palabras con su forma escrita
    const want = words.map(w => tokens(w));          // cada palabra escrita puede ser 0, 1 o 2 fichas
    const got = tokens(answer);
    let k = 0, p = 0;
    for (; k < words.length; k++) {
      const piece = want[k];
      if (!piece.length) continue;                   // "and": no cuenta, se agrega solo
      if (piece.every((w, x) => got[p + x] === w)) p += piece.length; else break;
    }
    if (k >= words.length) return { text: words.join(" "), done: true };
    let end = k + 1;
    if (!want[k].length && end < words.length) end++; // si toca "and", sumar también la que sigue
    return { text: words.slice(0, end).join(" ") + (end < words.length ? " " : ""), done: end >= words.length };
  }

  // Formato inglés: 1,000,000
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  // Niveles
  const LEVELS = [
    { id: 1, name: "Del 0 al 20", short: "0 – 20", min: 0, max: 20, ex: 13 },
    { id: 2, name: "Del 21 al 99", short: "21 – 99", min: 21, max: 99, ex: 47 },
    { id: 3, name: "Cientos", short: "100 – 999", min: 100, max: 999, ex: 305 },
    { id: 4, name: "Miles", short: "1,000 – 9,999", min: 1000, max: 9999, ex: 2014 },
    { id: 5, name: "Decenas de mil", short: "10,000 – 99,999", min: 10000, max: 99999, ex: 45600 },
    { id: 6, name: "Cientos de mil", short: "100,000 – 1,000,000", min: 100000, max: 1000000, ex: 250075 },
    { id: 7, name: "Todo mezclado", short: "0 – 1,000,000", mix: true, ex: 70019 }
  ];

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Un número del nivel. En los grandes, a veces con ceros en el medio (1,005 o 20,010), que es donde más se falla.
  function pick(level) {
    const L = LEVELS.find(l => l.id === level);
    if (L.mix) return pick(rnd(1, 6));
    if (L.max === 1000000 && Math.random() < 0.05) return 1000000;
    const top = Math.min(L.max, 999999);
    if (L.min < 100 || Math.random() < 0.45) return rnd(L.min, top);
    const digits = String(rnd(L.min, top)).split("");
    for (let i = 1; i < digits.length; i++) if (Math.random() < 0.35) digits[i] = "0";
    const n = Number(digits.join(""));
    return n >= L.min && n <= top ? n : rnd(L.min, top);
  }

  // Ronda de 10 sin repetir.
  function round(level, size = 10) {
    const L = LEVELS.find(l => l.id === level);
    const room = L.mix ? Infinity : L.max - L.min + 1;
    const out = [], seen = new Set();
    let guard = 0;
    while (out.length < Math.min(size, room) && guard++ < 1000) {
      const n = pick(level);
      if (!seen.has(n)) { seen.add(n); out.push(n); }
    }
    return out;
  }

  const API = { toWords, toWordsUS, tokens, check, checkDigits, diff, hint, fmt, LEVELS, pick, round, ONES, TENS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.NUM = API;
})(this);
