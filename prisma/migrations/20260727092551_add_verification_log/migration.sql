-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);
