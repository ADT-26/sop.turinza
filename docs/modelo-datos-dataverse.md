# Modelo de datos — SOP Turinza
## Referencia para integración en Microsoft Dataverse

> **Fuente:** `src/lib/schemas.ts`, `src/lib/sopStore.ts`, `src/lib/options.ts`  
> **Almacenamiento actual:** archivos JSON en repositorio GitHub (`data/sops/`)  
> **Fecha de referencia:** 2026-07-29

---

## 1. Visión general del modelo

Cada **SOP** es el registro raíz. Contiene 9 secciones que se corresponden con bloques del formulario del cliente, más dos bloques gestionados internamente por Turinza (Matriz KPI y Firmas internas).

```
SopRegistro (1)
│
├── DatosGenerales          (1:1)   — Sección 1
├── ResumenEjecutivo        (1:1)   — Sección 2
├── MatrizContactos         (1:1)
│   ├── TablaContactos (Interno)    — Sección 3 · contactos Turinza
│   │   ├── ContactoDepartamento[] (4 filas fijas)
│   │   └── Escalonamiento          (1 fila)
│   └── TablaContactos (Cliente)    — Sección 3 · contactos cliente
│       ├── ContactoDepartamento[] (4 filas fijas)
│       └── Escalonamiento          (1 fila)
├── Preferencias
│   ├── Trazabilidad        (1:1)   — Sección 4.1
│   └── ComunicacionBloque[] (3 filas fijas) — Sección 4.2
├── ProcesoGrupo[]          (5 filas fijas)   — Sección 5
│   └── ProcesoFila[]       (1–4 filas por grupo)
├── InteraccionArea[]       (4 filas fijas)   — Sección 6
├── Cumplimiento[]          (6 filas fijas)   — Sección 7
├── Riesgo[]                (1–N dinámico)    — Sección 8
├── Aprobaciones            (1:1)             — Sección 9
└── KpiCliente[]            (0–N dinámico)    — Gestión interna Turinza
```

---

## 2. Catálogo de tablas

### 2.1 `SopRegistro` — Registro raíz del SOP

Entidad principal. Una fila por cada SOP enviado.

| Columna | Tipo Dataverse | Requerido | Descripción |
|---|---|---|---|
| `id` | Texto (PK) | Sí | Formato `{timestamp}-{8hex}`. Ej: `1722187200000-a3f2b1c4` |
| `estado` | Lista de opciones | Sí | Ver lista **EstadoDocumento** |
| `createdAt` | Fecha y hora | Sí | ISO 8601 (UTC). Generado al guardar. |

> En Dataverse, `id` puede mapearse a una columna de texto personalizada además del GUID nativo de la plataforma.

---

### 2.2 `DatosGenerales` — Sección 1

Relación **1:1** con `SopRegistro`.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `cliente` | Texto (255) | Sí | Razón social del cliente |
| `nit` | Texto (50) | Sí | NIT o identificación tributaria |
| `sectorIndustria` | Texto (255) | No | Texto libre |
| `tipoOperacion` | Lista de opciones | Sí | Ver lista **TipoOperacion** |
| `tipoMercancia` | Texto (255) | Sí | Texto libre |
| `serviciosContratados` | Selección múltiple | Sí | Ver lista **Servicios** (mínimo 1) |
| `direccionPrincipal` | Texto (500) | Sí | Texto libre |
| `pais` | Lista de opciones | Sí | Ver lista **Pais** (195 países) |
| `ciudad` | Texto (255) | Sí | Texto libre con sugerencias Colombia |
| `fechaImplementacion` | Texto (20) | Sí | Formato libre (capturado como string en el formulario) |
| `objetivoSOP` | Texto (2000) | Sí | Texto fijo por defecto, editable |
| `alcanceSOP` | Texto (2000) | Sí | Recalculado desde `serviciosContratados` |

---

### 2.3 `ResumenEjecutivo` — Sección 2

