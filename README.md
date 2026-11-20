# Números en Inglés

App para practicar a **escribir los números en inglés del 0 al 1,000,000**. Aparece un cartel con el número, abajo lo escribís en inglés y con el parlante escuchás cómo suena.

Jugar: https://elricondeladministrativo.github.io/numeros-ingles/

## Instalar en el celular

- **Android (Chrome):** abrí el link → menú ⋮ → *Instalar app* / *Agregar a la pantalla principal*.
- **iPhone (Safari):** abrí el link → Compartir → *Agregar a inicio*.

Una vez instalada funciona sin internet.

## Cómo funciona

- 7 niveles: 0–20, 21–99, cientos, miles, decenas de mil, cientos de mil hasta el millón, y todo mezclado. Rondas de 10 números.
- **Ver y escribir:** ves el número y lo escribís en palabras. **Dictado:** lo escuchás y lo escribís con cifras.
- Botón **Escuchar** y **Lento**. Después de cada respuesta se escucha la forma correcta.
- **Pista:** agrega la palabra que sigue (esa respuesta no suma punto).
- La corrección acepta la forma británica (*one hundred and five*) y la de EE. UU. (*one hundred five*), con o sin guion, y *a hundred / a thousand / a million*. Marca en rojo las palabras mal escritas y avisa errores típicos (*fourty*, *two hundreds*, falta de guion).
- *Cómo se escriben*: las reglas con ejemplos para escuchar.

## Archivos

- `index.html`: la app (diseño y pantallas).
- `numeros.js`: pasa de cifras a palabras, corrige las respuestas, da pistas y arma las rondas.
- `probar.js`: revisa los números del 0 al 1,000,000 y la corrección (`node probar.js`).
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`: datos para instalarla como app.
- `sw.js`: la guarda en el teléfono para usarla offline. Al publicar una versión nueva, cambiá `VERSION` en este archivo.
