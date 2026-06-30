# Plan de Implementación — Formulario Web SOP Cliente (Turinza)

## Estado de avance

| Fase | Estado |
|---|---|
| Fase 0 — Migración base del proyecto | ✅ Completada |
| Fase 1 — Fundamentos de diseño y componentes base | ✅ Completada |
| Fase 2 — Modelado de datos y listas | ✅ Completada |
| Fase 3 — Construcción del formulario (9 secciones) | ✅ Completada |
| Fase 4 — Validación y experiencia de formulario | ✅ Completada |
| Fase 5 — Backend: API routes + Postgres | ✅ Completada |
| Fase 6 — Integraciones externas (OneDrive, Resend) | 🚫 No requerida (decisión del usuario) |
| Fase 7 — Dashboard interno (opcional) | ✅ Completada |
| Fase 8 — Pulido visual, responsive y accesibilidad | ✅ Completada |
| Fase 9 — Configuración, pruebas y despliegue | ⏳ Pendiente |

**Fase 0 — resumen de lo ejecutado:** se migró el scaffold de Vite vanilla-ts a **Next.js 16 (App Router, TypeScript, Tailwind CSS v4, Turbopack)**, usando `src/app/` como directorio de rutas (en vez de `app/` en la raíz, como sugería el `.md` original — funcionalmente equivalente). Se conservaron intactos `public/` (logo, favicon, icons), `formats/formato_SOP.xlsx` y los documentos de planeación. `npm run build` y `npm run dev` verificados sin errores.

**Fase 1 — resumen de lo ejecutado:**
- Tokens de marca definidos en `src/app/globals.css` vía `@theme` de Tailwind v4 (`primary`, `primary-light`, `primary-dark`, `accent`, `surface`, `line`, `ink`, `ink-muted`), generando utilidades como `bg-primary`, `text-ink-muted`, `border-line`.
- Escaneo de clases de Tailwind acotado a `src/**/*.{ts,tsx}` (`@source`) para que ya no incluya clases sueltas de los `.md` de planeación.
- Componentes UI base en `src/components/ui/`: `Field`, `TextInput`, `TextArea`, `Select`, `RadioGroup`, `SectionCard`, `Badge`.
- Layout general en `src/components/layout/`: `Header` (con el logo) y `Footer`, integrados en `src/app/layout.tsx` (`lang="es"`).
- Página de vista previa (`src/app/page.tsx`) mostrando los componentes con datos reales del Excel (Tipo de operación, Sí/No/N-A, Estado, Prioridad) — se reemplazará por el formulario real en la Fase 3.
- Verificado con `npm run build` y `npm run dev` (caché limpia) sin errores ni clases CSS residuales.

**Fase 2 — resumen de lo ejecutado:**
- `src/lib/options.ts`: las 12 listas desplegables de la hoja `Listas`, tipadas con `as const`.
- **Hallazgo importante:** al revisar las validaciones de datos (`dataValidation`/`x14:dataValidation`) del `.xlsx`, solo 7 de las 12 listas estaban realmente conectadas a una celda en la hoja `SOP` (Sí/No/N-A, Canal Odoo, Nivel Cliente, Frecuencia larga, Tipo operación, Área/Responsable, Frecuencia comunicación). Las otras 6 (Frecuencia corta, Modo transporte, Estado documento, Prioridad, Servicios, Tipo comunicación) estaban preparadas en la hoja `Listas` pero **sin conectar** a ningún campo. Se conectaron al campo más afín por nombre/semántica para no perder ninguna lista del formato:
  - Modo transporte → **Tipo de mercancía**
  - Servicios → **Servicios contratados** (multi-selección)
  - Prioridad → **Impacto** (Sección 8, Riesgos)
  - Frecuencia corta → **SLA / Tiempo** (Sección 5, Matriz de Procesos)
  - Estado documento → **Estado** del registro en Control de Cambios
  - Tipo comunicación → etiqueta fija de los 3 bloques de comunicación (Sección 4.2)
  - Además, "Frecuencia de la comunicación" y "Con copia a contactos internos del cliente" (Sección 4.2), sin validación en el `.xlsx` original, se conectaron a Frecuencia comunicación y Sí/No/N-A respectivamente.
