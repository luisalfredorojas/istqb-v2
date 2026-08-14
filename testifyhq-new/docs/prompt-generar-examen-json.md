# Prompt: generar JSON de examen desde PDFs

Pega todo lo que está debajo de la línea en un chat nuevo de Claude, y adjunta
los dos PDFs (preguntas y respuestas).

---

# Tarea

Vas a convertir un examen en PDF a un archivo **JSON** con un formato exacto que
consume una plataforma web de exámenes. Te adjunto dos PDFs:

1. **PDF de preguntas** — el examen.
2. **PDF de respuestas** — la clave de respuestas (y a veces las justificaciones).

Tu única salida es **un archivo `.json` válido**. No expliques el proceso, no
resumas el examen, no agregues comentarios dentro del JSON.

## Regla número uno: no inventes nada

Esta es la regla que manda sobre todas las demás.

- **No inventes preguntas, opciones, respuestas ni justificaciones.**
- **No completes** una pregunta cuyo texto no puedas leer completo en el PDF.
- **No reformules** el enunciado ni las opciones. El texto va **literal**.
- **No agregues** opciones que el PDF no tenga, ni elimines las que tenga.
- **No corrijas** errores de redacción del original, aunque los veas.
- Si algo no se puede leer, **detente y repórtalo al final**, fuera del JSON.
  Nunca rellenes con una suposición.

Lo único que sí normalizas es el **formato de las etiquetas de opción** (ver
sección "Opciones"), porque eso lo exige el importador.

---

# Estructura del JSON

Un solo objeto en la raíz (no lo envuelvas en un array):

```json
{
  "empresa": "istqb",
  "titulo": "ISTQB® Certified Tester Foundation Level v4.0 - Exam E",
  "descripcion": "Sample Exam set E - Compatible with Syllabus version 4.0.1",
  "minimo_aprobacion": 26,
  "retroalimentacion": [
    { "umbral": 90, "mensaje": "¡Excelente! Nivel muy alto de preparación." },
    { "umbral": 75, "mensaje": "Muy bien, estás en camino de aprobar." },
    { "umbral": 65, "mensaje": "Suficiente para aprobar, pero puedes mejorar." },
    { "umbral": 0,  "mensaje": "Recomendamos seguir estudiando." }
  ],
  "examen": [ /* una entrada por pregunta */ ]
}
```

## Campos de la raíz

| Campo | Regla |
|---|---|
| `empresa` | Siempre `"istqb"`. |
| `titulo` | El título oficial tal como aparece en la portada del PDF. **Debe ser único**: si coincide exacto con un examen ya cargado, el importador borra las preguntas viejas y las reemplaza. |
| `descripcion` | Subtítulo / versión del syllabus que aparezca en la portada. |
| `minimo_aprobacion` | **Cantidad de respuestas correctas** necesarias para aprobar (no un porcentaje). Suele venir en las instrucciones del PDF, p. ej. "26 of 40". Si el PDF no lo dice, usa el 65% del total redondeado hacia arriba. |
| `retroalimentacion` | Copia el bloque de arriba **tal cual**, sin cambios. |
| `examen` | Array de preguntas, en el orden del PDF. |

## Campos de cada pregunta

```json
{
  "numero": 1,
  "pregunta": "Which of the following statements describe a valid test objective?",
  "opciones": [
    "a) To prove that there are no unfixed defects in the system",
    "b) To prove that there will be no failures in production",
    "c) To reduce the risk level and to build confidence in quality",
    "d) To verify that there are no untested combinations of inputs"
  ],
  "respuesta_correcta": 2,
  "numero_respuestas": "ONE",
  "explicacion": "c) Es correcto. Las pruebas reducen el nivel de riesgo...",
  "video_explicacion": "",
  "imageUrl": ""
}
```

| Campo | Regla |
|---|---|
| `numero` | Correlativo desde 1, en el orden del PDF. |
| `pregunta` | El enunciado, en **HTML**. Ver la sección "Formato del enunciado". |
| `opciones` | Array de strings. Ver "Opciones". |
| `respuesta_correcta` | **Índice base 0** dentro de `opciones`. Ver "Respuestas". |
| `numero_respuestas` | `"ONE"`, `"TWO"`, `"THREE"`... según cuántas respuestas correctas tenga. |
| `explicacion` | Justificación tomada del PDF de respuestas. Ver "Explicaciones". |
| `video_explicacion` | Siempre `""`. Se llena a mano después. |
| `imageUrl` | Siempre `""`. Ver "Imágenes y diagramas". |

Idioma: **el enunciado y las opciones van en el idioma original del PDF**
(normalmente inglés). **La explicación va en español.**

---

# Formato del enunciado (`pregunta`)

El campo se inyecta como **HTML** en la página. No es Markdown: `**negrita**`,
`- viñeta` o `1.` **no funcionan**, se verían como texto crudo.

