/*
  Warnings:

  - You are about to drop the column `maks_skb` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `maks_skd` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `nilai_integrasi_skb` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `nilai_integrasi_skd` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `skor_skb` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `total_nilai_akhir` on the `exam_sessions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TUTOR';

-- AlterTable
ALTER TABLE "exam_sessions" DROP COLUMN "maks_skb",
DROP COLUMN "maks_skd",
DROP COLUMN "nilai_integrasi_skb",
DROP COLUMN "nilai_integrasi_skd",
DROP COLUMN "skor_skb",
DROP COLUMN "total_nilai_akhir";
