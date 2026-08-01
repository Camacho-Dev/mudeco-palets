# Mudeco Palets — Control de empresa

Sistema para mueblería: venta, fabricación, facturación, inventario, cobros, cotizaciones y área privada con auditoría.

## Arranque

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin@empresa.com` | `admin123` | Admin |
| `vendedor@empresa.com` | `vendedor123` | Empleado |

## Operación (sin clave extra)

Generar factura · Facturas · Cotizaciones · Clientes · Catálogo

## Privado (clave de admin)

Panel · Finanzas (con aging CxC) · Inventario/Kardex · Cobros · Proveedores · Compras · Notas de crédito · Fabricación · Usuarios · Exportar CSV · Respaldo JSON · Empresa/NCF · Historial

## Seguridad

- Roles: solo admin anula facturas, elimina clientes/pagos, ajusta stock, gestiona usuarios/compras
- Área privada con cookie firmada (~45 min)
- Auditoría de acciones + rate limit en login/desbloqueo
- Respaldo JSON desde menú privado

## Fiscal / stock

- Series NCF (B01/B02…) en Empresa; auto al facturar
- Stock atómico + kardex; sin sobreventa
- Anular factura repone stock y borra pagos

## Tests / CI

```bash
npm run test
```

GitHub Actions en `.github/workflows/ci.yml`

## Postgres (opcional)

```bash
docker compose up -d
# Luego DATABASE_URL="postgresql://mudeco:mudeco@localhost:5432/mudeco"
# y cambia provider a postgresql en prisma/schema.prisma
```
