import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    // 1. Ambil data dari body request
    const data = await request.json();
    const { firstName, lastName, phone, email, message, agreedToPrivacy } =
      data;

    // 2. Lakukan validasi dasar (opsional, tapi disarankan)
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { message: "Nama depan, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "andreprataama07@gmail.com",
      subject: `Pesan Baru dari Formulir Kontak: ${firstName} ${lastName}`,
      html: `
        <h2>Anda menerima pesan baru dari ${firstName} ${lastName}</h2>
        <p><strong>Nama Lengkap:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telepon:</strong> ${phone}</p>
        <p><strong>Persetujuan Kebijakan Privasi:</strong> ${
          agreedToPrivacy ? "Ya" : "Tidak"
        }</p>
        <h3>Pesan:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // 4. Kirim email
    await transporter.sendMail(mailOptions);

    // 5. Berikan respons sukses
    return NextResponse.json(
      { message: "Pesan berhasil dikirim!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return NextResponse.json(
      {
        message: "Gagal mengirim pesan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
