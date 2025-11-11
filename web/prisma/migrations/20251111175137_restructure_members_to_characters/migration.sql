/*
  Warnings:

  - You are about to drop the column `character_id` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `events_history` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `quizzes_history` table. All the data in the column will be lost.
  - You are about to drop the `_membersTotasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `members` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,group_id]` on the table `characters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quiz_id,character_id]` on the table `quizzes_history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_id` to the `characters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `characters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `character_id` to the `events_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `character_id` to the `quizzes_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `teachers_courses` table without a default value. This is not possible if the table is not empty.

*/

-- PASO 1: Agregar columnas temporales y nuevas columnas permitiendo NULL
ALTER TABLE "public"."characters" 
ADD COLUMN "temp_character_id" TEXT,
ADD COLUMN "appearance" JSONB,
ADD COLUMN "group_id" TEXT,
ADD COLUMN "health" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN "user_id" TEXT;

-- Copiar character_id a temp
UPDATE "public"."characters" SET "temp_character_id" = "character_id";

-- PASO 2: Migrar datos de members a characters
-- Actualizar group_id desde members
UPDATE "public"."characters" c
SET "group_id" = m."group_id"
FROM "public"."members" m
WHERE c."temp_character_id" = m.id;

-- PASO 3: Obtener user_id desde inscriptions
-- Necesitamos relacionar member → group → course → inscription → user
UPDATE "public"."characters" c
SET "user_id" = COALESCE(
  (SELECT i."user_id"
   FROM "public"."members" m
   JOIN "public"."groups" g ON g.id = m."group_id"
   JOIN "public"."inscriptions" i ON i."course_id" = g."course_id"
   WHERE m.id = c."temp_character_id"
   LIMIT 1),
  '00000000-0000-0000-0000-000000000000' -- Fallback UUID (será eliminado después)
);

-- PASO 4: Agregar columnas temporales a las tablas relacionadas
ALTER TABLE "public"."quizzes_history" ADD COLUMN "character_id" TEXT;
ALTER TABLE "public"."events_history" ADD COLUMN "character_id" TEXT;

-- Migrar member_id a character_id en quizzes_history
UPDATE "public"."quizzes_history" qh
SET "character_id" = c.id
FROM "public"."characters" c
WHERE c."temp_character_id" = qh."member_id";

-- Migrar member_id a character_id en events_history
UPDATE "public"."events_history" eh
SET "character_id" = c.id
FROM "public"."characters" c
WHERE c."temp_character_id" = eh."member_id";

-- PASO 5: Actualizar teachers_courses con timestamps
ALTER TABLE "public"."teachers_courses" 
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- PASO 6: Crear registros en teachers_courses desde courses.teacher_id
INSERT INTO "public"."teachers_courses" ("id", "teacher_id", "course_id", "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  c."teacher_id",
  c.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "public"."courses" c
WHERE c."teacher_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- PASO 7: Drop old constraints y foreign keys
ALTER TABLE "public"."_membersTotasks" DROP CONSTRAINT IF EXISTS "_membersTotasks_A_fkey";
ALTER TABLE "public"."_membersTotasks" DROP CONSTRAINT IF EXISTS "_membersTotasks_B_fkey";
ALTER TABLE "public"."characters" DROP CONSTRAINT IF EXISTS "characters_character_id_fkey";
ALTER TABLE "public"."courses" DROP CONSTRAINT IF EXISTS "courses_teacher_id_fkey";
ALTER TABLE "public"."events_history" DROP CONSTRAINT IF EXISTS "events_history_member_id_fkey";
ALTER TABLE "public"."members" DROP CONSTRAINT IF EXISTS "members_group_id_fkey";
ALTER TABLE "public"."quizzes_history" DROP CONSTRAINT IF EXISTS "quizzes_history_member_id_fkey";
ALTER TABLE "public"."teachers_courses_tasks" DROP CONSTRAINT IF EXISTS "teachers_courses_tasks_teacher_course_id_fkey";

-- PASO 8: Drop old indexes
DROP INDEX IF EXISTS "public"."characters_character_id_key";
DROP INDEX IF EXISTS "public"."quizzes_history_quiz_id_member_id_key";

-- PASO 9: Hacer NOT NULL las nuevas columnas (después de migrar datos)
ALTER TABLE "public"."characters" ALTER COLUMN "group_id" SET NOT NULL;
ALTER TABLE "public"."characters" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "public"."quizzes_history" ALTER COLUMN "character_id" SET NOT NULL;
ALTER TABLE "public"."events_history" ALTER COLUMN "character_id" SET NOT NULL;

-- PASO 10: Drop old columns
ALTER TABLE "public"."characters" DROP COLUMN "character_id";
ALTER TABLE "public"."characters" DROP COLUMN "temp_character_id";
ALTER TABLE "public"."courses" DROP COLUMN "teacher_id";
ALTER TABLE "public"."events_history" DROP COLUMN "member_id";
ALTER TABLE "public"."quizzes_history" DROP COLUMN "member_id";

-- PASO 11: Agregar soft delete a inscriptions
ALTER TABLE "public"."inscriptions" 
ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- PASO 12: Drop old tables
DROP TABLE IF EXISTS "public"."_membersTotasks";
DROP TABLE IF EXISTS "public"."members";

-- PASO 13: Create new indexes and constraints
CREATE UNIQUE INDEX "characters_user_id_group_id_key" ON "public"."characters"("user_id", "group_id");
CREATE UNIQUE INDEX "quizzes_history_quiz_id_character_id_key" ON "public"."quizzes_history"("quiz_id", "character_id");

-- PASO 14: Add new foreign keys
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."quizzes_history" ADD CONSTRAINT "quizzes_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."teachers_courses_tasks" ADD CONSTRAINT "teachers_courses_tasks_teacher_course_id_fkey" FOREIGN KEY ("teacher_course_id") REFERENCES "public"."teachers_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."events_history" ADD CONSTRAINT "events_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PASO 15: Limpiar datos huérfanos (characters sin user_id válido)
DELETE FROM "public"."characters" WHERE "user_id" = '00000000-0000-0000-0000-000000000000';

