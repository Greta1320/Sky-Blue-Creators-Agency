# 🦅 Sky Blue Creators Agency

Sistema de administración para la operación de **placement de modelos** de
Matías Vega (estilo agencia Anyfans/OnlyFans), con **CRM**, panel jerárquico
(Master → Vendedores) y la **extensión de Chrome "Halcón"** para prospectar
directamente desde el navegador.

Construido a partir del roadmap del negocio: prospección → formulario →
listing → distribución a dueños de mercado → cierre → garantía de 7 días →
comisión.

---

## 🧩 Qué incluye este MVP

| Módulo | Descripción |
| --- | --- |
| **Panel Master (Matías)** | Ve **todo hacia abajo**: todas las modelos, todos los vendedores y sus comisiones. Único con acceso a **dueños de mercado**. |
| **Panel Vendedor** | Solo ve **sus** modelos, su pipeline y sus comisiones. Sin acceso a dueños de mercado ni grupos. |
| **CRM de modelos** | Pipeline con estados: Prospectada → Formulario → Listing → Enviada a mercado → Colocada → En garantía → Cobrada. |
| **Garantía 7 días** | Al colocar una modelo arranca la cuenta atrás; alerta cuando faltan pocos días o vence. |
| **Comisiones** | Cálculo automático: **40 %** dueño de mercado; del resto, **50/50** Matías / vendedor. Se genera al marcar "Cobrada". |
| **Formulario público** | `/aplicar` — la modelo carga sus datos directo al CRM (reemplaza el WhatsApp manual). Soporta `?ref=<vendedor>`. |
| **Kit de formación** | Scripts, FAQs e ideas de contenido, disponibles en la web y en Halcón. |
| **Extensión Halcón** | Captura de prospectos de 1 clic desde Instagram / WhatsApp Web, pipeline propio y kit a mano. |

> Este MVP cubre la **Fase 1** del roadmap (captura + CRM + jerarquía + garantía
> + comisiones) más la extensión Halcón. Las fases siguientes (IA para generar
> listings, distribución por WhatsApp/Telegram, escalamiento) quedan preparadas
> sobre esta base.

---

## 🏗️ Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**
- **Prisma ORM** — SQLite en desarrollo, Postgres en producción
- **Auth** propia con JWT (`jose`) + `bcryptjs`, jerarquía por rol
- **Extensión Chrome** Manifest V3 (vanilla JS)

---

## 🚀 Puesta en marcha (desarrollo)

Requisitos: Node.js ≥ 18.18.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
#   Editá .env y poné un AUTH_SECRET (openssl rand -base64 32)

# 3. Crear la base de datos y los datos de ejemplo
npm run db:push
npm run db:seed

# 4. Levantar la app
npm run dev
```

Abrí <http://localhost:3000>.

### Usuarios de ejemplo (del seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| **Master (Matías)** | `matias@skyblue.agency` | `Cambiar123!` |
| Vendedor | `sofia@skyblue.agency` | `Vendedor123!` |
| Vendedor | `bruno@skyblue.agency` | `Vendedor123!` |

> Cambiá estas credenciales antes de usarlo en serio (variables `SEED_MASTER_*`).

---

## 🦅 Extensión Halcón

Ver [`extension/README.md`](extension/README.md) para instalar y configurar la
extensión de Chrome. En resumen:

1. `chrome://extensions` → activá **Modo desarrollador** → **Cargar
   descomprimida** → elegí la carpeta `extension/`.
2. Abrí Halcón, en **Ajustes de conexión** poné la URL de la API
   (`http://localhost:3000` en dev) e iniciá sesión con tu cuenta.
3. En Instagram / WhatsApp Web aparece el botón flotante **"🦅 Capturar"**;
   o cargá el prospecto desde el popup. Entra al CRM como *Prospectada*
   asignada a vos.

---

## 💰 Lógica de comisiones

Sobre el monto del acuerdo (`dealAmount`, o el `price` de la modelo):

```
corte dueño de mercado = dealAmount × cutRate        (por defecto 40 %)
neto                    = dealAmount − corte
comisión vendedor       = neto × commissionRate       (por defecto 50 %)
parte Matías            = neto − comisión vendedor
```

La comisión se genera al pasar la modelo a **Cobrada** (garantía cumplida).
Ejemplo con `dealAmount = 1400` y mercado al 40 %: mercado **$560**, vendedor
**$420**, Matías **$420**.

Implementación: [`src/lib/commissions.ts`](src/lib/commissions.ts).

---

## 🔐 Jerarquía y permisos

- **Master** ve y edita todo; asigna precio, listing, dueño de mercado y cierre;
  crea vendedores; único con acceso a `/dashboard/mercados`.
- **Vendedor** ve solo sus modelos; puede crear prospectos y editar datos de
  contacto/notas; **no** puede tocar precio, listing, mercado ni etapas de
  cierre (validado en la API, no solo en la UI).

Reglas centralizadas en [`src/lib/api.ts`](src/lib/api.ts) (scope + guards) y
[`src/lib/constants.ts`](src/lib/constants.ts).

---

## 📁 Estructura

```
src/
  app/
    api/              # Endpoints (auth, models, users, market-owners,
                      #   commissions, metrics, training, public/apply,
                      #   extension/capture)
    dashboard/        # Paneles (dashboard, modelos, comisiones, formacion,
                      #   vendedores*, mercados*)   (* solo master)
    login/  aplicar/  # Login y formulario público
  components/         # UI (tablas, modales, badges)
  lib/                # auth, prisma, comisiones, pipeline, métricas, validación
  middleware.ts       # Protege /dashboard
prisma/
  schema.prisma       # Modelo de datos
  seed.ts             # Datos de ejemplo
extension/            # Extensión Chrome "Halcón" (Manifest V3)
```

---

## 🌐 Despliegue en producción (Vercel + Postgres)

1. Creá una base **Postgres** (Neon, Supabase, Vercel Postgres…).
2. En `prisma/schema.prisma` cambiá `provider = "sqlite"` a
   `provider = "postgresql"`.
3. En Vercel configurá las variables: `DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_APP_URL`.
4. Deploy. Corré las migraciones (`npx prisma db push`) y, si querés, el seed.
5. En la extensión Halcón, poné la URL pública de la API en **Ajustes** y
   ajustá `EXTENSION_ORIGINS` / `host_permissions` al dominio real.

---

## 🗺️ Roadmap siguiente (fases 2–6)

- **Fase 2** — IA que convierte el formulario en listing automáticamente.
- **Fase 3** — Distribución automática a dueños de mercado (WhatsApp/Telegram API).
- **Fase 4** — Reporting avanzado (tasa de conversión por etapa, tiempo de cierre).
- **Fase 5** — Módulo de formación ampliado (onboarding de vendedores).
- **Fase 6** — Escalamiento y nuevos mercados.

El modelo de datos ya contempla estos pasos (estados, `source`, `formData`,
`TrainingResource`, historial de estados).
