# Manual de usuario — SOP Digital Turinza

> Documento fuente para la elaboración del manual de usuario. Contiene el inventario completo y verificado de pantallas, campos, listas desplegables y reglas de validación del sistema, organizado para traducirse directamente en un manual (PDF/Word) con capturas de pantalla. Los lugares donde conviene insertar una captura están marcados como `[Captura: ...]`.

## 1. Qué es este sistema

Formulario web que digitaliza el **Procedimiento Operativo Estándar (SOP)** que Turinza diligencia con cada cliente logístico, más un **panel interno** donde el equipo de Turinza revisa lo enviado y completa los datos que le corresponden a la compañía (no al cliente).

Hay dos perfiles de usuario:

| Perfil | Accede a | Necesita login |
|---|---|---|
| **Cliente** (externo) | `/` — formulario de diligenciamiento | No |
| **Administrador** (Turinza) | `/dashboard` — panel interno | Sí (usuario y contraseña) |

---

## 2. Guía para el Cliente — Diligenciar el formulario

### 2.1 Cómo entrar

El cliente recibe el enlace al formulario y lo abre en cualquier navegador. No necesita usuario ni contraseña.

**Enlace de acceso:** [https://sop-turinza.vercel.app/](https://sop-turinza.vercel.app/)

`[Captura: pantalla de inicio del formulario, con el encabezado azul de Turinza y el indicador de pasos]`

### 2.2 Estructura del formulario

El formulario tiene **9 secciones** que se diligencian en orden, mostradas como pasos en la parte superior:

1. Datos generales del cliente y del SOP
2. Resumen ejecutivo del cliente
3. Matriz de contactos
4. Preferencias, protocolos y particularidades
5. Matriz de procesos y personalizaciones operativas
6. Interacción con otras áreas y condiciones comerciales
7. Cumplimiento normativo y requisitos especiales
8. Riesgos operativos y alertas
9. Observaciones, validación y aprobaciones

Se avanza con el botón **Siguiente** (valida la sección actual antes de dejar avanzar) y se retrocede con **Anterior**. También se puede saltar directamente a cualquier paso haciendo clic en su número en el indicador superior.

Los campos marcados con asterisco (*) son obligatorios.

### 2.3 Guardado automático del borrador

Mientras se llena el formulario, el progreso se guarda automáticamente en el navegador (no en un servidor) cada vez que se modifica un campo. Esto permite cerrar la pestaña y continuar después **en el mismo computador y navegador**.

- Aparece el mensaje "Borrador guardado [hora]" cuando se guarda.
- El borrador **no es visible para otros usuarios ni para Turinza** — vive solo en ese navegador hasta que se envía el formulario.
- El botón **"Restablecer formulario"** borra el progreso guardado y empieza de cero (pide confirmación antes de borrar).
- Al enviar exitosamente el formulario, el borrador local se elimina automáticamente.

`[Captura: barra superior mostrando "Paso X / 09", "Borrador guardado" y el botón Restablecer formulario]`

### 2.4 Sección 1 — Datos generales del cliente y del SOP

| Campo | Tipo | Obligatorio | Opciones / notas |
|---|---|---|---|
| Cliente / Razón social | Texto | Sí | |
| NIT / ID | Texto | Sí | |
| Sector o Industria | Texto | No | |
| Tipo de operación | Lista | Sí | Importación, Exportación, Ambos |
| Tipo de mercancía | Lista | Sí | Marítimo, Aéreo, Terrestre, Multimodal |
| País | Lista | Sí | Lista cerrada de países (alfabética, evita errores de tipeo) |
| Ciudad | Texto con autocompletar | Sí | Sugiere las capitales de departamento de Colombia al escribir; admite cualquier otra ciudad |
| Dirección principal | Texto | Sí | |
| Fecha de implementación del SOP | Fecha | Sí | |
| Servicios contratados | Selección múltiple (chips) | Sí, mínimo 1 | OTM/DTA, Transporte nacional, Transporte internacional, Aduanas, Almacenamiento/Bodega |

**Objetivo del SOP** y **Alcance del SOP** **no se piden en el formulario**: van con un texto institucional fijo que se diligencia automáticamente en el documento final, igual para todos los clientes.

### 2.5 Sección 2 — Resumen ejecutivo del cliente

| Campo | Tipo | Obligatorio | Opciones / notas |
|---|---|---|---|
| Resumen del negocio del cliente | Texto largo | No | |
| Riesgos críticos / alertas operativas | Texto largo | No | |
| Requiere atención 24/7 | Sí/No/N-A | Sí | |
| Requiere reuniones KPI | Sí/No/N-A | Sí | |
| Periodicidad revisión y actualización SOP | Lista | Sí | Mensual, Trimestral, Semestral, Anual |

El campo **Nivel Cliente** no aparece aquí: lo asigna Turinza desde el panel interno después de recibir el SOP (ver sección 3.4).

### 2.6 Sección 3 — Matriz de contactos

Solo se diligencia la tabla **"Contactos del cliente"**. (La tabla de "Contactos internos Turinza / Cuenta" no la llena el cliente — la completa Turinza desde el panel interno.)

Por cada una de las 4 áreas fijas — **Operaciones / Logística, Contabilidad / Facturación, Tesorería / Pagos, Calidad / Servicio al cliente** — se pide:

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre / Cargo | Texto | Sí |
| Teléfono | Texto (mín. 7 caracteres) | Sí |
| Correo | Correo válido | Sí |
| Backus | Texto (contacto de respaldo) | No |

Además, un **Contacto de escalonamiento** único (Nombre/Cargo, Teléfono, Correo — todos obligatorios) para cuando los contactos normales no resuelven algo.

`[Captura: una fila de la matriz de contactos del cliente con sus 4 campos]`

### 2.7 Sección 4 — Preferencias, protocolos y particularidades

**4.1 Trazabilidad de operaciones y reportes**

| Campo | Tipo | Obligatorio | Opciones / notas |
|---|---|---|---|
| Frecuencia de reportes del consolidado | Lista | Sí | 1 por semana, 2 por semana, Quincenal |
| Formato / canal | Texto | No | Por defecto: "Sistema Odoo" |
| Contenido mínimo requerido | Texto largo | No | Sugerencia: estado del envío, tiempos estimados, KPI específicos |
| Instructivo Odoo para el cliente | Texto | No | |

**4.2 Comunicación, tiempos de respuesta y escalamiento**

Por cada uno de los 3 tipos fijos — **Informativa, Preventiva, Alertas** — se pide:

| Campo | Tipo | Obligatorio | Opciones |
|---|---|---|---|
| Canales preferidos | Lista | Sí | Correo - Odoo, WhatsApp - Odoo, Llamada - Odoo, Teams - Odoo |
| Frecuencia | Lista | Sí | 1 por semana, 2 por semana, Quincenal |
| Con copia a contactos internos | Sí/No/N-A | Sí | |

### 2.8 Sección 5 — Matriz de procesos y personalizaciones operativas

Por cada uno de los 5 procesos fijos — **Transporte nacional, Transporte internacional, Agenciamiento aduanero, Almacenamiento / Bodega, OTM / DTA**:

| Campo | Tipo | Obligatorio | Opciones / notas |
|---|---|---|---|
| Aplica | Sí/No/N-A | Sí | **Por defecto "No"** |
| Responsable | Lista | Solo si Aplica = Sí | Comercial, Operaciones, Customer Service/KAS, Facturación, Almacenamiento/Bodega, Calidad, Gerencia |
| Actividad / Hito | Texto | No, solo visible si Aplica = Sí | |
| Personalización acordada | Texto | No, solo visible si Aplica = Sí | |
| SLA / Tiempo | Lista | No, solo visible si Aplica = Sí | Diario, Semanal, Quincenal, Mensual, Por evento, Tiempo real |
| KPI asociado | Texto | No, solo visible si Aplica = Sí | |
| Control / Evidencia | Texto | No, solo visible si Aplica = Sí | |

**Comportamiento clave:** mientras "Aplica" esté en No o N/A, los demás campos de esa fila permanecen ocultos. Al marcar "Sí" se despliegan automáticamente.

`[Captura: una fila con "Aplica" = No (campos ocultos) y otra con "Aplica" = Sí (campos desplegados)]`

### 2.9 Sección 6 — Interacción con otras áreas y condiciones comerciales

Por cada una de las 4 áreas fijas — **Comercial / Pricing, Facturación & Cartera, Crédito / Riesgo, Gerencia / Dirección**:

| Campo | Tipo | Obligatorio |
|---|---|---|
| Regla / condición acordada | Texto largo | No |
| Impacto operativo | Texto | No |
| Observaciones | Texto | No |

### 2.10 Sección 7 — Cumplimiento normativo y requisitos especiales

Por cada uno de los 6 requisitos fijos — **BASC, OEA, Seguro especial de mercancía, Auditorías especiales del cliente, Requisito documental adicional, Otro requisito especial**:

| Campo | Tipo | Obligatorio | Opciones / notas |
|---|---|---|---|
| ¿Aplica? | Sí/No/N-A | Sí | **Por defecto "No"** |
| Responsable | Lista | Solo si Aplica = Sí | Mismas 7 opciones de áreas que en la Sección 5 |
| Detalle / evidencia / control | Texto | No, solo visible si Aplica = Sí | |

Mismo comportamiento condicional que la Sección 5: los campos de detalle solo se muestran cuando "¿Aplica?" = Sí.

### 2.11 Sección 8 — Riesgos operativos y alertas

Tabla de filas libres (el cliente puede agregar tantos riesgos como necesite, mínimo 1, con el botón **"Agregar riesgo"**; cada fila tiene un enlace **"Eliminar fila"** que solo aparece cuando hay más de un riesgo registrado, para evitar dejar la tabla vacía):

| Campo | Tipo | Obligatorio | Opciones |
|---|---|---|---|
| Riesgo / cambio identificado | Texto | Sí | |
| Impacto | Lista | Sí | Alta, Media, Baja |
| Responsable | Lista | Sí | Comercial, Operaciones, Customer Service/KAS, Facturación, Almacenamiento/Bodega, Calidad, Gerencia |
| Acción correctiva | Texto | No | |
| Eficacia | Texto | No | |

Esta sección muestra la nota fija del formato original: *"Nota: Los riesgos se revisan semestralmente y se actualizan cuando se identifican nuevos riesgos dentro de la operación."*

### 2.12 Sección 9 — Observaciones, validación y aprobaciones

| Campo | Tipo | Obligatorio |
|---|---|---|
| Observaciones | Texto largo | No |
| Revisó Cliente — Nombre / Cargo | Texto | Sí |
| Aprobó Cliente — Nombre / Cargo | Texto | Sí |

Los bloques "Revisó Turinza" y "Aprobó Turinza" **no aparecen aquí**: Turinza los completa desde el panel interno.

### 2.13 Enviar el formulario

Al pulsar **"Enviar formulario"** en el último paso:

1. El sistema valida todos los campos obligatorios de las 9 secciones.
2. Si todo es correcto, guarda el SOP y muestra el ID asignado.
3. **Se descarga automáticamente una copia en Excel** con los datos diligenciados, en el formato oficial de Turinza (réplica exacta del formato, incluido el logo).
4. Si la descarga automática no se dispara (algunos navegadores la bloquean), aparece un botón **"Descargar copia en Excel"** para hacerlo manualmente.
5. El borrador guardado en el navegador se borra.

`[Captura: pantalla de confirmación "El SOP se guardó correctamente (ID ...)" con el botón de descarga manual]`

---

## 3. Guía para el Administrador — Panel interno

### 3.1 Acceso

**Enlace de acceso:** [https://sop-turinza.vercel.app/dashboard](https://sop-turinza.vercel.app/dashboard)

El navegador pedirá **usuario y contraseña** (autenticación HTTP básica) la primera vez que se accede en esa sesión del navegador.

| | |
|---|---|
| **Usuario** | `adm1n_tur1n2a` |
| **Contraseña** | `Tur1nz4_2026++` |

> ⚠️ Estas credenciales son confidenciales: dan acceso a todos los SOP de clientes recibidos. No deben compartirse con clientes ni distribuirse fuera del equipo de Turinza autorizado. Si este manual circula ampliamente, considera rotar la contraseña (variable de entorno `DASHBOARD_PASSWORD` en el despliegue) y entregarla por un canal separado.

Desde el formulario público hay un botón **"Panel interno →"** en el encabezado para llegar directo; desde el panel hay un botón **"← Ir al formulario"** para volver.

`[Captura: cuadro de diálogo de autenticación del navegador pidiendo usuario/contraseña]`

### 3.2 Listado de SOPs (`/dashboard`)

Tabla (o tarjetas en pantallas pequeñas) con todos los SOP recibidos, mostrando por cada uno:

- **Cliente** (enlace al detalle)
- **NIT**
- **Tipo de operación**
- **Nivel** (Nivel Cliente, si ya fue asignado)
- **Estado** (insignia de color: Abierto, En revisión, Obsoleto, Aprobado)
- **Fecha** de envío

Si un SOP todavía no tiene **Nivel Cliente** asignado, aparece una etiqueta roja **"● Pendiente"** junto al nombre del cliente, para detectar de un vistazo qué registros necesitan revisión.

`[Captura: listado de SOPs con la etiqueta "Pendiente" visible en alguna fila]`

### 3.3 Detalle de un SOP (`/dashboard/[id]`)

La pantalla de detalle está dividida en dos zonas claramente diferenciadas por color:

#### A. "Acciones de Turinza" (panel rojo institucional, arriba de todo)

Las **3 únicas cosas que el cliente no diligencia** y le corresponden al administrador, numeradas:

1. **Nivel Cliente** — selector (Nivel 1, Nivel 2, Nivel 3). Se guarda automáticamente al elegir una opción.
2. **Contactos internos Turinza / Cuenta** — la misma tabla de 4 áreas + escalonamiento que ve el cliente en su Sección 3, pero para los contactos internos de Turinza. Se guarda con el botón **"Guardar contactos internos"**.
3. **Revisó / Aprobó Turinza** — Nombre y Cargo de quien revisó y quien aprobó el SOP por parte de Turinza. Cada uno tiene su propio botón **"Guardar"**.

Cada guardado muestra una confirmación ("Guardado") o un mensaje de error si falla.

`[Captura: panel "Acciones de Turinza" completo, con las 3 tareas numeradas]`

#### B. "Datos enviados por el cliente" (acordeón azul/neutro, debajo)

Las 9 secciones que el cliente diligenció, en **modo solo lectura**, mostradas como un acordeón colapsable (las secciones 2 a 9 empiezan cerradas; solo "Datos generales" se abre automáticamente). Se hace clic en el encabezado de cada sección para expandirla o colapsarla.

`[Captura: acordeón con la primera sección abierta y el resto colapsado, mostrando las flechas de expandir]`

### 3.4 Descargar el Excel desde el panel

En la parte superior del detalle hay un botón **"Descargar Excel"** que genera y descarga, en cualquier momento, la copia en el formato oficial de Turinza con los datos actuales del SOP (incluye lo que el cliente envió **y** lo que Turinza ya haya diligenciado en "Acciones de Turinza").

---

## 4. Notas y aclaraciones

- **"Backus"** es el nombre del campo de contacto de respaldo tal como aparece en el formato Excel original de Turinza (columna I/J de la Matriz de Contactos); se mantiene ese nombre en el sistema digital para que coincida con el documento físico.
- El **Objetivo** y **Alcance del SOP** siempre se exportan con el mismo texto institucional fijo, sin importar lo que se haya guardado antes — esto evita que un registro de prueba antiguo o un borrador quede con texto incorrecto en el Excel final.
- El sistema **no usa una base de datos tradicional**: cada SOP enviado se guarda como un registro independiente; por eso el panel interno siempre refleja el último estado guardado.
- Si el panel interno muestra un error de "Panel no configurado", significa que el despliegue no tiene configuradas las credenciales de acceso — debe contactarse al equipo técnico, no es un error del usuario.
