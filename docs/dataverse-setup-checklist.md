# Checklist de creación de tablas — SOP en Dataverse

Documento de trabajo (mismo estilo que los checklists de `gestion-interna-app`: `CARTERA_SETUP.md` / `SEGURIDAD_SETUP.md`). Adapta `docs/modelo-datos-dataverse.md` (el modelo original del código fuente) a columnas y tablas concretas de Dataverse. **Es solo planeación de esquema — todavía no hay integración de código con la app SOP.**

## Decisiones ya tomadas (no volver a preguntar)

- **Misma solución y publicador** que `gestion-interna-app`: solución **"I+D - Turinza"**, publicador/prefijo **`gmh_`** — aunque SOP es una app externa distinta (este repo), comparte el mismo entorno Dataverse Developer (`0715c712-5d48-eb40-bc99-e0cd5ee262e6`) y se decidió no crear una solución/publicador aparte.
- **Nombres de tabla**: todas llevan el segmento `sop` dentro del prefijo compartido, para no mezclarse visualmente con las tablas de `gestion-interna-app` (`gmh_reportecarga`, `gmh_cartera`, etc.) — ej. `gmh_sopregistro`, `gmh_sopdatosgenerales`.
- **Cliente reutiliza el catálogo existente**: `DatosGenerales.cliente` deja de ser texto libre y pasa a ser un **lookup a `gmh_cliente`** (el catálogo de 275 clientes que ya usa `gestion-interna-app`) — evita duplicar nombres y repetir el problema de inconsistencias de escritura que ya pasó con Reporte de carga.
  - Consecuencia: se agrega una columna nueva **`gmh_nit`** (Texto 50) a la tabla `gmh_cliente` existente, y se **elimina** el campo `nit` de `DatosGenerales` (ya no hace falta, se obtiene por el lookup).
  - ⚠️ Si algún cliente de un SOP no existe todavía en `gmh_cliente`, hay que crearlo ahí primero (mismo patrón ya usado en `gestion-interna-app`).
- **`SopIndiceResumen`** (sección 2.15 del modelo original) — **NO se crea**. El propio documento fuente la describe como una vista materializada/caché opcional ("no es estrictamente necesaria"); Dataverse puede consultar `SopRegistro`+`DatosGenerales` directamente sin duplicar datos.
- **`CambioControl`** (sección 6 del modelo original) — **NO se crea todavía**. El documento fuente aclara que "aún no está implementada en el panel web" — se agrega cuando la app SOP realmente la necesite, no antes (evita construir algo sin caso de uso real todavía).
- **`serviciosContratados`** (multiselect en DatosGenerales) — se implementa como **columna de selección múltiple** sobre la lista `Servicios` (la opción que el propio documento fuente recomienda), no como tabla de unión aparte.
- **La lista `Servicios` de SOP es independiente de `gmh_servicio`** (el catálogo que ya usa Reporte de carga) — tienen valores y niveles de detalle distintos (SOP: 5 categorías amplias; `gmh_servicio`: 12 valores granulares tipo Aduana/Aereo/FCL/LCL...). No se fusionan, son dos listas distintas con el mismo nombre conceptual.

---

## Paso 0 — Agregar columna a `gmh_cliente` (catálogo existente)

En la tabla `gmh_cliente` de `gestion-interna-app` (Maker Portal → solución "I+D - Turinza" → Tablas → `Cliente`):

| Columna nueva | Tipo | Notas |
|---|---|---|
| `gmh_nit` | Texto (50) | NIT o identificación tributaria. Opcional al inicio (no todos los 275 clientes actuales lo tendrán diligenciado) |

---

## Paso 1 — Listas de opciones globales (Choice sets)

Crear como **opciones globales** (Solución → Nuevo → Más → Lista de opciones) para poder reutilizarlas entre varias tablas — Maker Portal → solución "I+D - Turinza" → Nuevo → Lista de opciones:

