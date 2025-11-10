-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "internal_id" TEXT,
    "institution_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "teacher_id" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers_courses" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "teachers_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "character_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters_abilities" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "ability_id" TEXT NOT NULL,

    CONSTRAINT "characters_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "correct_answer_index" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit" INTEGER NOT NULL DEFAULT 30,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes_history" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "is_on_quest" BOOLEAN NOT NULL DEFAULT false,
    "selected_answer" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "time_taken" INTEGER NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters_tasks" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "characters_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers_courses_tasks" (
    "id" TEXT NOT NULL,
    "teacher_course_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "teachers_courses_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'neutral',
    "rank" TEXT NOT NULL DEFAULT 'D',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_history" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accesories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "probability_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accesories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_membersTotasks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_membersTotasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_courses_teacher_id_course_id_key" ON "teachers_courses"("teacher_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_user_id_course_id_key" ON "inscriptions"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_character_id_key" ON "characters"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_abilities_character_id_ability_id_key" ON "characters_abilities"("character_id", "ability_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_history_quiz_id_member_id_key" ON "quizzes_history"("quiz_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_tasks_character_id_task_id_key" ON "characters_tasks"("character_id", "task_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_courses_tasks_teacher_course_id_task_id_key" ON "teachers_courses_tasks"("teacher_course_id", "task_id");

-- CreateIndex
CREATE INDEX "_membersTotasks_B_index" ON "_membersTotasks"("B");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_courses" ADD CONSTRAINT "teachers_courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_courses" ADD CONSTRAINT "teachers_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters_abilities" ADD CONSTRAINT "characters_abilities_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters_abilities" ADD CONSTRAINT "characters_abilities_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_history" ADD CONSTRAINT "quizzes_history_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_history" ADD CONSTRAINT "quizzes_history_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters_tasks" ADD CONSTRAINT "characters_tasks_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters_tasks" ADD CONSTRAINT "characters_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_courses_tasks" ADD CONSTRAINT "teachers_courses_tasks_teacher_course_id_fkey" FOREIGN KEY ("teacher_course_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_courses_tasks" ADD CONSTRAINT "teachers_courses_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_history" ADD CONSTRAINT "events_history_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_history" ADD CONSTRAINT "events_history_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_membersTotasks" ADD CONSTRAINT "_membersTotasks_A_fkey" FOREIGN KEY ("A") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_membersTotasks" ADD CONSTRAINT "_membersTotasks_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
