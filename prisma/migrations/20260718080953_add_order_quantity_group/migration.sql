-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "userId" TEXT,
    "groupId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "receiptRef" TEXT,
    "rejectReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookOrder_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BookOrder" ("address", "bookId", "createdAt", "id", "name", "phone", "receiptRef", "rejectReason", "status", "userId") SELECT "address", "bookId", "createdAt", "id", "name", "phone", "receiptRef", "rejectReason", "status", "userId" FROM "BookOrder";
DROP TABLE "BookOrder";
ALTER TABLE "new_BookOrder" RENAME TO "BookOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
