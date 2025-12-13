import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/utils/prisma";
import { nextCookies } from "better-auth/next-js";
import nodemailer from "nodemailer";

// Menggunakan async function untuk transporter agar lebih bersih
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    // Logika secure lebih baik disesuaikan dengan nilai port
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    sendResetPassword: async ({ user, url }) => {
      void transporter
        .sendMail({
          from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
          to: user.email,
          subject: `Reset Password Anda`,
          html: `<p>Klik tautan ini untuk mereset kata sandi Anda: <a href="${url}">${url}</a></p>`,
        })
        .catch((error) => {
          console.error("Gagal mengirim email reset password:", error);
        });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  session: {
    disableSessionRefresh: true,
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: ["http://localhost:3001"],
  plugins: [nextCookies()],
});
