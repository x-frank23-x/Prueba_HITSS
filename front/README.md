# Monitor de Alarmas — Frontend (React + Vite)

Stack: React 19 · Vite · Tailwind v4 · motion · Recharts · lucide-react · react-hook-form + zod ·
react-dropzone · TanStack Table/Query · axios · SheetJS (Excel).
Tema: negro + morado + celeste, componentes estilo Facebook (topbar, sidebar, tarjetas, modales, pastillas).

## Ejecutar
    npm install
    npm run dev        # http://localhost:5173

`.env`: `VITE_USE_MOCK=true` = datos simulados en el navegador (sin backend).
Para tu API real: `VITE_USE_MOCK=false` y `VITE_API_URL=http://localhost:8000` (el backend debe habilitar CORS).

## Contrato de la API (router FastAPI, prefijo `/api/alarms`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/alarms/` | Lista todas las alarmas (el backend solo filtra por `criticality`; las consultas del formulario se aplican en el cliente) |
| POST | `/api/alarms/` (JSON) | Crea: `{idAlarm, tec2g, tec3g, tec4g, dateCreate, muni, depa, noti}` |
| POST | `/api/alarms/import` (multipart, campo `file`, solo `.csv`) | Importa y **reemplaza** todas las alarmas → `{fileName, totalProcessed, items}` |
| GET | `/api/alarms/summary/today` | Resumen del día por hora (el front acepta lista `[{hora|hour, total}]` o mapa `{"08:00": 2}`) |

Importante: las rutas con `"/"` llevan barra final (`/api/alarms/`); sin ella FastAPI responde 307.
El backend necesita `CORSMiddleware` con el origen del frontend (p. ej. `http://localhost:5173`).
Errores: `{"detail": "mensaje"}` (string o lista 422).

## Notas
- La clasificación de criticidad la hace el backend. `src/lib/mock.ts` la replica solo para la demo.
- La duración acumulada se calcula en pantalla desde `dateCreate` (cada 30 s); los datos se refrescan cada 60 s. El nivel (`critical`) viene del backend.
- "Exportar a Excel" exporta todas las filas filtradas/buscadas/ordenadas, no solo la página.