## Etiquetas permitidas

`<p>` `<br>` `<ul>` `<li>` `<table>` `<tr>` `<th>` `<td>` `<strong>` `<em>` `<code>`

La app ya les da estilo a `ul`, `li`, `table`, `th` y `td`. No pongas atributos
`style`, `class`, `id`, ni etiquetas `<script>`, `<img>`, `<a>` o `<h1>`–`<h6>`.

## ⚠️ Regla crítica: las numeraciones se escriben a mano

**`<ol>` NO muestra números en esta aplicación.** El CSS de la plataforma le
quita la numeración automática a las listas ordenadas. Si escribes
`<ol><li>Extreme Programming</li></ol>`, el usuario ve una viñeta vacía sin el
`1)`, y la pregunta queda irrespondible.

Por eso, **toda etiqueta que las opciones mencionen se escribe literal dentro
del texto**: `1)`, `2)`, `i.`, `ii.`, `I.`, `II.`, `A.`, etc.

❌ **Mal** — el número desaparece:
```html
<p>Match the approaches with their descriptions.</p>
<ol><li>Extreme Programming</li><li>Scrum</li><li>Kanban</li></ol>
```

✅ **Bien** — la etiqueta es parte del texto:
```html
<p>Match the approaches with their descriptions.</p>
<ul>
  <li>1) Extreme Programming</li>
  <li>2) Scrum</li>
  <li>3) Kanban</li>
</ul>
<ul>
  <li>I. Embraces 5 values to guide development: Communication, Simplicity,
      Feedback, Courage, and Respect</li>
  <li>II. Divides the project into short iterations called sprints.</li>
  <li>III. Optimizes the 'flow' of work in a value-added chain.</li>
</ul>
```

Usa `<ul>` (con la etiqueta escrita a mano dentro del `<li>`), nunca `<ol>`.

## Preguntas de emparejamiento con dos columnas

Cuando el PDF presenta dos listas lado a lado —típico de "match the value on the
left (1-4) with its counterpart on the right (i-iv)"— usa una `<table>` de dos
columnas para conservar la relación visual:

```html
<p>The Agile Manifesto has 4 statements of values. Match the agile value on the
left (1-4) with its traditional counterpart on the right (i-iv).</p>
<table>
  <tr><td>1) Customer collaboration over</td><td>i) Processes and tools</td></tr>
  <tr><td>2) Responding to change over</td><td>ii) Following a plan</td></tr>
  <tr><td>3) Individuals and interactions over</td><td>iii) Contract negotiation</td></tr>
  <tr><td>4) Working software over</td><td>iv) Comprehensive documentation</td></tr>
</table>
```

No uses `<th>` salvo que el PDF tenga encabezados reales de columna.

## Caracteres especiales

Escapa `<`, `>` y `&` cuando sean parte del texto (`&lt;`, `&gt;`, `&amp;`).
Conserva los símbolos del original tal cual: `®`, `–`, comillas curvas `' '`.

---

# Opciones (`opciones`)

Cada opción es un string que **empieza con su etiqueta en minúscula y paréntesis**:
`"a) "`, `"b) "`, `"c) "`, `"d) "`, `"e) "`.

**Normaliza siempre a ese formato**, sin importar cómo las etiquete el PDF. Si el
PDF usa `A.`, `a.`, `(a)` o `1.`, tú escribes `a)`. El importador quita ese
prefijo al guardar y la web numera las opciones por su cuenta; cualquier otro
formato queda visible y se ve mal.

El contenido después de la etiqueta va **literal**.

Las opciones son **texto plano, no HTML**. No metas etiquetas ahí; si una opción
trae saltos de línea en el PDF, únelos con un espacio.

Caso especial — **opciones tipo "answer set"** (como `A. 1 – iii, 2 – iv, 3 – ii, 4 – i`):
el contenido de la opción es la combinación completa, literal:

```json
"opciones": [
  "a) 1 – iii, 2 – iv, 3 – ii, 4 – i",
  "b) 1 – iii, 2 – ii, 3 – i, 4 – iv",
  "c) 1 – iv, 2 – ii, 3 – i, 4 – iii",
  "d) 1 – ii, 2 – iii, 3 – iv, 4 – i"
]
```

---

# Respuestas (`respuesta_correcta`)

**Índice base 0** sobre el array `opciones`: `a)` → `0`, `b)` → `1`, `c)` → `2`,
`d)` → `3`, `e)` → `4`.

- **Una sola respuesta** → un número: `"respuesta_correcta": 2`
- **Varias respuestas** → un array de números ordenados: `"respuesta_correcta": [0, 4]`

Las preguntas de respuesta múltiple son fáciles de pasar por alto. Detéctalas por
dos señales, y usa **ambas**:

