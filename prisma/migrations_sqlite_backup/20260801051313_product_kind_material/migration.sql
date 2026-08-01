-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'FINISHED',
    "category" TEXT NOT NULL DEFAULT 'Muebles',
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0.18,
    "unit" TEXT NOT NULL DEFAULT 'UND',
    "stock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "widthCm" REAL,
    "heightCm" REAL,
    "depthCm" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("active", "category", "cost", "createdAt", "depthCm", "description", "heightCm", "id", "imageUrl", "minStock", "name", "price", "sku", "stock", "taxRate", "unit", "updatedAt", "widthCm") SELECT "active", "category", "cost", "createdAt", "depthCm", "description", "heightCm", "id", "imageUrl", "minStock", "name", "price", "sku", "stock", "taxRate", "unit", "updatedAt", "widthCm" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
