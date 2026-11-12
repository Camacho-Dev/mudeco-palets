-- Encargos de fabricación: productos agotados o siempre por encargo.
-- IF NOT EXISTS: seguro aunque la base de producción se haya sincronizado con `db push`.

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "madeToOrderOnly" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "leadTimeMinDays" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "leadTimeMaxDays" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "depositPercent" INTEGER NOT NULL DEFAULT 50;

ALTER TABLE "WebOrder" ADD COLUMN IF NOT EXISTS "madeToOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WebOrder" ADD COLUMN IF NOT EXISTS "amountDueNow" DOUBLE PRECISION;
ALTER TABLE "WebOrder" ADD COLUMN IF NOT EXISTS "estimatedReadyAt" TIMESTAMP(3);

ALTER TABLE "WebOrderItem" ADD COLUMN IF NOT EXISTS "madeToOrder" BOOLEAN NOT NULL DEFAULT false;
