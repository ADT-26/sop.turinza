# 📋 Formulario Empresarial en Vercel
## Opción B: CSV OneDrive + Vercel Postgres

**Solución 100% Gratuita | Escalable | Profesional**

> **Nota de estado:** este documento describe la arquitectura conceptual original (visión, flujo de datos, stack). El avance real de la implementación, el inventario de campos/listas extraído de `formats/formato_SOP.xlsx` y el checklist de fases se llevan en **[PLAN-IMPLEMENTACION.md](PLAN-IMPLEMENTACION.md)**. El proyecto ya migró a Next.js usando `src/app/` (en lugar de `app/` en la raíz como se muestra más abajo) — el resto de la arquitectura (API Routes, Vercel Postgres, OneDrive vía Graph API, Resend) sigue vigente como objetivo.

---

## 📊 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Componentes](#componentes)
4. [Ventajas](#ventajas)
5. [Flujo de Datos](#flujo-de-datos)
6. [Stack Tecnológico](#stack-tecnológico)
7. [Configuración Inicial](#configuración-inicial)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Implementación](#implementación)
10. [Despliegue en Vercel](#despliegue-en-vercel)
11. [Mantenimiento](#mantenimiento)
12. [Costos](#costos)

---

## 🎯 Visión General

Un **formulario empresarial personalizado** alojado en Vercel que:
- ✅ Captura datos del cliente
- ✅ Guarda en **Vercel Postgres** (para dashboard en tiempo real)
- ✅ Exporta a **CSV en OneDrive** (backup + descarga)
- ✅ Envía **email de confirmación** al cliente
- ✅ Permite búsquedas y filtros
- ✅ 100% gratuito

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                     │
│          Formulario Empresarial (React)                 │
│         - Validaciones en frontend                      │
│         - Diseño profesional                            │
└─────────────┬───────────────────────────────────────────┘
              │ POST /api/submit-form
              │ (JSON)
              ▼
┌─────────────────────────────────────────────────────────┐
│                 VERCEL (Backend)                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js API Routes                              │  │
│  │  - POST /api/submit-form (recibe datos)          │  │
│  │  - GET /api/forms (lista de respuestas)          │  │
│  │  - GET /api/forms/:id (detalle)                  │  │
│  └──────────────────────────────────────────────────┘  │
│                      │                                  │
│       ┌──────────────┼──────────────┐                   │
│       │              │              │                   │
│       ▼              ▼              ▼                   │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐           │
│  │ Validate│  │ Save DB │  │ Export CSV   │           │
│  │ Data    │  │(Postgres)│  │ to OneDrive  │           │
│  └─────────┘  └─────────┘  └──────────────┘           │
│       │              │              │                   │
│       └──────────────┼──────────────┘                   │
│                      │                                  │
│                      ▼                                  │
│              ┌──────────────┐                          │
│              │ Send Email   │                          │
│              │ (Resend API) │                          │
│              └──────────────┘                          │
└─────────────────────────────────────────────────────────┘
              │              │
              ▼              ▼
    ┌──────────────┐  ┌─────────────────┐
    │   Postgres   │  │   OneDrive      │
    │   Database   │  │   CSV File      │
    │   (Vercel)   │  │   (Backup)      │
    └──────────────┘  └─────────────────┘
         (BD SQL)       (Respaldo)
```

---

## 🔧 Componentes

### **1. Vercel (Hosting)**
- Aloja la app Next.js
- Ejecuta API Routes
- Gratis

### **2. Vercel Postgres (Base de Datos)**
- Almacena datos en SQL
- Free tier: 5GB, sin límites de requests
- Acceso vía dashboard
- Búsquedas rápidas

### **3. OneDrive (Backup + CSV)**
- CSV con todos los registros
- Descarga directa
- Redundancia de datos
- Integración con tu empresa

### **4. Resend API (Emails)**
- Envía confirmación al cliente
- Free tier: 100 emails/día
- Plantillas profesionales

### **5. Git (Versionamiento)**
- Código en repositorio
- Despliegue automático desde Git

---

## ✨ Ventajas

| Aspecto | Detalle |
|--------|---------|
| **Costo** | 100% Gratuito |
| **Escalabilidad** | Millones de registros |
| **Redundancia** | Datos en 2 lugares (Postgres + CSV) |
| **Velocidad** | <1 segundo por formulario |
| **Profesionalismo** | Dashboard + Diseño empresarial |
| **Backup** | CSV descargable en OneDrive |
| **Mantenimiento** | Mínimo requerido |
| **Seguridad** | HTTPS + Validaciones |
| **Flexible** | Fácil de modificar |

---

## 🔄 Flujo de Datos

### **Paso a Paso**

```
1. CLIENTE LLENA FORMULARIO
   └─ Nombre, Email, Empresa, Teléfono, Mensaje
   └─ Validación en frontend (React)

2. CLIENTE HACE CLICK EN "ENVIAR"
   └─ API llama a POST /api/submit-form
   └─ Envía JSON con los datos

3. SERVIDOR VALIDA DATOS
   ✓ Email válido
   ✓ Campos requeridos
   ✓ Sin campos vacíos

4. GUARDA EN POSTGRES
   └─ INSERT INTO forms (...)
   └─ Timestamp automático
   └─ ID único generado

5. EXPORTA A CSV ONEDRIVE
   └─ Lee CSV actual
   └─ Agrega nueva fila
   └─ Sobrescribe en OneDrive

6. ENVÍA EMAIL
   ├─ Al cliente: "Recibimos tu formulario"
   └─ A ti: "Nuevo formulario recibido"

7. RESPONDE AL CLIENTE
   ├─ Status 200: "Éxito"
   └─ Mensaje: "Te enviaremos un email pronto"

8. CLIENTE VE CONFIRMACIÓN
   └─ "✓ Formulario enviado correctamente"
```

---

## 💻 Stack Tecnológico

### **Frontend**
```
- Next.js 14+          (Framework React)
- React Hook Form      (Manejo de formularios)
- Tailwind CSS         (Estilos profesionales)
- Zod / Yup            (Validaciones)
```

### **Backend**
```
- Next.js API Routes   (Endpoints)
- Postgres             (Base de datos)
- @vercel/postgres     (Cliente SQL)
- Microsoft Graph API  (Acceso a OneDrive)
- Resend               (Email)
```

### **Infraestructura**
```
- Vercel               (Hosting)
- GitHub/GitLab        (Repositorio)
- OneDrive             (Almacenamiento)
```

---

## ⚙️ Configuración Inicial

### **Requisito 1: Registrar App en Azure**

1. Ve a [portal.azure.com](https://portal.azure.com)
2. Inicia sesión con tu cuenta Outlook
3. Busca "App registrations"
4. Click "New registration"
   - **Name:** `FormularioEmpresarial`
   - **Redirect URI:** `https://localhost:3000/api/auth/callback`

5. Guarda:
   - `Application (client) ID`
   - `Directory (tenant) ID`

6. Ve a "Certificates & secrets"
   - Click "New client secret"
   - Guarda el valor (solo se ve una vez)

7. Ve a "API permissions"
   - Click "Add a permission"
   - Selecciona "Microsoft Graph"
   - Busca `Files.ReadWrite`
   - Click "Grant admin consent"

---

### **Requisito 2: Crear Carpeta en OneDrive**

1. Ve a [onedrive.live.com](https://onedrive.live.com)
2. Crea carpeta: `Formularios-Empresa`
3. Crea archivo Excel: `Respuestas.xlsx`
4. Agrega encabezados:
   ```
   Fecha | Nombre | Email | Empresa | Teléfono | Mensaje | Estado
   ```
5. Copia el **ID de la carpeta** de la URL:
   ```
   onedrive.live.com/?cid=...&id=...
   ```
   El ID está después de `id=`

---

### **Requisito 3: Crear Proyecto en Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Crea nuevo proyecto desde Git
3. Selecciona tu repositorio
4. Vercel detectará Next.js automáticamente

---

### **Requisito 4: Variables de Entorno**

En Vercel dashboard, ve a "Settings" → "Environment Variables"

Agrega:

```
# Microsoft Azure / OneDrive
AZURE_CLIENT_ID=tu_client_id
AZURE_CLIENT_SECRET=tu_secret
AZURE_TENANT_ID=tu_tenant_id
ONEDRIVE_FOLDER_ID=tu_folder_id

# Vercel Postgres
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NO_SSL=postgres://...
POSTGRES_URL_SSL=postgres://...
POSTGRES_PASSWORD=...

# Resend (Email)
RESEND_API_KEY=tu_api_key

# Configuración App
NEXT_PUBLIC_APP_NAME=MiEmpresa
NEXT_PUBLIC_APP_EMAIL=contacto@miempresa.com
```

---

## 📁 Estructura del Proyecto

```
formulario-empresarial/
│
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Página del formulario
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard (admin)
│   │
│   └── api/
│       ├── submit-form.ts      # POST: recibir formulario
│       ├── forms.ts            # GET: listar formularios
│       ├── forms/[id].ts       # GET: detalle formulario
│       │
│       └── onedrive/
│           ├── export.ts       # Exportar a CSV OneDrive
│           └── sync.ts         # Sincronizar datos
│
├── components/
│   ├── Form.tsx                # Componente formulario
│   ├── FormInput.tsx           # Input reutilizable
│   ├── Dashboard.tsx           # Dashboard
│   └── FormTable.tsx           # Tabla de respuestas
│
├── lib/
│   ├── db.ts                   # Conexión Postgres
│   ├── schemas.ts              # Esquemas de validación
│   ├── onedrive.ts             # Funciones OneDrive
│   ├── email.ts                # Funciones email
│   └── utils.ts                # Utilidades
│
├── public/
│   ├── logo.svg                # Logo empresa
│   └── favicon.ico
│
├── styles/
│   └── globals.css             # Estilos globales
│
├── .env.local                  # Variables locales
├── .env.example                # Plantilla variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 🚀 Implementación

### **Archivos Clave**

#### **1. `lib/schemas.ts` (Validaciones)**

```typescript
import { z } from 'zod';

export const formSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  empresa: z.string().min(1, 'Requerido'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  mensaje: z.string().min(10, 'Mínimo 10 caracteres'),
});

export type FormData = z.infer<typeof formSchema>;
```

---

#### **2. `lib/db.ts` (Base de Datos)**

```typescript
import { sql } from '@vercel/postgres';

export async function saveFormToDB(data: any) {
  try {
    const result = await sql`
      INSERT INTO forms (nombre, email, empresa, telefono, mensaje, created_at)
      VALUES (${data.nombre}, ${data.email}, ${data.empresa}, ${data.telefono}, ${data.mensaje}, NOW())
      RETURNING id, created_at;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error saving to DB:', error);
    throw error;
  }
}

export async function getAllForms(limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT * FROM forms 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset};
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
}

export async function getFormById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM forms WHERE id = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching form:', error);
    throw error;
  }
}
```

---

#### **3. `lib/onedrive.ts` (Exportar a CSV)**

```typescript
import { Client } from '@microsoft/microsoft-graph-client';

let graphClient: any;

async function getGraphClient() {
  if (!graphClient) {
    const response = await fetch('https://login.microsoftonline.com/' + 
      process.env.AZURE_TENANT_ID + '/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    
    const { access_token } = await response.json();
    
    graphClient = Client.init({
      authProvider: (done: any) => {
        done(null, access_token);
      },
    });
  }
  
  return graphClient;
}

export async function exportToOneDriveCSV(data: any[]) {
  try {
    const client = await getGraphClient();
    
    // Convertir a CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    // Subir a OneDrive
    const fileName = `Respuestas-${new Date().toISOString().split('T')[0]}.csv`;
    
    await client
      .api(`/me/drive/items/${process.env.ONEDRIVE_FOLDER_ID}:/${fileName}:/content`)
      .put(csv);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting to OneDrive:', error);
    throw error;
  }
}
```

---

#### **4. `lib/email.ts` (Enviar Emails)**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <onboarding@resend.dev>`,
      to: email,
      subject: '✓ Hemos recibido tu formulario',
      html: `
        <h2>Hola ${name},</h2>
        <p>Gracias por ponerte en contacto con nosotros.</p>
        <p>Recibimos tu mensaje y nos pondremos en contacto pronto.</p>
        <hr>
        <p><strong>${process.env.NEXT_PUBLIC_APP_NAME}</strong></p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendNotificationEmail(formData: any) {
  try {
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <onboarding@resend.dev>`,
      to: process.env.NEXT_PUBLIC_APP_EMAIL!,
      subject: '📋 Nuevo formulario recibido',
      html: `
        <h3>Nuevo formulario recibido</h3>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Empresa:</strong> ${formData.empresa}</p>
        <p><strong>Teléfono:</strong> ${formData.telefono}</p>
        <p><strong>Mensaje:</strong> ${formData.mensaje}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

---

#### **5. `app/api/submit-form.ts` (Endpoint Principal)**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '@/lib/schemas';
import { saveFormToDB } from '@/lib/db';
import { exportToOneDriveCSV } from '@/lib/onedrive';
import { sendConfirmationEmail, sendNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar datos
    const validated = formSchema.parse(body);
    
    // Guardar en Postgres
    const dbResult = await saveFormToDB(validated);
    
    // Obtener todos los formularios para exportar
    const { getAllForms } = await import('@/lib/db');
    const allForms = await getAllForms(1000, 0);
    
    // Exportar a OneDrive CSV
    await exportToOneDriveCSV(allForms);
    
    // Enviar emails
    await sendConfirmationEmail(validated.email, validated.nombre);
    await sendNotificationEmail(validated);
    
    return NextResponse.json(
      { 
        success: true, 
        id: dbResult.id,
        message: 'Formulario enviado correctamente' 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

---

#### **6. `components/Form.tsx` (Componente Formulario)**

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormData } from '@/lib/schemas';

export function Form() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
        reset();
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Contacto</h1>
      
      {submitted && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✓ Formulario enviado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            {...register('nombre')}
            className="w-full border rounded px-3 py-2"
            placeholder="Tu nombre"
          />
          {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="tu@email.com"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <input
            {...register('empresa')}
            className="w-full border rounded px-3 py-2"
            placeholder="Tu empresa"
          />
          {errors.empresa && <span className="text-red-500 text-sm">{errors.empresa.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            {...register('telefono')}
            className="w-full border rounded px-3 py-2"
            placeholder="+57 3001234567"
          />
          {errors.telefono && <span className="text-red-500 text-sm">{errors.telefono.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <textarea
            {...register('mensaje')}
            className="w-full border rounded px-3 py-2"
            placeholder="Cuéntanos más"
            rows={4}
          />
          {errors.mensaje && <span className="text-red-500 text-sm">{errors.mensaje.message}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Formulario'}
        </button>
      </form>
    </div>
  );
}
```

---

## 📈 Despliegue en Vercel

### **Paso 1: Preparar Repositorio**

```bash
# Crear proyecto Next.js
npx create-next-app@latest formulario-empresarial --typescript

cd formulario-empresarial

# Instalar dependencias
npm install zod @hookform/resolvers react-hook-form
npm install @vercel/postgres
npm install resend
npm install @microsoft/microsoft-graph-client

# Crear archivo .env.local (llenar con tus valores)
cp .env.example .env.local
```

---

### **Paso 2: Crear Base de Datos en Vercel**

1. Ve a [vercel.com/storage](https://vercel.com/storage)
2. Click "Create Database"
3. Selecciona "Postgres"
4. Nombra: `formulario-db`
5. Copia las variables de conexión
6. Agrega a `.env.local`

---

### **Paso 3: Crear Tabla en Postgres**

```sql
CREATE TABLE forms (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  telefono VARCHAR(20),
  mensaje TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_email ON forms(email);
CREATE INDEX idx_forms_created_at ON forms(created_at);
```

---

### **Paso 4: Desplegar en Vercel**

```bash
# Hacer push a Git
git add .
git commit -m "Initial commit"
git push origin main

# Vercel detectará automáticamente
# Configurar variables de entorno en dashboard
# Despliegue automático
```

---

### **Paso 5: Configurar Dominio (Opcional)**

En Vercel dashboard:
- "Settings" → "Domains"
- Agregar tu dominio
- Apuntar DNS de tu dominio a Vercel

---

## 🔧 Mantenimiento

### **Tareas Regulares**

| Tarea | Frecuencia | Acción |
|-------|-----------|--------|
| **Backup CSV** | Semanal | Descargar CSV desde OneDrive |
| **Limpiar datos antiguos** | Mensual | Script para archivar (opcional) |
| **Monitorear límites** | Mensual | Ver uso de Postgres y Resend |
| **Actualizaciones** | Según sea | npm update |

---

### **Script de Backup Automático**

```typescript
// app/api/backup.ts
import { getAllForms } from '@/lib/db';
import { exportToOneDriveCSV } from '@/lib/onedrive';

export async function GET(req: Request) {
  // Validar que sea Vercel Cron
  const token = req.headers.get('authorization');
  if (token !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const allForms = await getAllForms(10000, 0);
    await exportToOneDriveCSV(allForms);
    return new Response('Backup completado', { status: 200 });
  } catch (error) {
    return new Response('Error en backup', { status: 500 });
  }
}
```

En `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/backup",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 💰 Costos

### **Desglose de Gastos**

| Servicio | Costo | Límite |
|----------|------|--------|
| **Vercel** | Gratis | Ilimitado |
| **Vercel Postgres** | Gratis | 5GB |
| **OneDrive** | Gratis | 5GB |
| **Resend** | Gratis | 100 emails/día |
| **Azure App** | Gratis | Requests ilimitadas |
| **GitHub** | Gratis | Repos ilimitados |
| **TOTAL** | **$0 / mes** | ✅ Suficiente para 1000s formularios |

---

### **Cuando Escales (Opcional)**

| Servicio | Costo |
|----------|------|
| Vercel (Pro) | $20/mes |
| Postgres (más datos) | Variable |
| Resend (más emails) | $0.20 por 1000 |
| OneDrive (más espacio) | 100GB = $2/mes |

---

## 📋 Checklist de Implementación

- [ ] Registrar app en Azure
- [ ] Crear carpeta y CSV en OneDrive
- [ ] Crear proyecto en Vercel
- [ ] Agregar variables de entorno
- [ ] Crear tabla en Postgres
- [ ] Clonar repositorio
- [ ] Instalar dependencias
- [ ] Completar archivos (`lib/`, `components/`, `app/api/`)
- [ ] Probar en local: `npm run dev`
- [ ] Push a GitHub
- [ ] Vercel despliega automáticamente
- [ ] Probar formulario en producción
- [ ] Verificar datos en Postgres
- [ ] Verificar CSV en OneDrive

---

## 🚨 Troubleshooting

### **Error: "No se conecta a OneDrive"**
- Verificar `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`
- Agregar permisos `Files.ReadWrite` en Azure

### **Error: "Postgres no responde"**
- Verificar `POSTGRES_URL` correcta
- Verificar tabla existe con: `SELECT * FROM forms;`

### **Emails no llegan**
- Verificar `RESEND_API_KEY`
- Verificar `NEXT_PUBLIC_APP_EMAIL`
- Revisar spam

### **CORS o autenticación**
- Agregar redirect URI correcta en Azure
- Verificar dominio en Vercel

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Microsoft Graph API](https://docs.microsoft.com/graph)
- [Resend Docs](https://resend.com/docs)

---

## 👨‍💼 Soporte

Para problemas:
1. Revisar logs en Vercel dashboard
2. Verificar variables de entorno
3. Probar en local antes de desplegar
4. Usar `console.log()` para debug

---

**Versión:** 1.0  
**Última actualización:** Junio 2024  
**Licencia:** MIT