Relación **1:1** con `SopRegistro`.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `resumenNegocioCliente` | Texto multilínea | No | Texto libre |
| `riesgosCriticosAlertas` | Texto multilínea | No | Texto libre |
| `requiereAtencion247` | Lista de opciones | Sí | Ver lista **SiNoNA** |
| `requiereReunionesKPI` | Lista de opciones | Sí | Ver lista **SiNoNA** |
| `requiereReunionOperativaSemanal` | Lista de opciones | Sí | Ver lista **SiNoNA** |
| `asistentesReunionOperativa` | Texto (500) | No | **Solo Turinza.** Completado por el administrador en el panel interno |
| `periodicidadRevisionSOP` | Lista de opciones | Sí | Ver lista **FrecuenciaLarga** |
| `nivelCliente` | Lista de opciones | No | Ver lista **NivelCliente**. **Solo Turinza.** Asignado por el administrador |

---

### 2.4 `ContactoDepartamento` — Sección 3

Relación **N:1** con `SopRegistro`. Siempre 8 filas por SOP: 4 para contactos internos Turinza + 4 para contactos del cliente.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `tipoTabla` | Lista de opciones | Sí | `Interno` (Turinza) / `Cliente` |
| `area` | Texto (255) | Sí | Ver sección 4 — Áreas fijas |
| `nombreCargo` | Texto (255) | No | Nombre y cargo del contacto |
| `telefono` | Texto (50) | No | |
| `correo` | Texto (255) | No | |
| `backus` | Texto (255) | No | Código o referencia interna Backus |

**Áreas fijas** (campo `area`):
- Internos Turinza: `Operaciones / Logística`, `Contabilidad / Facturación`, `Tesorería / Pagos`, `Calidad / Servicio al cliente`
- Cliente: mismas 4 categorías aplicadas al lado del cliente

---

### 2.5 `Escalonamiento` — Sección 3 (contacto de escalamiento)

Relación **N:1** con `SopRegistro`. Siempre 2 filas por SOP: 1 interna + 1 del cliente.

| Columna | Tipo Dataverse | Requerido | Descripción |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `tipoTabla` | Lista de opciones | Sí | `Interno` / `Cliente` |
| `nombreCargo` | Texto (255) | No | |
| `telefono` | Texto (50) | No | |
| `correo` | Texto (255) | No | |

---

### 2.6 `Trazabilidad` — Sección 4.1

Relación **1:1** con `SopRegistro`.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `frecuenciaReportes` | Lista de opciones | Sí | Ver lista **FrecuenciaComunicacion** |
| `formatoCanal` | Texto (100) | No | Siempre `"Correo - llamada"` (valor fijo) |
| `contenidoMinimoRequerido` | Texto (1000) | No | Texto libre |
| `instructivoOdooCliente` | Texto multilínea | No | **Solo Turinza.** URL o instrucciones del sistema Odoo |

---

### 2.7 `ComunicacionBloque` — Sección 4.2

Relación **N:1** con `SopRegistro`. Siempre **3 filas** por SOP, una por tipo de comunicación.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `tipo` | Texto (100) | Sí | Valores fijos: `Informativa`, `Preventiva`, `Alertas` |
| `canalesPreferidos` | Lista de opciones | Sí | Ver lista **CanalOdoo** |
| `frecuencia` | Lista de opciones | Sí | Ver lista **FrecuenciaComunicacion** |
| `conCopiaContactosInternos` | Lista de opciones | Sí | Ver lista **SiNoNA** |
| `conCopiaContactoNombre` | Texto (255) | No | Visible/requerido solo cuando `conCopiaContactosInternos = "Sí"` |
| `conCopiaContactoInfo` | Texto (255) | No | Correo o teléfono del contacto con copia. Visible solo cuando `= "Sí"` |

---

### 2.8 `ProcesoGrupo` — Sección 5 (cabecera)

Relación **N:1** con `SopRegistro`. Siempre **5 filas** por SOP, una por proceso operativo.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `proceso` | Texto (255) | Sí | Valores fijos (ver abajo) |
| `aplica` | Lista de opciones | Sí | Ver lista **SiNoNA** |

**Procesos fijos** (campo `proceso`):
`Transporte nacional`, `Transporte internacional`, `Agenciamiento aduanero`, `Almacenamiento / Bodega`, `OTM / DTA`

