"use client";

import {
  useForm,
  useWatch,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const formSchema = z
  .object({
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z.string().min(1, "Alamat wajib diisi."),
    kapasitas_maks: z.coerce
      .number()
      .min(1, "Kapasitas min. 1.")
      .max(10000, "Kapasitas maksimal 10,000"),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"]),
    harga_per_jam: z.coerce.number().optional().nullable().default(null),
    harga_per_hari: z.coerce.number().optional().nullable().default(null),

    // Field opsional dan relasional
    fasilitas_kustom: z.string().optional().nullable(),
    peraturan_venue: z.string().optional().nullable(),
    selectedFacilities: z.array(z.string()).default([]),
    // Catatan: Gambar biasanya ditangani terpisah atau di luar schema utama
  })
  .superRefine((data, ctx) => {
    // Validasi Bersyarat Harga
    if (
      data.tipe_sewa === "perjam" &&
      (!data.harga_per_jam || data.harga_per_jam <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["harga_per_jam"],
        message: "Harga per Jam wajib diisi dan harus lebih dari 0.",
      });
    }
    if (
      data.tipe_sewa === "perhari" &&
      (!data.harga_per_hari || data.harga_per_hari <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["harga_per_hari"],
        message: "Harga per Hari wajib diisi dan harus lebih dari 0.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

// Alias untuk kebutuhan props/form
type VenueFormData = FormValues;

// --- DEFINISI PROPS KOMPONEN ---
interface VenueFormProps {
  defaultValues?: VenueFormData;
  onSubmit: (data: VenueFormData) => Promise<void>;
  isEditing: boolean;
}

export const VenueForm = ({
  defaultValues,
  onSubmit,
  isEditing,
}: VenueFormProps) => {
  const formResolver = zodResolver(
    formSchema
  ) as unknown as Resolver<FormValues>;

  const form = useForm<FormValues>({
    resolver: formResolver,
    defaultValues: defaultValues
      ? {
          // Memastikan nilai-nilai numerik dan array terisi dengan benar saat edit
          ...defaultValues,
          // Perbaikan konversi/mapping untuk menghindari undefined
          harga_per_jam: defaultValues.harga_per_jam || null,
          harga_per_hari: defaultValues.harga_per_hari || null,
          selectedFacilities: defaultValues.selectedFacilities || [],
          category: defaultValues.category || "",
          fasilitas_kustom: defaultValues.fasilitas_kustom || "",
          peraturan_venue: defaultValues.peraturan_venue || "",
        }
      : undefined,
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const tipeSewa = useWatch({
    control: form.control,
    name: "tipe_sewa",
  }); // Memantau perubahan Tipe Sewa

  // --- RENDER FORM ---
  return (
    <form
      onSubmit={handleSubmit(onSubmit as SubmitHandler<FormValues>)}
      className="space-y-8 p-6 bg-white rounded-lg shadow-xl"
    >
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
        Informasi Utama Venue
      </h2>

      {/* Field Nama Ruangan */}
      <div>
        <Label htmlFor="nama_ruangan">Nama Vanue</Label>
        <Input
          id="nama_ruangan"
          {...register("nama_ruangan")}
          className="mt-2"
        />
        {errors.nama_ruangan && (
          <p className="text-sm text-red-500 mt-1">
            {errors.nama_ruangan.message}
          </p>
        )}
      </div>

      {/* Field Deskripsi Venue */}
      <div>
        <Label htmlFor="deskripsi_venue">Deskripsi</Label>
        <Textarea
          id="deskripsi_venue"
          {...register("deskripsi_venue")}
          rows={4}
          className="mt-2"
        />
        {errors.deskripsi_venue && (
          <p className="text-sm text-red-500 mt-1">
            {errors.deskripsi_venue.message}
          </p>
        )}
      </div>

      {/* Kapasitas dan Alamat (Grid 2 kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Kapasitas */}
        <div>
          <Label htmlFor="kapasitas_maks">Kapasitas Maksimal</Label>
          <Input
            id="kapasitas_maks"
            type="number"
            {...register("kapasitas_maks", { valueAsNumber: true })}
            className="mt-2"
          />
          {errors.kapasitas_maks && (
            <p className="text-sm text-red-500 mt-1">
              {errors.kapasitas_maks.message}
            </p>
          )}
        </div>

        {/* Field Alamat */}
        <div>
          <Label htmlFor="alamat_venue">Alamat Google Maps Link</Label>
          <Input
            id="alamat_venue"
            {...register("alamat_venue")}
            className="mt-2"
          />
          {errors.alamat_venue && (
            <p className="text-sm text-red-500 mt-1">
              {errors.alamat_venue.message}
            </p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold border-b pb-3 pt-4">
        Penetapan Harga & Kategori
      </h2>

      {/* Tipe Sewa dan Kategori (Grid 2 kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Tipe Sewa */}
        <div>
          <Label htmlFor="tipe_sewa">Tipe Sewa</Label>
          <select
            id="tipe_sewa"
            {...register("tipe_sewa")}
            className="mt-2 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="perhari">Per Hari</option>
            <option value="perjam">Per Jam</option>
          </select>
        </div>

        {/* Field Kategori */}
        <div>
          <Label htmlFor="category">Kategori</Label>
          {/* Catatan: Idealnya ini adalah dropdown dinamis yang difetch dari DB */}
          <Input
            id="category"
            {...register("category")}
            placeholder="Cth: Resepsi, Seminar, Olahraga"
            className="mt-2"
          />
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* HARGA (Conditional Input) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Harga per Jam (Tampil jika tipeSewa = perjam) */}
        {(tipeSewa === "perjam" || isEditing) && (
          <div>
            <Label htmlFor="harga_per_jam">Harga per Jam (Rp)</Label>
            <Input
              id="harga_per_jam"
              type="number"
              {...register("harga_per_jam", { valueAsNumber: true })}
              className="mt-2"
              disabled={tipeSewa !== "perjam" && !isEditing}
            />
            {errors.harga_per_jam && (
              <p className="text-sm text-red-500 mt-1">
                {errors.harga_per_jam.message}
              </p>
            )}
          </div>
        )}

        {/* Field Harga per Hari (Tampil jika tipeSewa = perhari) */}
        {(tipeSewa === "perhari" || isEditing) && (
          <div>
            <Label htmlFor="harga_per_hari">Harga per Hari (Rp)</Label>
            <Input
              id="harga_per_hari"
              type="number"
              {...register("harga_per_hari", { valueAsNumber: true })}
              className="mt-2"
              disabled={tipeSewa !== "perhari" && !isEditing}
            />
            {errors.harga_per_hari && (
              <p className="text-sm text-red-500 mt-1">
                {errors.harga_per_hari.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- AREA UNTUK FASILITAS & PERATURAN --- */}

      <h2 className="text-xl font-semibold border-b pb-3 pt-4">
        Fasilitas & Peraturan
      </h2>

      {/* Tempat untuk Checkbox Fasilitas (selectedFacilities) */}
      {/* Catatan: Di sini harus ada logika untuk merender checkbox berdasarkan data facility */}
      <div>
        <Label>Fasilitas yang Tersedia</Label>
        <div className="border p-4 rounded-md mt-2 h-20 bg-gray-50 text-gray-500">
          {/* Placeholder untuk Checkbox Fasilitas (selectedFacilities) */}
          {/* {defaultValues?.selectedFacilities?.join(', ') || 'Logic checkbox fasilitas'} */}
          [...Checkboxes atau Multi-Select Fasilitas...]
        </div>
      </div>

      {/* Field Peraturan Venue */}
      <div>
        <Label htmlFor="peraturan_venue">Peraturan Venue</Label>
        <Textarea
          id="peraturan_venue"
          {...register("peraturan_venue")}
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Field Gambar (Placeholder) */}
      <div className="border-t pt-4">
        <Label>Unggah Gambar</Label>
        <Input type="file" multiple className="mt-2" />
        <p className="text-sm text-gray-500 mt-1">
          Gunakan ini untuk menambah/mengganti gambar.
        </p>
      </div>

      {/* Tombol Submit */}
      <div className="pt-6 border-t mt-8">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Simpan Perubahan"
          ) : (
            "Buat Vanue Baru"
          )}
        </Button>
      </div>
    </form>
  );
};
