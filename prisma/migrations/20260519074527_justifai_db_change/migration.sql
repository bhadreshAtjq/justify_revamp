-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'AUDITOR', 'PUBLIC_VERIFIER');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hashProfiles" JSONB,
    "branding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PUBLIC_VERIFIER',
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRecord" (
    "id" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gpa" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "keccak256Hash" TEXT NOT NULL,
    "merkleLeaf" TEXT,
    "type" TEXT NOT NULL DEFAULT 'marksheet',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "institutionId" TEXT,
    "anchorId" TEXT,

    CONSTRAINT "StudentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerkleAnchor" (
    "id" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "txHash" TEXT,
    "university" TEXT,
    "year" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerkleAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "Institution"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRecord_keccak256Hash_key" ON "StudentRecord"("keccak256Hash");

-- CreateIndex
CREATE INDEX "StudentRecord_registrationNo_idx" ON "StudentRecord"("registrationNo");

-- CreateIndex
CREATE INDEX "StudentRecord_keccak256Hash_idx" ON "StudentRecord"("keccak256Hash");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleAnchor_merkleRoot_key" ON "MerkleAnchor"("merkleRoot");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRecord" ADD CONSTRAINT "StudentRecord_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRecord" ADD CONSTRAINT "StudentRecord_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "MerkleAnchor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerkleAnchor" ADD CONSTRAINT "MerkleAnchor_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