---

### 2.9 `ProcesoFila` — Sección 5 (detalle por proceso)

Relación **N:1** con `ProcesoGrupo`. Entre **1 y 4 filas** por grupo. Solo existen cuando `ProcesoGrupo.aplica = "Sí"`.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `procesoGrupoId` | Búsqueda → ProcesoGrupo | Sí | FK |
| `orden` | Número entero | Sí | Posición de la fila (1–4) |
| `actividadHito` | Texto (500) | No | Descripción de la actividad |
| `personalizacionAcordada` | Texto (500) | No | |
| `responsable` | Texto (255) | Sí cuando aplica | Requerido si el grupo tiene `aplica = "Sí"` |
| `slaTiempo` | Lista de opciones | No | Ver lista **FrecuenciaCorta** |
| `kpiAsociado` | Texto (255) | No | |
| `controlEvidencia` | Texto (255) | No | |

---

### 2.10 `InteraccionArea` — Sección 6

Relación **N:1** con `SopRegistro`. Siempre **4 filas** por SOP.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `area` | Texto (255) | Sí | Valores fijos (ver abajo) |
| `reglaCondicionAcordada` | Texto (500) | No | |
| `impactoOperativo` | Texto (500) | No | |
| `observaciones` | Texto (500) | No | |

**Áreas fijas** (campo `area`):
`Comercial / Pricing`, `Facturación & Cartera`, `Crédito / Riesgo`, `Gerencia / Dirección`

---

### 2.11 `Cumplimiento` — Sección 7

Relación **N:1** con `SopRegistro`. Siempre **6 filas** por SOP.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `requisito` | Texto (255) | Sí | Valores fijos (ver abajo) |
| `aplica` | Lista de opciones | Sí | Ver lista **SiNoNA** |
| `detalleEvidenciaControl` | Texto (500) | No | |
| `responsable` | Texto (255) | Sí cuando aplica | Requerido si `aplica = "Sí"` |

**Requisitos fijos** (campo `requisito`):
`BASC`, `OEA`, `Seguro especial de mercancía`, `Auditorías especiales del cliente`, `Requisito documental adicional`, `Otro requisito especial`

---

### 2.12 `Riesgo` — Sección 8

Relación **N:1** con `SopRegistro`. **Dinámico** — mínimo 1, sin límite superior.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `riesgoCambioIdentificado` | Texto (500) | Sí | Descripción del riesgo identificado |
| `impacto` | Lista de opciones | Sí | Ver lista **Prioridad** |
| `accionCorrectiva` | Texto (500) | No | |
| `responsable` | Lista de opciones | Sí | Ver lista **AreaResponsable** |
| `eficacia` | Texto (255) | No | |

---

### 2.13 `Aprobaciones` — Sección 9

Relación **1:1** con `SopRegistro`.

| Columna | Tipo Dataverse | Requerido | Descripción |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `observaciones` | Texto multilínea | No | |
| `revisoClienteNombre` | Texto (255) | Sí | Diligenciado por el cliente |
| `revisoClienteCargo` | Texto (255) | Sí | |
| `aproboClienteNombre` | Texto (255) | Sí | Diligenciado por el cliente |
| `aproboClienteCargo` | Texto (255) | Sí | |
| `revisoTurinzaComercialNombre` | Texto (255) | No | **Solo Turinza.** Panel interno |
| `revisoTurinzaComercialCargo` | Texto (255) | No | **Solo Turinza.** Panel interno |
| `revisoTurinzaNombre` | Texto (255) | No | **Solo Turinza.** Panel interno (Operación) |
| `revisoTurinzaCargo` | Texto (255) | No | **Solo Turinza.** Panel interno |
| `aproboTurinzaNombre` | Texto (255) | No | **Solo Turinza.** Panel interno |
| `aproboTurinzaCargo` | Texto (255) | No | **Solo Turinza.** Panel interno |

---

### 2.14 `KpiCliente` — Matriz KPI (gestión interna Turinza)