| Nombre lógico sugerido | Valores | Usada en |
|---|---|---|
| `gmh_sinona` | Sí, No, N/A | ResumenEjecutivo (x3), ComunicacionBloque, ProcesoGrupo, Cumplimiento |
| `gmh_estadodocumento` | Abierto, En revisión, Obsoleto, Aprobado | SopRegistro |
| `gmh_nivelcliente` | Nivel 1, Nivel 2, Nivel 3 | ResumenEjecutivo |
| `gmh_tipooperacionsop` | Importación, Exportación, Ambos | DatosGenerales |
| `gmh_frecuenciacorta` | Diario, Semanal, Quincenal, Mensual, Por evento, Tiempo real | ProcesoFila |
| `gmh_frecuencialarga` | Mensual, Trimestral, Semestral, Anual | Trazabilidad, ResumenEjecutivo, KpiCliente |
| `gmh_frecuenciacomunicacion` | 1 por semana, 2 por semana, Quincenal | Trazabilidad, ComunicacionBloque |
| `gmh_canalodoo` | Correo - Odoo, WhatsApp - Odoo, Llamada - Odoo, Teams - Odoo | ComunicacionBloque |
| `gmh_serviciossop` | OTM / DTA, Transporte terrestre, Transporte internacional, Aduanas, Almacenamiento / Bodega | DatosGenerales (multiselect), KpiCliente |
| `gmh_arearesponsablesop` | Comercial, Operaciones, Customer Service / KAS, Facturación, Almacenamiento / Bodega, Calidad, Gerencia | Riesgo, KpiCliente |
| `gmh_prioridadsop` | Alta, Media, Baja | Riesgo |
| `gmh_tipocontacto` | Interno, Cliente | ContactoDepartamento, Escalonamiento |

---

## Paso 2 — Tablas (14, en orden de dependencia)

Todas con columna principal autonumérica (prefijo entre paréntesis) salvo donde se indique. Los `Búsqueda` marcados **(N:1 obligatorio)** deben crearse después de la tabla a la que apuntan.

### 2.1 `gmh_sopregistro` (prefijo `SOP-`) — raíz
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_estado` | Choice `gmh_estadodocumento` | Sí |
| `gmh_fechacreacion` | Fecha y hora | Sí (default: hora de creación) |

### 2.2 `gmh_sopdatosgenerales` (prefijo `SDG-`) — 1:1 con SopRegistro
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_cliente` | **Búsqueda → `gmh_cliente`** (catálogo existente) | Sí |
| `gmh_sectorindustria` | Texto (255) | No |
| `gmh_tipooperacion` | Choice `gmh_tipooperacionsop` | Sí |
| `gmh_tipomercancia` | Texto (255) | Sí |
| `gmh_serviciscontratados` | Choice `gmh_serviciossop` — **selección múltiple** | Sí (mínimo 1) |
| `gmh_direccionprincipal` | Texto (500) | Sí |
| `gmh_pais` | Choice (lista `Pais`, 195 países — crear como opción global aparte, no se detalla aquí por tamaño) | Sí |
| `gmh_ciudad` | Texto (255) | Sí |
| `gmh_fechaimplementacion` | Texto (20) | Sí (viene como string libre del formulario original) |
| `gmh_objetivosop` | Texto largo (2000) | Sí |
| `gmh_alcancesop` | Texto largo (2000) | Sí |

> Nota: `nit` NO se incluye aquí — se obtiene vía `gmh_cliente.gmh_nit`.

