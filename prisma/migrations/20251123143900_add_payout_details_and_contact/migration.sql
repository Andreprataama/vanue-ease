/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_contact_number_key" ON "user"("contact_number");