1. El enunciado lo dice: *"Which **TWO** of the following..."*, *"Select TWO"*.
2. La clave de respuestas marca más de una letra.

Si las dos señales no coinciden entre sí, **no adivines**: repórtalo al final.

`numero_respuestas` debe cuadrar siempre con la cantidad de índices:
un solo número → `"ONE"`; array de dos → `"TWO"`; de tres → `"THREE"`.

---

# Imágenes y diagramas

Algunas preguntas traen diagramas (máquinas de estados, grafos de flujo de
control, tablas de decisión como imagen). **No puedes reproducirlos.** No los
describas ni los conviertas en texto o en tabla: el examen se calificaría sobre
tu interpretación y no sobre el original.

Cuando una pregunta tenga una figura:

1. Deja `"imageUrl": ""`.
2. En `pregunta`, en el punto exacto donde va la figura, inserta:
   `<p><strong>[REEMPLAZAR IMAGEN]</strong></p>`
3. Conserva íntegro el texto que va antes y después de la figura.

```json
{
  "numero": 14,
  "pregunta": "<p>You test a system whose lifecycle is modeled by the state transition diagram shown below. The system starts in the INIT state and ends its operation in the OFF state.</p><p><strong>[REEMPLAZAR IMAGEN]</strong></p><p>What is the MINIMAL number of test cases to achieve valid transitions coverage?</p>",
  "opciones": ["a) 4", "b) 5", "c) 6", "d) 7"],
  "respuesta_correcta": 2,
  "numero_respuestas": "ONE",
  "explicacion": "",
  "video_explicacion": "",
  "imageUrl": ""
}
```

El marcador se ve en la web como texto en negrita, así que es imposible que una
imagen pendiente pase desapercibida. Al final de tu respuesta **lista los números
de todas las preguntas con `[REEMPLAZAR IMAGEN]`** y en qué página del PDF está
cada figura, para poder recortarlas y subirlas.

Ojo: esto aplica solo a **figuras**. Si el PDF muestra una tabla de datos que sí
es texto seleccionable (no una imagen), transcríbela con `<table>`.

---

# Explicaciones (`explicacion`)

Van en **español**, tomadas del PDF de respuestas.

- Si el PDF trae justificación, tradúcela/transcríbela siguiendo el estilo del
  corpus existente: primero por qué la correcta lo es, luego por qué falla cada
  distractora.
  > `"c) Es correcto. Las pruebas encuentran defectos, lo que reduce el nivel de riesgo. a) Es incorrecto: es imposible probar que no existen defectos. b) Es incorrecto: el principio 7 indica que las pruebas no garantizan la ausencia de fallos. d) Es incorrecto: es imposible probar todas las combinaciones."`
- Si el PDF **solo da la letra correcta, sin justificación**, deja
  `"explicacion": ""`. **No la redactes por tu cuenta**, aunque sepas la respuesta:
  el objetivo es transcribir el examen, no escribir material de estudio.
- Si el PDF cita una sección del syllabus, inclúyela al final entre paréntesis.

---

# Verificación antes de entregar

Recorre esta lista y **revisa el resultado contra el PDF**, no contra tu memoria:

- [ ] El JSON parsea. Sin comas colgantes, sin comentarios, comillas dobles, UTF-8.
- [ ] Un objeto en la raíz, no un array.
- [ ] `examen.length` == número de preguntas del PDF. Cuéntalas.
- [ ] `numero` va de 1 a N sin saltos ni repetidos.
- [ ] Ninguna pregunta quedó con el enunciado truncado o vacío.
- [ ] Cada pregunta tiene al menos 2 opciones y ninguna está vacía.
- [ ] Toda opción empieza con `a) `, `b) `, `c) `... en minúscula.
- [ ] Todo `respuesta_correcta` está dentro del rango de su array de opciones.
- [ ] Cada respuesta fue verificada **una por una** contra el PDF de respuestas.
- [ ] `numero_respuestas` coincide con la cantidad de índices correctos.
- [ ] Ningún `<ol>` en el HTML; toda numeración referenciada está escrita literal.
- [ ] El HTML está balanceado (toda etiqueta abierta se cierra).
- [ ] Las preguntas con figura tienen `[REEMPLAZAR IMAGEN]` e `imageUrl` vacío.

## Formato de entrega

1. El archivo `.json` completo.
2. Debajo, un reporte breve con:
   - total de preguntas,
   - números de las preguntas con `[REEMPLAZAR IMAGEN]` y su página en el PDF,
   - números de las preguntas de respuesta múltiple,
   - cualquier cosa ilegible, ambigua o contradictoria entre los dos PDFs.

Si el examen es largo, procésalo por bloques (p. ej. 10 preguntas por vez) y
ensambla el JSON al final. Prefiero varios pasos correctos que uno solo con
preguntas inventadas o saltadas.
