-- Manual migration: Remove group_id from quizzes
-- This migration removes the group_id foreign key and column from quizzes table
-- All quizzes will now be associated only with courses, not groups

BEGIN;

-- Step 1: Drop the foreign key constraint
ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "quizzes_group_id_fkey";

-- Step 2: Drop the group_id column
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "group_id";

COMMIT;