- `src/lib/schemas.ts`: esquema Zod completo de las 9 secciones (`sopFormSchema`), con sub-esquemas para tablas repetibles (contactos, procesos, áreas de interacción, cumplimiento, riesgos, comunicación) y sus filas fijas (`AREAS_CONTACTO`, `PROCESOS_OPERATIVOS`, `AREAS_INTERACCION`, `REQUISITOS_CUMPLIMIENTO`). Tipos TS derivados vía `z.infer` (`SopFormValues` y tipos por sub-sección).
- Se modelaron también, de forma separada y liviana, las hojas internas `Matriz KPI` y `Control de Cambios` (`matrizKpiSchema`, `controlCambiosSchema`) — no forman parte del flujo de llenado del cliente, pero quedan listas para el dashboard interno (Fase 7) y el registro automático de cambios (Fase 6).
- Verificado con `npm run build` y `npx tsc --noEmit` sin errores de tipos.

**Fase 3 — resumen de lo ejecutado:**
- `src/lib/formTypes.ts` y `src/lib/formDefaults.ts`: forma "borrador" del formulario (todos los campos de selección como `string`, validación estricta se aplica al enviar en la Fase 4) y constructor de valores iniciales, respetando las filas fijas de cada tabla (contactos, procesos, áreas de interacción, cumplimiento, comunicación) y arrancando Riesgos con 1 fila dinámica.
- Componentes nuevos en `src/components/ui/`: `RepeatableTable` (filas fijas o dinámicas con agregar/eliminar) y `Stepper` (navegación por secciones).
- Las 9 secciones en `src/components/sections/` (`Section1DatosGenerales` … `Section9Aprobaciones`), fieles a la estructura del Excel, usando los componentes de la Fase 1 y las listas/esquemas de la Fase 2.
- Orquestador `src/components/form/SopForm.tsx`: estado del formulario completo en memoria (`useState`), navegación tipo wizard con `Stepper`, botones Anterior/Siguiente y "Enviar formulario" (deshabilitado — se activa en la Fase 4 junto con la validación).
- `src/app/page.tsx` ahora monta `<SopForm />` (reemplaza la vista previa de componentes de la Fase 1).
- Verificado con `npx tsc --noEmit`, `npm run build` y `npm run dev` (HTML servido en `/` confirma el contenido de la Sección 1 en la carga inicial). No se pudo verificar interacción en navegador real (cambios de paso, agregar/eliminar filas) por no contar con `chromium-cli` en este entorno — pendiente de una verificación visual manual o con `/verify`.

**Fase 4 — resumen de lo ejecutado:**
- `src/lib/schemas.ts` se reescribió para que los campos de selección validen como `string` (helpers `opcionRequerida`/`opcionOpcional`: validan que el valor, de existir, sea una de las opciones de la lista) en vez de `z.enum`. Esto permite que el tipo de salida de Zod (`SopFormValues`) sea exactamente el mismo tipo que usa el formulario en pantalla (todo `string`, "" = sin responder) — ya no hace falta un tipo "borrador" paralelo (se eliminó `formTypes.ts`).
- Se integró `react-hook-form` (`useForm` + `zodResolver(sopFormSchema)`) en `SopForm.tsx`: las 9 secciones ya no reciben `value`/`onChange` por props, sino que usan `useFormContext()` y `register`/`Controller` directamente.
- `useFieldArray` para Riesgos (Sección 8, filas dinámicas con agregar/eliminar); las demás tablas (filas fijas) registran por índice directamente.
- Validación por sección: el botón "Siguiente" llama a `trigger(seccionActual)` y solo avanza si esa sección es válida; los mensajes de error se muestran en español bajo cada campo.
- Autoguardado de borrador en `localStorage` (debounce 600ms) con indicador de hora del último guardado, restauración automática al cargar la página y botón "Restablecer formulario" (con confirmación) para borrarlo.
- Indicador de progreso (barra + "Paso X de 9") y `ResumenFinal` en la última sección: valida el formulario completo y muestra un check ✓/✗ por sección antes de habilitar el envío.
- "Enviar formulario" ahora ejecuta `handleSubmit` real: si todo el formulario es válido, muestra una confirmación en pantalla (el guardado en base de datos/OneDrive/email llega en las Fases 5-6).
- Verificado con `npx tsc --noEmit`, `npm run build` (incluye ESLint) y el servidor de desarrollo: el HTML renderizado confirma `name="datosGenerales.cliente"` etc. (campos registrados correctamente) y la barra de progreso al 11.11% en el paso 1. Sigue pendiente una prueba interactiva en navegador real (clics, validación en vivo, autoguardado) por no contar con `chromium-cli` en este entorno.

