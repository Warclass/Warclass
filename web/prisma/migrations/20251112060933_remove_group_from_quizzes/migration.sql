/*
  Warnings:

  - You are about to drop the column `group_id` on the `quizzes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."quizzes" DROP CONSTRAINT "quizzes_group_id_fkey";

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "group_id";
