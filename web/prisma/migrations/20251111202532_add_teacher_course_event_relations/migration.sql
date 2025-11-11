/*
  Warnings:

  - Added the required column `course_id` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "characters_tasks" ADD COLUMN     "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "teacher_id" TEXT;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "course_id" TEXT NOT NULL,
ADD COLUMN     "teacher_id" TEXT;

-- AlterTable
ALTER TABLE "teachers_courses" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
