import prisma from "@/utils/prisma";
import { promises as fs } from "fs";
import path from "path";
import puppeteer from "puppeteer"; // 👈 IMPORT INI HARUS ADA
// Pastikan path ke formatRupiah sesuai
import { formatRupiah } from "@/utils/currency";

// --- IMPLEMENTASI NYATA MENGGUNAKAN PUPPETEER ---
async function convertHtmlToPdfBuffer(html: string): Promise<Buffer> {
  // 1. Luncurkan Browser Headless
  // Gunakan args tertentu untuk memastikan kompatibilitas di lingkungan server
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true, // Pastikan headless mode aktif
  });

  const page = await browser.newPage();

  // 2. Muat Konten HTML
  // waitUntil: 'networkidle0' menunggu semua sumber daya dimuat, termasuk CSS/gambar.
  await page.setContent(html, { waitUntil: "networkidle0" });

  // 3. Hasilkan PDF
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true, // Penting agar warna/background CSS ikut terender
    margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
  });

  await browser.close(); // Tutup browser setelah selesai

  return pdf;
}
// ------------------------------------------

// Fungsi utama yang dipanggil dari Webhook
export async function generateInvoicePdf(orderId: string) {
  // 1. Ambil data lengkap pemesanan
  const booking = await prisma.booking.findUnique({
    where: { kode_unik: orderId },
    select: {
      kode_unik: true,
      nama_pemesan: true,
      email_pemesan: true,
      telepon_pemesan: true,
      total_harga: true,
      tanggal_mulai: true,
      jam_mulai: true,
      jumlah_tamu: true,
      venue: {
        select: {
          nama_ruangan: true,
          tipe_sewa: true,
          harga_per_jam: true,
          harga_per_hari: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error(`Booking with ID ${orderId} not found.`);
  }

  // Logika Harga (Sama seperti sebelumnya)
  const serviceFee = 10000;
  const totalAmount = Number(booking.total_harga);
  const pricePerUnit =
    booking.venue.tipe_sewa === "perjam"
      ? Number(booking.venue.harga_per_jam)
      : Number(booking.venue.harga_per - hari);
  let qty = 1;
  const finalPrice = totalAmount - serviceFee;

  // 2. Buat Konten HTML Faktur (Sama seperti sebelumnya)
  const htmlContent = `
    <html>
      <head>
        <title>Faktur #${booking.kode_unik}</title>
        <style>
          /* CSS styling Anda */
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .invoice-box { max-width: 800px; margin: 20px auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
          .items { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .items th, .items td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .items th { background-color: #f2f2f2; }
          .total { font-weight: bold; text-align: right; }
          .status { text-align: center; background-color: #d4edda; color: #155724; padding: 5px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="status">LUNAS</div>
          <h2>FAKTUR PEMBAYARAN</h2>
          <p>No. Pesanan: ${booking.kode_unik}</p>
          <p>Pemesan: ${booking.nama_pemesan}</p>
          <p>Email: ${booking.email_pemesan}</p>
          <p>Jumlah Tamu: ${booking.jumlah_tamu}</p>
          <p>Tanggal Mulai: ${booking.tanggal_mulai.toLocaleDateString(
            "id-ID"
          )}</p>
          
          <table class="items">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th>Kuantitas</th>
                <th>Harga Satuan</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Booking ${booking.venue.nama_ruangan}</td>
                <td>${qty}</td>
                <td>${formatRupiah({ price: pricePerUnit })}</td>
                <td>${formatRupiah({ price: finalPrice })}</td>
              </tr>
              <tr>
                <td>Biaya Layanan</td>
                <td>1</td>
                <td>${formatRupiah({ price: serviceFee })}</td>
                <td>${formatRupiah({ price: serviceFee })}</td>
              </tr>
              <tr>
                <td colspan="3" class="total">TOTAL:</td>
                <td class="total">${formatRupiah({ price: totalAmount })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  // 3. Konversi HTML ke PDF Buffer (Puppeteer)
  const pdfBuffer = await convertHtmlToPdfBuffer(htmlContent);

  // 4. Simpan PDF ke Folder Lokal (Sama seperti sebelumnya)
  const invoicesDir = path.join(process.cwd(), "public", "invoices");
  await fs.mkdir(invoicesDir, { recursive: true });
  const filePath = path.join(invoicesDir, `${booking.kode_unik}.pdf`);
  await fs.writeFile(filePath, pdfBuffer);

  return filePath;
}