### 2.3 `gmh_sopresumenejecutivo` (prefijo `SRE-`) — 1:1 con SopRegistro
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_resumennegociocliente` | Texto largo | No |
| `gmh_riesgoscriticosalertas` | Texto largo | No |
| `gmh_requiereatencion247` | Choice `gmh_sinona` | Sí |
| `gmh_requierereunioneskpi` | Choice `gmh_sinona` | Sí |
| `gmh_requierereunionoperativasemanal` | Choice `gmh_sinona` | Sí |
| `gmh_asistentesreunionoperativa` | Texto (500) | No — **Solo Turinza** |
| `gmh_periodicidadrevisionsop` | Choice `gmh_frecuencialarga` | Sí |
| `gmh_nivelcliente` | Choice `gmh_nivelcliente` | No — **Solo Turinza** |

### 2.4 `gmh_sopcontactodepartamento` (prefijo `SCD-`) — N:1, 8 filas fijas por SOP
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_tipotabla` | Choice `gmh_tipocontacto` | Sí |
| `gmh_area` | Texto (255) | Sí — valores fijos: Operaciones/Logística, Contabilidad/Facturación, Tesorería/Pagos, Calidad/Servicio al cliente |
| `gmh_nombrecargo` | Texto (255) | No |
| `gmh_telefono` | Texto (50) | No |
| `gmh_correo` | Texto (255) | No |
| `gmh_backus` | Texto (255) | No |

### 2.5 `gmh_sopescalonamiento` (prefijo `SES-`) — N:1, 2 filas fijas por SOP
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_tipotabla` | Choice `gmh_tipocontacto` | Sí |
| `gmh_nombrecargo` | Texto (255) | No |
| `gmh_telefono` | Texto (50) | No |
| `gmh_correo` | Texto (255) | No |

### 2.6 `gmh_soptrazabilidad` (prefijo `STR-`) — 1:1 con SopRegistro
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_frecuenciareportes` | Choice `gmh_frecuenciacomunicacion` | Sí |
| `gmh_formatocanal` | Texto (100) | No — valor fijo "Correo - llamada" |
| `gmh_contenidominimorequerido` | Texto (1000) | No |
| `gmh_instructivoodoocliente` | Texto largo | No — **Solo Turinza** |

### 2.7 `gmh_sopcomunicacionbloque` (prefijo `SCB-`) — N:1, 3 filas fijas
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_tipo` | Texto (100) | Sí — valores fijos: Informativa, Preventiva, Alertas |
| `gmh_canalespreferidos` | Choice `gmh_canalodoo` | Sí |
| `gmh_frecuencia` | Choice `gmh_frecuenciacomunicacion` | Sí |
| `gmh_concopiacontactosinternos` | Choice `gmh_sinona` | Sí |
| `gmh_concopiacontactonombre` | Texto (255) | No — condicional a "Sí" arriba |
| `gmh_concopiacontactoinfo` | Texto (255) | No — condicional a "Sí" arriba |

### 2.8 `gmh_sopprocesogrupo` (prefijo `SPG-`) — N:1, 5 filas fijas
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_proceso` | Texto (255) | Sí — valores fijos: Transporte nacional, Transporte internacional, Agenciamiento aduanero, Almacenamiento/Bodega, OTM/DTA |
| `gmh_aplica` | Choice `gmh_sinona` | Sí |

### 2.9 `gmh_sopprocesofila` (prefijo `SPF-`) — N:1 con ProcesoGrupo, 1-4 filas
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_procesogrupo` | Búsqueda → ProcesoGrupo | Sí |
| `gmh_orden` | Número entero | Sí (1-4) |
| `gmh_actividadhito` | Texto (500) | No |
| `gmh_personalizacionacordada` | Texto (500) | No |
| `gmh_responsable` | Texto (255) | Sí cuando el grupo `aplica = Sí` |
| `gmh_slatiempo` | Choice `gmh_frecuenciacorta` | No |
| `gmh_kpiasociado` | Texto (255) | No |
| `gmh_controlevidencia` | Texto (255) | No |

### 2.10 `gmh_sopinteraccionarea` (prefijo `SIA-`) — N:1, 4 filas fijas
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_area` | Texto (255) | Sí — valores fijos: Comercial/Pricing, Facturación & Cartera, Crédito/Riesgo, Gerencia/Dirección |
| `gmh_reglacondicionacordada` | Texto (500) | No |
| `gmh_impactooperativo` | Texto (500) | No |
| `gmh_observaciones` | Texto (500) | No |