Relación **N:1** con `SopRegistro`. **Dinámico** — 0 o más filas. Gestionado exclusivamente desde el panel interno; no lo diligenció el cliente.

| Columna | Tipo Dataverse | Requerido | Descripción / Valores permitidos |
|---|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí | FK |
| `servicio` | Lista de opciones | Sí | Ver lista **Servicios** |
| `indicador` | Texto (255) | Sí | Ej: `% entregas a tiempo` |
| `descripcion` | Texto (500) | No | |
| `meta` | Texto (100) | No | Ej: `≥ 95%` |
| `frecuencia` | Lista de opciones | Sí | Ver lista **FrecuenciaLarga** |
| `fuente` | Texto (255) | No | Ej: `Odoo / reporte mensual` |
| `responsable` | Lista de opciones | Sí | Ver lista **AreaResponsable** |
| `observaciones` | Texto (500) | No | |

---

### 2.15 `SopIndiceResumen` — Índice de listado

Tabla de caché para el listado rápido del panel interno. Se actualiza automáticamente al guardar/editar un SOP. **Equivale a una vista materializada** — no es estrictamente necesaria si Dataverse puede hacer consultas eficientes sobre `SopRegistro` + `DatosGenerales`.

| Columna | Tipo Dataverse | Descripción |
|---|---|---|
| `sopId` | Búsqueda → SopRegistro | FK (o puede ser una vista calculada) |
| `cliente` | Texto (255) | Copia de `DatosGenerales.cliente` |
| `nit` | Texto (50) | Copia de `DatosGenerales.nit` |
| `tipoOperacion` | Texto (50) | Copia de `DatosGenerales.tipoOperacion` |
| `nivelCliente` | Texto (20) | Copia de `ResumenEjecutivo.nivelCliente` |
| `estado` | Lista de opciones | Copia de `SopRegistro.estado` |
| `createdAt` | Fecha y hora | Copia de `SopRegistro.createdAt` |

---

## 3. Diagrama de relaciones

```
SopRegistro ──────────── DatosGenerales (1:1)
     │
     ├──────────────────── ResumenEjecutivo (1:1)
     │
     ├─── ContactoDepartamento (1:N, 8 filas fijas: 4 interno + 4 cliente)
     ├─── Escalonamiento (1:N, 2 filas fijas: 1 interno + 1 cliente)
     │
     ├──────────────────── Trazabilidad (1:1)
     ├─── ComunicacionBloque (1:N, 3 filas fijas)
     │
     ├─── ProcesoGrupo (1:N, 5 filas fijas)
     │       └── ProcesoFila (1:N, 1–4 por grupo)
     │
     ├─── InteraccionArea (1:N, 4 filas fijas)
     ├─── Cumplimiento (1:N, 6 filas fijas)
     ├─── Riesgo (1:N, 1–N dinámico)
     │
     ├──────────────────── Aprobaciones (1:1)
     │
     └─── KpiCliente (1:N, 0–N dinámico, gestión interna)
```

---

## 4. Listas de opciones (Choice columns)

### `SiNoNA`
| Valor |
|---|
| Sí |
| No |
| N/A |

### `EstadoDocumento`
| Valor |
|---|
| Abierto |
| En revisión |
| Obsoleto |
| Aprobado |

### `NivelCliente`
| Valor |
|---|
| Nivel 1 |
| Nivel 2 |
| Nivel 3 |

### `TipoOperacion`
| Valor |
|---|
| Importación |
| Exportación |
| Ambos |

### `FrecuenciaCorta` *(usada en SLA de procesos)*
| Valor |
|---|
| Diario |
| Semanal |
| Quincenal |
| Mensual |
| Por evento |
| Tiempo real |

### `FrecuenciaLarga` *(usada en revisión SOP y KPIs)*
| Valor |
|---|
| Mensual |
| Trimestral |
| Semestral |
| Anual |

### `FrecuenciaComunicacion` *(usada en trazabilidad y comunicación)*
| Valor |
|---|
| 1 por semana |
| 2 por semana |
| Quincenal |

### `CanalOdoo` *(canales preferidos de comunicación)*
| Valor |
|---|
| Correo - Odoo |
| WhatsApp - Odoo |
| Llamada - Odoo |
| Teams - Odoo |