**Fase 5 — resumen de lo ejecutado:**
- **Decisión de almacenamiento (cambio respecto al plan original):** en vez de Postgres (Neon/Supabase), por pedido explícito del usuario, los envíos se guardan como **archivos `.json` commiteados al propio repositorio de GitHub vía la API de GitHub** — sin servicio externo nuevo, sin límites de almacenamiento de un tier gratuito, todo versionado en el repo. Importante: en Vercel el sistema de archivos en runtime es efímero/solo-lectura, por lo que escribir un archivo "local" en disco no sobrevive entre invocaciones — por eso la escritura real ocurre contra la API de GitHub (HTTP), no contra el disco del servidor.
- **`src/lib/githubStore.ts`:** helpers genéricos `leerArchivo`/`escribirArchivo` contra la API de contenidos de GitHub (`GET`/`PUT /repos/{owner}/{repo}/contents/{path}`), usando `GITHUB_TOKEN`. Los envíos se guardan en una **rama dedicada** (`GITHUB_DATA_BRANCH`, por defecto `data`) para no mezclar datos con el código de `main`.
- **`src/lib/sopStore.ts`:** `guardarSop` (genera un id `timestamp-hex`, escribe `data/sops/<id>.json` y actualiza un índice `data/sops/_index.json` con reintento ante conflictos de commit concurrentes), `listarSops` (lee el índice), `obtenerSopPorId` (valida el id con regex antes de usarlo en la ruta del archivo, para evitar path traversal).
- **API routes** (sin cambios en su contrato): `POST /api/submit-form`, `GET /api/forms`, `GET /api/forms/[id]` — ahora usan `sopStore` en vez de una base de datos.
- **`SopForm.tsx`:** el envío real sigue haciendo `fetch("/api/submit-form")` igual que antes; no cambió nada del lado del formulario.
- **`.env.example`** documenta `GITHUB_TOKEN` (fine-grained, permiso "Contents: Read and write" solo sobre este repo), `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_DATA_BRANCH`, con instrucciones para crear la rama `data`.
- **Aviso operativo:** Vercel crea un *preview deployment* por cada rama con push por defecto — cada envío de formulario haría un commit a la rama `data`, lo que dispararía previews (no afecta producción, pero genera builds de más). Si se quiere evitar, configurar "Ignored Build Step" en Vercel → Project Settings → Git para esa rama.
- **Verificado de extremo a extremo contra el repo real** `ADT-26/sop.turinza` (repo nuevo, sin commits previos): el primer `POST /api/submit-form` creó la rama `data` desde cero (la API de Contents de GitHub puede iniciar una rama nueva en un repo vacío) junto con `data/sops/<id>.json` y `data/sops/_index.json`. `GET /api/forms` y `GET /api/forms/[id]` confirmados contra esos archivos reales, incluyendo que los acentos/UTF-8 se guardan correctamente (se verificó decodificando el archivo crudo de GitHub).
- **Gotcha encontrado y resuelto:** el primer intento dio `403 Resource not accessible by personal access token` — el token fine-grained se había creado sin marcar **Contents: Read and write** en "Repository permissions". Se corrigió editando el token (sin necesidad de regenerarlo) y el reintento funcionó.
- **Nota de seguridad:** el token se compartió en el chat durante la prueba; quedó guardado únicamente en `.env.local` (gitignorado). Se recomendó al usuario revocarlo y generar uno nuevo para el uso real en Vercel.
- **Nota para la Fase 9 (despliegue):** `git` no está instalado en esta máquina (ni en PATH ni en rutas comunes) — no bloquea nada de lo construido hasta ahora (el guardado de SOPs usa la API HTTP de GitHub, no el binario `git`), pero sí hará falta instalarlo (o usar GitHub Desktop) para subir el código de este proyecto al repo y conectarlo con Vercel.

**Fase 6 — no requerida (decisión del usuario):** el problema de persistencia ya quedó resuelto con el almacenamiento en GitHub de la Fase 5, y el usuario confirmó explícitamente que no necesita confirmación por email (ni para el cliente ni para Turinza) por ahora. Se descarta `lib/onedrive.ts` y `lib/email.ts` del alcance actual del proyecto; si más adelante se necesita notificar envíos o exportar a Excel/OneDrive, se retoma como fase aparte.