### 2.11 `gmh_sopcumplimiento` (prefijo `SCU-`) — N:1, 6 filas fijas
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_requisito` | Texto (255) | Sí — valores fijos: BASC, OEA, Seguro especial de mercancía, Auditorías especiales del cliente, Requisito documental adicional, Otro requisito especial |
| `gmh_aplica` | Choice `gmh_sinona` | Sí |
| `gmh_detalleevidenciacontrol` | Texto (500) | No |
| `gmh_responsable` | Texto (255) | Sí cuando `aplica = Sí` |

### 2.12 `gmh_sopriesgo` (prefijo `SRI-`) — N:1 dinámico, mínimo 1
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_riesgocambioidentificado` | Texto (500) | Sí |
| `gmh_impacto` | Choice `gmh_prioridadsop` | Sí |
| `gmh_accioncorrectiva` | Texto (500) | No |
| `gmh_responsable` | Choice `gmh_arearesponsablesop` | Sí |
| `gmh_eficacia` | Texto (255) | No |

### 2.13 `gmh_sopaprobaciones` (prefijo `SAP-`) — 1:1 con SopRegistro
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_observaciones` | Texto largo | No |
| `gmh_revisoclientenombre` | Texto (255) | Sí |
| `gmh_revisoclientecargo` | Texto (255) | Sí |
| `gmh_aproboclientenombre` | Texto (255) | Sí |
| `gmh_aproboclientecargo` | Texto (255) | Sí |
| `gmh_revisoturinzacomercialnombre` | Texto (255) | No — **Solo Turinza** |
| `gmh_revisoturinzacomercialcargo` | Texto (255) | No — **Solo Turinza** |
| `gmh_revisoturinzanombre` | Texto (255) | No — **Solo Turinza** |
| `gmh_revisoturinzacargo` | Texto (255) | No — **Solo Turinza** |
| `gmh_aproboturinzanombre` | Texto (255) | No — **Solo Turinza** |
| `gmh_aproboturinzacargo` | Texto (255) | No — **Solo Turinza** |

### 2.14 `gmh_sopkpicliente` (prefijo `SKP-`) — N:1 dinámico, gestión interna
| Columna | Tipo | Requerido |
|---|---|---|
| `gmh_sopregistro` | Búsqueda → SopRegistro | Sí |
| `gmh_servicio` | Choice `gmh_serviciossop` | Sí |
| `gmh_indicador` | Texto (255) | Sí |
| `gmh_descripcion` | Texto (500) | No |
| `gmh_meta` | Texto (100) | No |
| `gmh_frecuencia` | Choice `gmh_frecuencialarga` | Sí |
| `gmh_fuente` | Texto (255) | No |
| `gmh_responsable` | Choice `gmh_arearesponsablesop` | Sí |
| `gmh_observaciones` | Texto (500) | No |

---

## Paso 3 — Publicar

"Publicar todas las personalizaciones" al terminar las 14 tablas + las listas globales + la columna nueva en `gmh_cliente`.

---

## Pendiente (fuera de alcance por ahora)

- Automatización para crear las filas fijas (8/2/3/5/4/6 según tabla) automáticamente al crear un `SopRegistro` — el documento fuente sugiere un Power Automate flow o plugin. No se construye todavía, es responsabilidad de la futura integración de código.
- Migración de los SOPs existentes (hoy en archivos JSON en GitHub, `data/sops/`) hacia estas tablas — pendiente hasta que la app SOP se conecte realmente a Dataverse.
- `CambioControl` y `SopIndiceResumen` — ver justificación arriba de por qué se excluyen por ahora.
- Seguridad/roles para esta app — no se ha definido todavía (la app SOP es un proyecto separado; puede necesitar sus propios roles de seguridad más adelante, independientes de los de `gestion-interna-app`).
