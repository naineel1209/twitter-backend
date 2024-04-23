-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Tweet_title_content_idx" ON "Tweet"("title", "content");

-- CreateIndex
CREATE INDEX "User_name_username_idx" ON "User"("name", "username");