**Fase 7 — resumen de lo ejecutado:**
- **`src/proxy.ts`** (autenticación HTTP Basic sobre `/dashboard/*`, vía `DASHBOARD_USER`/`DASHBOARD_PASSWORD`). Nota: Next.js 16 deprecó la convención `middleware.ts` a favor de `proxy.ts` durante esta misma fase — se migró directamente (mismo `config.matcher`, función renombrada de `middleware` a `proxy`), confirmado contra la documentación oficial.
- **`src/app/dashboard/page.tsx`**: listado de SOPs guardados (cliente, NIT, tipo de operación, nivel, estado, fecha), leyendo `listarSops()` directo (Server Component, sin pasar por la propia API).
- **`src/app/dashboard/[id]/page.tsx`**: vista de solo lectura de las 9 secciones completas de un SOP, con `notFound()` si el id no existe.
- `cache: "no-store"` agregado a las lecturas de GitHub para que el panel nunca muestre datos obsoletos.
- Enlace discreto "Panel interno" en el `Footer`.
- **Verificado de extremo a extremo** contra el repo real: `/dashboard` sin credenciales → 401 con `WWW-Authenticate`; con credenciales incorrectas → 401; con credenciales correctas → 200 y muestra un envío de prueba recién creado; `/dashboard/<id>` muestra las 9 secciones completas (incluida la matriz de contactos y riesgos); id inexistente → 404. Los datos de prueba se eliminaron del repo al terminar.