### `Servicios` *(multiselect en DatosGenerales; lookup en KpiCliente)*
| Valor |
|---|
| OTM / DTA |
| Transporte terrestre |
| Transporte internacional |
| Aduanas |
| Almacenamiento / Bodega |

### `AreaResponsable`
| Valor |
|---|
| Comercial |
| Operaciones |
| Customer Service / KAS |
| Facturación |
| Almacenamiento / Bodega |
| Calidad |
| Gerencia |

### `Prioridad`
| Valor |
|---|
| Alta |
| Media |
| Baja |

### `TipoContacto` *(discriminador Interno / Cliente)*
| Valor |
|---|
| Interno |
| Cliente |

---

## 5. Campos de uso exclusivo Turinza (no diligencia el cliente)

Los siguientes campos son gestionados únicamente por el administrador desde el panel interno, **nunca** aparecen en el formulario público del cliente:

| Tabla | Campo | Descripción |
|---|---|---|
| `ResumenEjecutivo` | `nivelCliente` | Clasificación interna del cliente |
| `ResumenEjecutivo` | `asistentesReunionOperativa` | Lista de asistentes definida por Turinza |
| `Trazabilidad` | `instructivoOdooCliente` | Enlace o instrucciones del sistema Odoo |
| `ContactoDepartamento` (tipoTabla=Interno) | todos | Contactos internos de la cuenta Turinza |
| `Aprobaciones` | `revisoTurinzaComercial*` | Firma del revisor comercial de Turinza |
| `Aprobaciones` | `revisoTurinza*` | Firma del revisor de operaciones de Turinza |
| `Aprobaciones` | `aproboTurinza*` | Firma del aprobador de Turinza |
| `KpiCliente` | todos | Matriz KPI gestionada internamente |

---

## 6. Notas de implementación en Dataverse

### Cardinalidad de filas fijas
Las tablas con filas fijas (`ContactoDepartamento`, `ComunicacionBloque`, `ProcesoGrupo`, `InteraccionArea`, `Cumplimiento`) siempre tienen exactamente N filas por SOP. En Dataverse se pueden crear automáticamente al insertar un `SopRegistro` nuevo mediante un Power Automate flow o un plugin.

### Campo `serviciosContratados` (multiselect)
En el sistema actual es un `string[]`. En Dataverse puede implementarse como:
- **Columna de selección múltiple** sobre la lista `Servicios` *(opción recomendada)*
- Tabla de unión `SopServicio` con FK a `SopRegistro` y FK/texto al servicio

### Identificador único
El `id` actual tiene el formato `{timestamp}-{8hex}` (ej: `1722187200000-a3f2b1c4`). En Dataverse conviene mantenerlo como columna de texto adicional ("número de SOP") y usar el GUID nativo de la plataforma como clave primaria real.

### Campos de solo lectura de sección
`objetivoSOP` y `alcanceSOP` son calculados en la aplicación a partir de `serviciosContratados`. Se pueden modelar como columnas calculadas en Dataverse o como columnas de texto con valor precomputado al crear/editar el SOP.

### Control de cambios (`CambioControl`)
El esquema define una entidad `CambioControl` (Control de Cambios, hoja del Excel) que aún no está implementada en el panel web. Sus campos serían:

| Campo | Tipo | Requerido |
|---|---|---|
| `sopId` | Búsqueda → SopRegistro | Sí |
| `version` | Texto (20) | Sí |
| `fecha` | Fecha | Sí |
| `seccionModificada` | Texto (255) | Sí |
| `descripcionCambio` | Texto (1000) | Sí |
| `motivo` | Texto (500) | No |
| `solicitadoPor` | Texto (255) | No |
| `responsable` | Lista de opciones → AreaResponsable | Sí |
| `aprobadoPor` | Texto (255) | No |
| `estado` | Lista de opciones → EstadoDocumento | Sí |

---

*Generado a partir del código fuente del proyecto SOP Turinza — `src/lib/schemas.ts` y `src/lib/sopStore.ts`*
