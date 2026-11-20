// Revisa que los números se escriban bien y que la corrección sea justa:  node probar.js
const N = require("./numeros.js");
let fails = 0;
const eq = (got, want, what) => { if (got !== want) { fails++; console.log("MAL", what, "\n  dio:   ", got, "\n  debía: ", want); } };

// 1. Cifras -> palabras (forma británica, la del libro)
const KNOWN = {
  0: "zero", 7: "seven", 12: "twelve", 13: "thirteen", 15: "fifteen", 18: "eighteen", 20: "twenty",
  21: "twenty-one", 40: "forty", 44: "forty-four", 90: "ninety", 99: "ninety-nine",
  100: "one hundred", 101: "one hundred and one", 110: "one hundred and ten", 115: "one hundred and fifteen",
  250: "two hundred and fifty", 999: "nine hundred and ninety-nine",
  1000: "one thousand", 1001: "one thousand and one", 1050: "one thousand and fifty",
  1100: "one thousand one hundred", 1234: "one thousand two hundred and thirty-four",
  2014: "two thousand and fourteen", 9999: "nine thousand nine hundred and ninety-nine",
  10000: "ten thousand", 20010: "twenty thousand and ten", 45600: "forty-five thousand six hundred",
  99999: "ninety-nine thousand nine hundred and ninety-nine",
  100000: "one hundred thousand", 100001: "one hundred thousand and one",
  250075: "two hundred and fifty thousand and seventy-five",
  305400: "three hundred and five thousand four hundred",
  999999: "nine hundred and ninety-nine thousand nine hundred and ninety-nine",
  1000000: "one million"
};
for (const [n, w] of Object.entries(KNOWN)) eq(N.toWords(+n), w, "toWords " + n);

// 2. Todos los números del 0 al millón: sin dobles espacios, sin "and and", y la corrección acepta su propia respuesta
for (let n = 0; n <= 1000000; n++) {
  const w = N.toWords(n);
  if (/\s\s|\band and\b|^and\b|\band$|-\s|\s-/.test(w)) { fails++; console.log("RARO", n, w); }
  if (n % 997 === 0 || n < 2000) {
    if (!N.check(n, w).ok) { fails++; console.log("NO ACEPTA SU PROPIA FORMA", n, w); }
    if (!N.check(n, N.toWordsUS(n)).ok) { fails++; console.log("NO ACEPTA SIN AND", n); }
    if (!N.check(n, w.replace(/-/g, " ")).ok) { fails++; console.log("NO ACEPTA SIN GUION", n); }
    if (!N.checkDigits(n, N.fmt(n)).ok) { fails++; console.log("DICTADO", n); }
  }
}

// 3. Formas que valen
const OK = [
  [100, "a hundred"], [1000, "A thousand"], [1000000, "a million"], [0, "nought"], [21, "Twenty-One"],
  [101, "one hundred one"], [1001, "one thousand, and one"], [1234, "one thousand, two hundred and thirty-four"],
  [21, "twenty – one"]
];
OK.forEach(([n, a]) => eq(N.check(n, a).ok, true, `debe valer ${n} = "${a}"`));

// 4. Formas que NO valen
const BAD = [
  [200, "two hundreds"], [40, "fourty"], [15, "fiveteen"], [21, "twenty"], [1000000, "one millions"],
  [1100, "eleven hundred one"], [12, "twelf"], [101, "one hundred and"], [250, "two hundred fifty five"]
];
BAD.forEach(([n, a]) => eq(N.check(n, a).ok, false, `no debe valer ${n} = "${a}"`));

// 5. Avisos
eq(N.check(200, "two hundreds").notes.length > 0, true, "aviso de plural");
eq(N.check(40, "fourty").notes[0].includes("forty"), true, "aviso de fourty");
eq(N.check(21, "twenty one").notes.some(x => x.includes("guion")), true, "aviso de guion");
eq(N.check(21, "twenty-one").notes.length, 0, "sin avisos si está perfecto");

// 6. Pistas
eq(N.hint(305, "").text, "three ", "pista 1");
eq(N.hint(305, "three").text, "three hundred ", "pista 2");
eq(N.hint(305, "three hundred").text, "three hundred and five", "pista 3 (suma and)");
eq(N.hint(305, "three hundred and five").done, true, "pista final");
eq(N.hint(305, "tree").text, "three ", "pista corrige");

// 7. Rondas: 10 números distintos dentro del rango
for (const L of N.LEVELS) for (let k = 0; k < 300; k++) {
  const r = N.round(L.id);
  if (new Set(r).size !== r.length) { fails++; console.log("REPETIDOS", L.id, r); break; }
  const lo = L.mix ? 0 : L.min, hi = L.mix ? 1000000 : L.max;
  if (r.some(n => n < lo || n > hi)) { fails++; console.log("FUERA DE RANGO", L.id, r); break; }
  if (r.length !== Math.min(10, hi - lo + 1)) { fails++; console.log("TAMAÑO", L.id, r.length); break; }
}

console.log(fails ? `\n${fails} problemas` : "Todo bien: del 0 al 1,000,000 revisado.");
process.exit(fails ? 1 : 0);