**Fase 8 — resumen de lo ejecutado:**
- **Hallazgo real de contraste (no cosmético):** `bg-primary` (#18B2D7, el cian del logo) usado como fondo con texto blanco —o como color de texto sobre blanco— da ~2.5:1 de contraste, por debajo del mínimo WCAG AA (4.5:1 texto, 3:1 componentes). Afectaba 5 lugares: pastillas activas de `RadioGroup` y de "Servicios contratados", el botón "Siguiente", y el paso actual del `Stepper` (pastilla + número). Se corrigieron usando `primary-dark` (#00699A) para todo estado "lleno" (pasa ~6:1), dejando el cian claro solo para bordes/acentos/hover. Se calcularon los contrastes de toda la paleta (texto, botones, badges) para confirmar que el resto ya cumplía.
- **`ink-muted` ajustado** de `#5b7a85` a `#4a6570`: el valor anterior pasaba AA por un margen mínimo (4.6:1 contra blanco); el nuevo da ~6.2:1, con más margen de seguridad real.
- **Accesibilidad de teclado:** los radios/checkboxes "pastilla" (inputs nativos ocultos con `sr-only`) no mostraban ningún indicador de foco visible al navegar con teclado — se agregó `has-[:focus-visible]:ring-2` en `RadioGroup` y en el grupo de servicios contratados.
- **`Field`** ahora conecta `aria-describedby` (hacia el hint o el mensaje de error) y `aria-invalid` al control que envuelve (vía `cloneElement`, solo cuando hay `htmlFor`), y el asterisco de "requerido" tiene equivalente para lectores de pantalla (`sr-only`). Los mensajes de error usan `role="alert"`.
- **`TextInput`/`TextArea`/`Select`**: anillo de foco reforzado (`focus:ring-primary-dark/40` en vez de `primary/20`, muy tenue) y borde rojo (`aria-invalid:border-accent`) cuando el campo está marcado inválido.
- **`Stepper`**: en pantallas angostas se compacta a solo los círculos numerados (el texto de cada sección se oculta con `hidden sm:inline`) con scroll horizontal si hace falta, en vez de envolver en muchas líneas. Se agregó `aria-current="step"` y `aria-label` en la lista.
- **Tabla del panel interno (`/dashboard`)**: en móvil se reemplaza por una lista de tarjetas (la tabla HTML real se reserva para `md:` en adelante, evitando el desbordamiento horizontal típico de tablas en pantallas angostas).
- **Footer** pasa a apilarse en vertical en pantallas angostas (`flex-col sm:flex-row`).
- **Enlace "Saltar al contenido principal"** agregado en el layout raíz (visible solo al recibir foco de teclado).
- Verificado con `npx tsc --noEmit`, `npm run build` y contra el servidor de desarrollo: se confirmó en el HTML/CSS real servido que el botón "Siguiente" usa `bg-primary-dark`, que `aria-current="step"` y el skip link están presentes, y que el CSS generado incluye el nuevo valor de `ink-muted` (ya no aparece el anterior) y las utilidades `has-`/`aria-invalid`.

**Correcciones post-Fase 8 (reportadas por el usuario tras probar en su navegador):**
1. **Header ilegible:** el logo (`Logo-Turniza_5.gif`) trae texto en blanco pensado para fondo oscuro; sobre el `bg-white` del Header quedaba invisible. Se cambió el Header a `bg-primary-dark` (azul institucional) con el texto en blanco — contraste verificado (~6:1).
2. **Bug real de validación:** en Matriz de Procesos (Sección 5) y Cumplimiento (Sección 7), el campo "Responsable" era obligatorio sin importar la respuesta de "Aplica" — si el usuario respondía "No" o "N/A", igual lo bloqueaba pidiendo ese campo. Se corrigió en `schemas.ts` con `.superRefine()`: "Responsable" ahora solo es obligatorio cuando "Aplica"/"¿Aplica?" = "Sí". Verificado con un script de validación directo contra el esquema (Aplica=No/N-A sin Responsable → válido; Aplica=Sí sin Responsable → sigue exigiendo el campo).
3. **Prompt de credenciales inesperado al hacer scroll:** causado por el `<Link href="/dashboard">` del Footer — Next.js precarga (*prefetch*) automáticamente los links en cuanto entran al viewport, y esa precarga disparaba el 401 de `/dashboard` (protegido con Basic Auth), lo que el navegador muestra como su diálogo nativo de login sin que el usuario haya hecho clic. Se corrigió con `prefetch={false}` en ese link.
- Verificado con `npx tsc --noEmit` y `npm run build` tras los tres cambios.

**Correcciones y nueva funcionalidad (segunda ronda, tras probar en navegador):**

1. **"Nivel Cliente" ya no lo llena el cliente.** Se quitó de la Sección 2 del formulario público; `schemas.ts` lo volvió opcional (`opcionOpcional`). Ahora lo asigna el administrador desde `/dashboard/[id]` con un selector nuevo (`NivelClienteEditor.tsx`, guarda vía `PATCH /api/forms/[id]`).

2. **Hueco de seguridad corregido:** `GET /api/forms` y `GET /api/forms/[id]` estaban accesibles sin autenticación (el middleware solo protegía las páginas `/dashboard/*`, no las API que exponen los datos). Se amplió el matcher de `src/proxy.ts` a `["/dashboard/:path*", "/api/forms/:path*"]`. `/api/submit-form` queda fuera a propósito — es el único endpoint que el formulario público debe poder llamar sin autenticar.

3. **Descarga en Excel — réplica exacta del `formato_SOP.xlsx` real** (no una recreación desde cero):
   - `src/lib/excelExport.ts` carga el archivo real de `formats/formato_SOP.xlsx` con `exceljs` y solo **escribe valores en las celdas exactas** del template (mapa de ~150 celdas extraído directamente del XML del archivo, no de memoria) — todas las combinaciones de celdas, estilos, colores y las hojas `Listas`/`Matriz KPI`/`Control de Cambios` quedan intactas porque nunca se reconstruyen, solo se rellenan.
   - Limitaciones documentadas de la plantilla real (no del código): la Matriz de Procesos solo tiene espacio fijo para 1 línea de detalle por proceso (la plantilla preveía 4, se usa la primera); Riesgos solo trae 5 filas fijas (si hay más, se anexan como texto al final de la última fila); la fila de "Servicios contratados" es un solo campo de texto en el original, así que el arreglo se une con comas.
   - **Verificado releyendo el archivo generado con `exceljs`:** los 16 campos de prueba cayeron en la celda correcta, **las 324 combinaciones de celdas del original se preservaron intactas**, y las 4 hojas siguen presentes.
   - **Cómo se entrega:**
     - Al enviar el formulario, `POST /api/submit-form` genera el Excel en la misma respuesta (`excelBase64`) — así el cliente nunca necesita golpear una ruta autenticada. Es "best effort": si la generación falla, el SOP ya quedó guardado de todas formas, simplemente no hay descarga automática.
     - El navegador dispara la descarga automáticamente al recibir la respuesta; si el navegador la bloquea, queda un botón "Descargar copia en Excel" visible en la pantalla de confirmación (mismo archivo, sin volver a pedirlo al servidor).
     - En el panel interno, `GET /api/forms/[id]/excel` (protegido) regenera el Excel bajo demanda con un botón "Descargar Excel" en `/dashboard/[id]`.
   - `next.config.ts` declara `outputFileTracingIncludes` para que Vercel empaquete `formats/formato_SOP.xlsx` dentro de las funciones serverless que lo necesitan (si no, el archivo no estaría disponible en producción).
4. **Header ilegible** corregido en la ronda anterior — ver más abajo el resto de correcciones post-Fase 8.
- Verificado con `npx tsc --noEmit`, `npm run build`, y de extremo a extremo contra el repo real: envío con Excel adjunto, descarga desde el panel, `PATCH` de Nivel Cliente (incluido el índice), y que `/api/forms` ahora exige autenticación. Datos de prueba eliminados al terminar.

**Correcciones (tercera ronda):**
- **Matriz de Procesos (Sección 5) y Cumplimiento (Sección 7):** "Aplica"/"¿Aplica?" ahora arranca en **"No"** por defecto (antes vacío) en `formDefaults.ts`. Además, los campos relacionados (Responsable, Actividad/Hito, Personalización, SLA, KPI, Control/Evidencia en Procesos; Responsable y Detalle en Cumplimiento) **se ocultan por completo** salvo que el usuario responda "Sí" — antes solo dejaban de ser obligatorios, pero seguían visibles y vacíos. Se implementó extrayendo cada fila a su propio componente (`FilaProceso`, `FilaRequisito`) que usa `useWatch` para reaccionar al valor de "Aplica" en tiempo real.
- Verificado con `tsc`, `build`, y un script que confirma que los 5 procesos y los 6 requisitos arrancan en "No". No se pudo grabar la interacción de clic real (mostrar/ocultar al cambiar el radio) por no contar con `chromium-cli` en este entorno.

**Rediseño visual (skill `frontend-design` de Anthropic):**
- **Tipografía**: se reemplazó Geist (default de Next.js) por **IBM Plex** completa — Plex Serif para títulos (con moderación: H1 y encabezados de sección), Plex Sans para todo el formulario/UI, Plex Mono para IDs, NIT, fechas y códigos de referencia. Elección deliberada con un registro "documentación técnica/de ingeniería", coherente con un SOP operativo — no los genéricos de cualquier proyecto de Next.js.
- **Elemento de firma**: el `Stepper` se rediseñó como una **ruta de waypoints** — marcadores en forma de rombo conectados por una línea, en vez de las píldoras redondeadas genéricas de SaaS. Conecta con el mundo de logística (una ruta de envío) sin volverse literal (sin íconos de barco/contenedor). Mantiene `aria-current="step"` y foco visible.
- **Identidad de documento controlado**: el `Header` ahora incluye un sello discreto en monoespaciada ("Doc. controlado · OP-F00 · v.01"), reforzando que el formulario es un documento controlado real del SIG, no un formulario web genérico.
- **Registro visual más "ficha/manifiesto"**: radios de 4px en vez de píldoras (`rounded-full`) en `RadioGroup`, el grupo de checkboxes de servicios, `Badge` y `SectionCard`; barra de progreso delgada sin bordes redondeados; `Badge` ahora en monoespaciada mayúscula (como un sello de estado). Colores de marca de Turinza sin cambios (ya estaban calibrados en contraste).
- Verificado con `tsc`, `build`, y contra el HTML/CSS real servido: las 3 variantes de Plex están en el CSS, Geist ya no aparece, los rombos del Stepper y el sello del Header están en el HTML, y se confirmó que los estados de contraste corregidos en la Fase 8 (radios/checkboxes/badges) no sufrieron regresión.

## 0. Resumen de la decisión arquitectónica

El proyecto actual es un scaffold de **Vite + TypeScript vanilla** (sin framework, sin backend). El documento `formulario-empresarial.md` describe una arquitectura **Next.js + Vercel Postgres + OneDrive (Graph API) + Resend**.

**Decisión confirmada con el usuario:** migrar el proyecto base de Vite vanilla a **Next.js 14+ (App Router) + TypeScript + Tailwind CSS**, conservando los assets de `public/` (logo, favicon, icons) y reescribiendo el frontend como un formulario multi-sección con React Hook Form + Zod, conectado a Vercel Postgres, con exportación a OneDrive y email de confirmación vía Resend — tal como define el `.md` original.

---

## 1. Fuente del formulario: `formats/formato_SOP.xlsx`

El Excel define un **SOP (Standard Operating Procedure) de cliente logístico** de Turinza, con 4 hojas:

| Hoja | Contenido |
|------|-----------|
| `SOP` | Formulario principal (9 secciones) |
| `Listas` | Listas desplegables (12 listas, columnas A–N) |
| `Matriz KPI` | Tabla de KPIs del cliente (Servicio, Indicador, Descripción, Meta, Frecuencia, Fuente, Responsable, Observaciones) |
| `Control de Cambios` | Historial de versiones (Versión, Fecha, Sección modificada, Descripción, Motivo, Solicitado por, Responsable, Aprobado por, Estado) |

### 1.1 Secciones del formulario principal (`SOP`)

1. **Datos generales del cliente y del SOP** — Cliente/Razón social, NIT/ID, Sector o Industria, Tipo de operación*, Tipo de mercancía, Servicios contratados, Dirección principal, País/Ciudad, Fecha de implementación del SOP, Objetivo del SOP, Alcance del SOP.
2. **Resumen ejecutivo del cliente** — Resumen del negocio del cliente, Riesgos críticos/alertas operativas, Requiere atención 24/7*, Requiere reuniones KPI*, Periodicidad revisión y actualización SOP*, Nivel Cliente*.
3. **Matriz de contactos** — dos tablas (Internos Turinza / Cliente), por área fija (Operaciones-Logística, Contabilidad-Facturación, Tesorería-Pagos, Calidad-Servicio al cliente): Nombre/Cargo, Teléfono, Correo + contacto de Escalonamiento.
4. **Preferencias, protocolos y particularidades** — 4.1 Trazabilidad (Frecuencia de reportes*, Formato/canal*, Contenido mínimo requerido); 4.2 Comunicación (repetible x3 — Informativa/Preventiva/Alertas): Tipo, Canales preferidos*, Frecuencia*, Con copia a contactos internos*.
5. **Matriz de procesos y personalizaciones operativas** — tabla repetible por proceso fijo (Transporte nacional, Transporte internacional, Agenciamiento aduanero, Almacenamiento/Bodega, OTM/DTA): Aplica*, Actividad/Hito, Personalización acordada, Responsable*, SLA/Tiempo, KPI asociado, Control/Evidencia.
6. **Interacción con otras áreas y condiciones comerciales** — tabla fija por área (Comercial/Pricing, Facturación & Cartera, Crédito/Riesgo, Gerencia/Dirección): Regla/condición acordada, Impacto operativo, Observaciones.
7. **Cumplimiento normativo y requisitos especiales** — tabla fija por requisito (BASC, OEA, Seguro especial de mercancía, Auditorías especiales del cliente, Requisito documental adicional, Otro requisito especial): ¿Aplica?*, Detalle/evidencia/control, Responsable*.
8. **Riesgos operativos y alertas** — tabla repetible: Riesgo/cambio identificado, Impacto*, Acción correctiva, Responsable*, Eficacia.
9. **Observaciones, validación y aprobaciones** — Observaciones, bloque de firmas (Revisó/Aprobó Cliente, Revisó/Aprobó Turinza con Nombre/Cargo).

`*` = campo con lista desplegable.

### 1.2 Listas desplegables (hoja `Listas`)

| Lista | Valores | Usada en |
|---|---|---|
| Sí/No/N-A | Sí, No, N/A | Aplica (procesos, cumplimiento), Requiere 24/7, Requiere KPI |
| Frecuencia corta | Diario, Semanal, Quincenal, Mensual, Por evento, Tiempo real | Frecuencia de reportes |
| Canal Odoo | Correo - Odoo, WhatsApp - Odoo, Llamada - Odoo, Teams - Odoo | Canales preferidos de comunicación |
| Nivel Cliente | Nivel 1, Nivel 2, Nivel 3 | Nivel Cliente |
| Frecuencia larga | Mensual, Trimestral, Semestral, Anual | Periodicidad revisión SOP |
| Tipo operación | Importación, Exportación, Ambos | Tipo de operación |
| Modo transporte | Marítimo, Aéreo, Terrestre, Multimodal | Tipo de mercancía / modo |
| Estado documento | Abierto, En revisión, Obsoleto, Aprobado | Estado del SOP / Control de cambios |
| Prioridad/Impacto | Alta, Media, Baja | Impacto (procesos, riesgos) |
| Área/Responsable | Comercial, Operaciones, Customer Service / KAS, Facturación, Almacenamiento/Bodega, Calidad, Gerencia | Responsables |
| Servicios | OTM / DTA, Transporte nacional, Transporte internacional, Aduanas, Almacenamiento / Bodega | Servicios contratados |
| Frecuencia comunicación | 1 por semana, 2 por semana, Quincenal | Frecuencia de la comunicación |
| Tipo comunicación | Informativa, Preventiva, Alertas | Tipo de comunicación |

---

## 2. Identidad visual (extraída de `public/Logo-Turniza_5.gif`)

Paleta dominante muestreada del gif (125 frames, animación de "barras"):

```css
--color-primary:        #18B2D7; /* cian principal */
--color-primary-light:  #5FD1EE; /* cian claro / hover */
--color-primary-dark:   #00699A; /* azul profundo / headers, nav */
--color-accent:         #C32855; /* magenta / CTA, alertas, foco */
--color-bg:             #FFFFFF;
--color-bg-soft:        #F4FBFD; /* fondo secciones alternas */
--color-border:         #D7ECF2;
--color-text:           #14313D;
--color-text-muted:     #5B7A85;
```

---

## 3. Fases de implementación

### Fase 0 — Migración base del proyecto
- Crear proyecto Next.js 14 (App Router, TS, Tailwind) en el mismo repo.
- Migrar `public/` (logo gif, favicon.svg, icons.svg) sin cambios.
- Eliminar boilerplate vanilla (`counter.ts`, `style.css`, hero/vite/ts logos de muestra).
- Configurar Tailwind con los tokens de color de la sección 2.
- Configurar ESLint/TS strict, `.env.example`.

### Fase 1 — Fundamentos de diseño y componentes base
- Definir tipografía y layout general (header con logo, footer).
- Construir componentes UI reutilizables: `TextField`, `TextArea`, `Select` (dropdown), `RadioGroup` (Sí/No/N-A), `SectionCard`, `RepeatableTable`, `Stepper`/navegación por secciones.
- Aplicar paleta de marca a focus states, botones, badges de estado.

### Fase 2 — Modelado de datos y listas
- Crear `lib/options.ts` con las 12 listas desplegables (sección 1.2) como constantes tipadas.
- Crear `lib/schemas.ts` con esquemas Zod para las 9 secciones (incluye arrays para tablas repetibles: contactos, procesos, riesgos, comunicación).
- Tipos TS derivados (`z.infer`) para todo el formulario.

### Fase 3 — Construcción del formulario (9 secciones)
- Implementar cada sección como su propio componente (`Section1GeneralData.tsx` … `Section9Approvals.tsx`), fiel a la estructura del Excel.
- Tablas repetibles con filas fijas (procesos, cumplimiento, áreas) y filas dinámicas donde aplique (riesgos, comunicación x3).
- Navegación tipo wizard o scroll con índice lateral (ambas válidas; recomendado wizard para evitar formularios largos abrumadores).

### Fase 4 — Validación y experiencia de formulario
- Integrar `react-hook-form` + `@hookform/resolvers/zod`.
- Validaciones por sección, mensajes de error en español.
- Autoguardado de borrador en `localStorage` (evitar pérdida de datos en formularios largos).
- Indicador de progreso y resumen final antes de enviar.

### Fase 5 — Backend: API routes + almacenamiento
- `app/api/submit-form/route.ts` (POST), `app/api/forms/route.ts` (GET listado), `app/api/forms/[id]/route.ts`.
- ~~Postgres~~ → **decisión final:** archivos `.json` commiteados al repo de GitHub vía su API (sin servicio de base de datos externo), con un índice liviano para listar. Ver el resumen de la Fase 5 más arriba para el detalle y el porqué del cambio.
- `lib/githubStore.ts` (helpers genéricos de lectura/escritura contra la API de GitHub) + `lib/sopStore.ts` (lógica específica del SOP sobre esos archivos).

### Fase 6 — Integraciones externas (no requerida)
- ~~Exportación a OneDrive~~ y ~~email de confirmación (Resend)~~ — descartadas: la persistencia ya está resuelta vía GitHub (Fase 5) y el usuario no requiere notificaciones por correo. Ver el resumen de la Fase 6 más arriba.

### Fase 7 — Dashboard interno ✅
- Vista simple de listado + detalle de SOPs recibidos, protegida por autenticación básica HTTP. Ver el resumen de la Fase 7 más arriba.

### Fase 8 — Pulido visual, responsive y accesibilidad ✅
- Contraste de color corregido y verificado con cálculos reales (no solo visual). Ver el resumen de la Fase 8 más arriba.
- Responsive: Stepper compacto en móvil, tabla del panel interno con vista de tarjetas en móvil, footer apilable.
- Accesibilidad: foco visible en controles ocultos, `aria-describedby`/`aria-invalid`/`role="alert"` en campos, `aria-current` en el Stepper, skip link.

### Fase 9 — Configuración, pruebas y despliegue
- Variables de entorno en Vercel (Azure/Graph, Postgres, Resend).
- Crear tabla(s) en Vercel Postgres.
- Pruebas funcionales del flujo completo en local (`npm run dev`).
- Despliegue en Vercel y verificación end-to-end (DB + OneDrive + email).

---

## 4. Próximo paso

Fase 9: instalar `git`, subir el código al repo, conectar Vercel y configurar las variables de entorno en producción (`GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_DATA_BRANCH`, `DASHBOARD_USER`, `DASHBOARD_PASSWORD`).
