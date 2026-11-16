-- Reseñas por producto. IF NOT EXISTS: seguro si producción se sincronizó con `db push`.
ALTER TABLE "CustomerReview" ADD COLUMN IF NOT EXISTS "productId" TEXT;
CREATE INDEX IF NOT EXISTS "CustomerReview_productId_status_idx" ON "CustomerReview"("productId", "status");
DO $$ BEGIN
  ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
