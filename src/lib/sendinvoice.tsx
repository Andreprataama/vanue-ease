import prisma from "@/utils/prisma";
import { jsPDF } from "jspdf";
import nodemailer from "nodemailer";

const PADDING_X = 20;
const PAGE_WIDTH = 210;
const BIAYA_LAYANAN = 10000;

const formatRupiah = (number: number) => `Rp ${number.toLocaleString("id-ID")}`;

// Konfigurasi Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  // Port harus di-parse ke number
  port: parseInt(process.env.SMTP_PORT || "587"),
  // Atur secure: true jika port 465, false jika 587
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function generateAndSendInvoice(
  orderId: string
): Promise<boolean> {
  try {
    // 2. Ambil Data Booking dari Database
    const booking = await prisma.booking.findUnique({
      where: { kode_unik: orderId },
      select: {
        kode_unik: true,
        total_harga: true,
        status_booking: true,
        nama_pemesan: true,
        email_pemesan: true,
        telepon_pemesan: true,
        tanggal_mulai: true,
        tanggal_akhir: true,
        jam_mulai: true,
        jam_akhir: true,
        venue: {
          select: {
            nama_ruangan: true,
            tipe_sewa: true,
            alamat_venue: true,
            harga_per_jam: true,
            harga_per_hari: true,
          },
        },
      },
    });

    if (!booking || !booking.email_pemesan) {
      console.warn(
        `[Invoice] Booking ${orderId} tidak ditemukan atau tanpa email.`
      );
      return false;
    }

    // Hitung harga final
    const hargaSewa =
      booking.venue.tipe_sewa === "per_jam"
        ? Number(booking.venue.harga_per_jam)
        : Number(booking.venue.harga_per_hari);
    const totalPaymentFinal = hargaSewa + BIAYA_LAYANAN;
    const totalPaymentFormatted = formatRupiah(totalPaymentFinal);

    // 3. Buat Dokumen PDF (jsPDF Logic)
    const doc = new jsPDF();
    let yPos = 0;

    // ========== HEADER VENUE EASE ==========
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, PAGE_WIDTH, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("VENUE EASE", PADDING_X, 22);

    // Info Invoice di kanan
    yPos = 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", PAGE_WIDTH - PADDING_X, yPos, { align: "right" });

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Kode Booking: ${booking.kode_unik}`,
      PAGE_WIDTH - PADDING_X,
      yPos,
      { align: "right" }
    );

    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // ========== DATA PEMESAN ==========
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Nama Pemesan: ${booking.nama_pemesan || "-"}`, PADDING_X, yPos);
    yPos += 7;
    doc.text(`Email Pemesan: ${booking.email_pemesan}`, PADDING_X, yPos);
    yPos += 7;
    doc.text(`Nomor Pemesan: ${booking.telepon_pemesan}`, PADDING_X, yPos);

    yPos += 15;

    // ========== TABLE HEADER ==========
    doc.setFillColor(240, 240, 240);
    doc.rect(PADDING_X, yPos, PAGE_WIDTH - PADDING_X * 2, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Deskripsi", PADDING_X + 3, yPos + 7);
    doc.text("Tanggal & Waktu", PAGE_WIDTH / 2, yPos + 7);
    doc.text("Harga", PAGE_WIDTH - PADDING_X - 3, yPos + 7, { align: "right" });

    yPos += 10;

    // ========== TABLE CONTENT ==========
    doc.setDrawColor(220, 220, 220);
    doc.line(PADDING_X, yPos, PAGE_WIDTH - PADDING_X, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");

    // Baris 1: Venue
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${booking.venue.nama_ruangan}`, PADDING_X + 3, yPos);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${booking.venue.tipe_sewa}`, PADDING_X + 3, yPos + 5);
    doc.text(`${booking.venue.alamat_venue}`, PADDING_X + 3, yPos + 10);

    // Tanggal & Waktu
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const tanggalFormatted = new Date(booking.tanggal_mulai).toLocaleDateString(
      "id-ID",
      { day: "numeric", month: "numeric", year: "numeric" }
    );

    doc.text(`${tanggalFormatted}`, PAGE_WIDTH / 2, yPos);

    // Harga venue
    doc.text(formatRupiah(hargaSewa), PAGE_WIDTH - PADDING_X - 3, yPos, {
      align: "right",
    });

    yPos += 15;

    // Baris 2: Biaya Layanan
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Biaya Layanan`, PADDING_X + 3, yPos);

    // Harga biaya layanan
    doc.text(formatRupiah(BIAYA_LAYANAN), PAGE_WIDTH - PADDING_X - 3, yPos, {
      align: "right",
    });

    yPos += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(PADDING_X, yPos, PAGE_WIDTH - PADDING_X, yPos);

    yPos += 10;

    // ========== SUBTOTAL / REKAP ==========
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", PAGE_WIDTH - PADDING_X - 60, yPos);
    doc.text(formatRupiah(hargaSewa), PAGE_WIDTH - PADDING_X - 3, yPos, {
      align: "right",
    });

    yPos += 7;

    doc.text("Biaya Layanan:", PAGE_WIDTH - PADDING_X - 60, yPos);
    doc.text(formatRupiah(BIAYA_LAYANAN), PAGE_WIDTH - PADDING_X - 3, yPos, {
      align: "right",
    });

    yPos += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(PAGE_WIDTH - PADDING_X - 65, yPos, PAGE_WIDTH - PADDING_X, yPos);

    yPos += 8;

    // ========== TOTAL PAYMENT ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Payment:", PAGE_WIDTH - PADDING_X - 60, yPos);
    doc.text(totalPaymentFormatted, PAGE_WIDTH - PADDING_X - 3, yPos, {
      align: "right",
    });

    // ... (Logika INFORMASI TAMBAHAN dan FOOTER Anda di sini) ...

    yPos += 70;

    // ========== INFORMASI TAMBAHAN & FOOTER (Disertakan agar kode komplit) ==========
    doc.setDrawColor(200, 200, 200);
    doc.line(PADDING_X, yPos, PAGE_WIDTH - PADDING_X, yPos);
    yPos += 8;

    doc
      .setFontSize(9)
      .setFont("helvetica", "bold")
      .setTextColor(0, 0, 0)
      .text("Catatan Penting:", PADDING_X, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal").setTextColor(80, 80, 80);
    doc.text(
      "• Harap datang 15 menit sebelum waktu booking dimulai",
      PADDING_X + 3,
      yPos
    );
    yPos += 5;
    doc.text(
      "• Tunjukkan invoice ini kepada staff kami di lokasi",
      PADDING_X + 3,
      yPos
    );
    yPos += 5;
    doc.text(
      "• Invoice ini berlaku sebagai bukti pembayaran yang sah",
      PADDING_X + 3,
      yPos
    );

    yPos += 12;

    doc.setDrawColor(200, 200, 200);
    doc.line(PADDING_X, yPos, PAGE_WIDTH - PADDING_X, yPos);
    yPos += 8;

    doc
      .setFontSize(9)
      .setFont("helvetica", "normal")
      .setTextColor(100, 100, 100)
      .text(
        "Terima kasih telah menggunakan layanan Venue Ease!",
        PADDING_X,
        yPos
      );
    yPos += 5;
    doc.setFontSize(8).text(
      `Dicetak pada: ${new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      PADDING_X,
      yPos
    );

    // 4. Konversi PDF ke Buffer untuk Attachment
    const pdfOutput = doc.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfOutput);

    // 5. Kirim Email Nodemailer
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
      to: booking.email_pemesan,
      subject: `[LUNAS] Invoice Pemesanan Venue Ease `,
      text: `Terima kasih! Pembayaran lunas. Total: ${totalPaymentFormatted}. Invoice terlampir.`,
      html: `
        

<p>
  Kami informasikan bahwa pembayaran Anda untuk pemesanan venue di Venue Ease
  telah berhasil diterima dan lunas.
</p>

<div style="margin: 20px 0; padding: 15px; border: 1px solid #eeeeee; border-radius: 6px; background-color: #f9f9f9;">
    <p style="margin: 0; font-size: 14px; color: #555;">
        <strong>Detail Pemesanan:</strong> ${booking.venue.nama_ruangan}
    </p>
    <p style="margin: 5px 0 0; font-size: 14px; color: #555;">
        <strong>Kode Booking:</strong> ${booking.kode_unik}
    </p>
    <p style="margin: 15px 0 0; font-size: 16px; font-weight: bold; color: #000;">
        Total Pembayaran: 
        <span style="color: #1a73e8;">${totalPaymentFormatted}</span>
    </p>
</div>

<p>
  Sebagai bukti pembayaran yang sah, Invoice Resmi Anda telah kami lampirkan
  dalam format PDF pada email ini.
</p>

<p>
  Mohon simpan dokumen ini dengan baik dan tunjukkan kepada staf kami di lokasi
  pada tanggal pemakaian venue. Invoice ini berlaku sebagai bukti pembayaran
  saat Anda tiba di venue.
</p>

<p>
  Terima kasih atas kepercayaan Anda menggunakan layanan Venue Ease. Kami
  berharap acara Anda berjalan lancar.
</p>

<p style="margin-top: 20px;">
  Hormat kami,<br>
  <strong>Tim Venue Ease</strong>
</p>
      `,
      attachments: [
        {
          filename: `invoice-${booking.kode_unik}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(
      `[Invoice] Email ${booking.kode_unik} terkirim: ${info.messageId}`
    );
    return true;
  } catch (error) {
    console.error(
      `[Invoice] Gagal memproses atau mengirim email untuk ${orderId}:`,
      error
    );
    // Mengembalikan false untuk menandakan kegagalan pengiriman (meskipun Midtrans sudah sukses)
    return false;
  }
}
