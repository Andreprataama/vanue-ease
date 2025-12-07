"use client";

import React, { useState, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// --- Zod Schema Definition ---
const formSchema = z
  .object({
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z
      .string()
      .min(1, "Alamat Google Maps wajib diisi.")
      .or(z.string().url("Alamat harus berupa link yang valid.")),

    kapasitas_maks: z.coerce.number().min(1, "Kapasitas minimum adalah 1."),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"], {
      errorMap: () => ({ message: "Tipe sewa wajib dipilih." }),
    }),
    harga_per_jam: z.coerce.number().optional().nullable().default(null),
    harga_per_hari: z.coerce.number().optional().nullable().default(null),

    fasilitas_kustom: z.string().optional(),
    selectedFacilities: z.array(z.string()).default([]),
    peraturan_venue: z.string().optional(),
  })
  .superRefine((data, ctx) => {
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

type VanueFormValues = z.infer<typeof formSchema>;

const GALLERY_LABELS = ["FOTO UTAMA", "FOTO 2", "FOTO 3", "FOTO 4", "FOTO 5"];
const FACILITIES_OPTIONS = [
  "AC",
  "Toilet",
  "Parkir Luas",
  "Wifi",
  "Sound System",
  "Proyektor",
  "Meja & Kursi",
  "Akses Kursi Roda",
];

type GalleryItem = {
  preview: string | null;
  file: File | null;
};

const PhotoBox = ({
  index,
  label,
  isMain = false,
  preview, // Mengambil preview langsung
  handleFileChange,
  handleDelete,
}: {
  index: number;
  label: string;
  isMain?: boolean;
  preview: string | null;
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  handleDelete: (index: number) => void;
}) => {
  const widthClass = isMain ? "w-full" : "w-full";
  const aspectRatioClass = isMain
    ? "aspect-[3/2] h-64"
    : "aspect-square h-auto";
  const borderColorClass = isMain ? "border-yellow-500" : "border-gray-300";
  const labelClass = isMain
    ? "text-muted-foreground text-sm"
    : "text-xs text-muted-foreground";

  return (
    <div
      className={`${widthClass} border ${borderColorClass} bg-gray-50 flex items-center justify-center relative overflow-hidden ${aspectRatioClass} ${
        preview ? "p-0" : "p-4"
      }`}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-contain"
          />

          <Button
            type="button"
            onClick={() => handleDelete(index)}
            className="absolute top-2 right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full z-10 opacity-80"
          >
            X
          </Button>
        </>
      ) : (
        <span className={labelClass} style={{ textAlign: "center" }}>
          {isMain ? "FOTO UTAMA" : label}
        </span>
      )}
      <Input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
        onChange={(e) => handleFileChange(e, index)}
      />
    </div>
  );
};

const TambahVanueMain = () => {
  // --- State diubah untuk menyimpan File object dan preview URL ---
  const [galleryData, setGalleryData] = useState<GalleryItem[]>(
    Array(5).fill({ preview: null, file: null })
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VanueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_ruangan: "",
      deskripsi_venue: "",
      alamat_venue: "",
      kapasitas_maks: 1,
      category: "resepsi",
      tipe_sewa: "perhari",
      harga_per_jam: null,
      harga_per_hari: null,
      fasilitas_kustom: "",
      selectedFacilities: [],
      peraturan_venue: "",
    },
  });

  const watchTipeSewa = form.watch("tipe_sewa", "perhari");

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = event.target.files?.[0];
      const newGalleryData = [...galleryData]; // Gunakan state baru

      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Hanya file gambar yang diizinkan!");
          event.target.value = "";
          newGalleryData[index] = { preview: null, file: null };
          setGalleryData(newGalleryData);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          // Simpan kedua data: preview URL dan File object
          newGalleryData[index] = { preview: reader.result as string, file };
          setGalleryData(newGalleryData);
        };
        reader.readAsDataURL(file);
      } else {
        newGalleryData[index] = { preview: null, file: null };
        setGalleryData(newGalleryData);
      }
    },
    [galleryData]
  );

  // Logika untuk menghapus gambar
  const handleDelete = useCallback((index: number) => {
    setGalleryData((prevData) => {
      const newPreviews = [...prevData];
      // Hapus File dan Preview
      newPreviews[index] = { preview: null, file: null };
      return newPreviews;
    });
  }, []);

  // --- LOGIKA SUBMIT PENTING DENGAN FormData ---
  async function onSubmit(values: VanueFormValues) {
    setIsLoading(true);

    try {
      // 1. Buat FormData
      const formData = new FormData();

      // 2. Tambahkan semua field teks/angka/select ke FormData
      Object.entries(values).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array of strings (misalnya selectedFacilities)
          value.forEach((item) => formData.append(key, item));
        } else if (value !== null && value !== undefined) {
          // Konversi nilai angka/boolean (jika ada) ke string
          formData.append(key, String(value));
        } else {
          // Tambahkan null fields (penting untuk harga_per_jam/hari yang mungkin null)
          formData.append(key, "null");
        }
      });

      // 3. Tambahkan File Gambar ke FormData
      galleryData.forEach((data, index) => {
        if (data.file) {
          // Gunakan kunci unik dan sertakan nama file
          formData.append(`image_${index}`, data.file, data.file.name);
        }
      });

      const response = await fetch("/api/vanue", {
        method: "POST",

        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Venue berhasil ditambahkan!");
        router.push("/dashboard/kelola-vanue");
      } else {
        const errorMessage = result.message || "Gagal menambahkan venue.";
        toast.error(errorMessage);
        if (result.errors?.fieldErrors) {
          console.error("Validation Errors:", result.errors.fieldErrors);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan atau server.");
    } finally {
      setIsLoading(false);
    }
  }
  // --- AKHIR LOGIKA SUBMIT API ---

  return (
    <section className="container mx-auto py-8 lg:py-5 p-5 ">
      <Card className="w-full p-6 lg:p-8 border rounded-lg shadow-lg bg-white ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* --- Galeri Foto Vanue --- */}
                <div className="space-y-4">
                  <div className="">
                    <Label className="text-xl font-semibold">
                      Galeri Foto Vanue
                    </Label>
                    <p className="text-xs text-gray-500">
                      Masukkan Foto terbaik Tempat Anda
                    </p>
                  </div>
                  {/* Panggil PhotoBox dengan data dari state galleryData */}
                  <PhotoBox
                    index={0}
                    label={GALLERY_LABELS[0]}
                    isMain={true}
                    preview={galleryData[0]?.preview}
                    handleFileChange={handleFileChange}
                    handleDelete={handleDelete}
                  />

                  <div className="grid grid-cols-4 gap-2">
                    {GALLERY_LABELS.slice(1).map((label, index) => (
                      <PhotoBox
                        key={index + 1}
                        index={index + 1}
                        label={label}
                        preview={galleryData[index + 1]?.preview}
                        handleFileChange={handleFileChange}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>

                {/* --- Deskripsi Vanue (Bagian ini tetap sama) --- */}
                <div className="space-y-3 pt-4">
                  <div>
                    <Label className="text-xl font-semibold">
                      Deskripsi Vanue
                    </Label>
                    <p className="text-xs text-gray-500">
                      Masukkan Deskripsi Tempat Anda
                    </p>
                  </div>

                  {/* Field Nama Vanue */}
                  <FormField
                    control={form.control}
                    name="nama_ruangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Vanue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Deskripsi */}
                  <FormField
                    control={form.control}
                    name="deskripsi_venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskrpsi</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Deskrpsi Vanue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Alamat Google Maps */}
                  <FormField
                    control={form.control}
                    name="alamat_venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Google Maps</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukan Link Google Maps"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-8">
                {/* --- Harga dan Kapasitas (Bagian ini tetap sama) --- */}
                <div className="space-y-4">
                  <div className="">
                    <Label className="text-xl font-semibold">
                      Harga dan Kapasitas
                    </Label>
                    <p className="text-xs text-gray-500">
                      Masukkan Kapasitas, Kategori, dan Harga
                    </p>
                  </div>

                  {/* Field Kapasitas Maksimum */}
                  <FormField
                    control={form.control}
                    name="kapasitas_maks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas Maksimum</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jumlah"
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? null : value);
                            }}
                            value={field.value ?? ""}
                            min={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Kategori */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="category">
                          Kategori Tempat Anda
                        </FormLabel>
                        <Select
                          name="category"
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger id="category" className="w-full">
                              <SelectValue placeholder="Pilih kategori fungsi utama" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ruang Meeting">
                              Ruang Meeting
                            </SelectItem>
                            <SelectItem value="Gedung & Aula">
                              Gedung & Aula
                            </SelectItem>
                            <SelectItem value="Pesta & Gathering">
                              Pesta & Gathering
                            </SelectItem>
                            <SelectItem value="Kafe & Restoran">
                              Kafe & Restoran
                            </SelectItem>

                            <SelectItem value="Studio & Kreatif">
                              Studio & Kreatif
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Harga */}
                  <div className="flex">
                    {/* Select Tipe Sewa (Per Jam/Per Hari) */}
                    <FormField
                      control={form.control}
                      name="tipe_sewa"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            name="tipe_sewa"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                id="unitWaktu"
                                className="w-[130px] bg-white border-gray-300"
                              >
                                <SelectValue placeholder="Per Hari" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="perhari">Per Hari</SelectItem>
                              <SelectItem value="perjam">Per Jam</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Input Harga (Conditional Rendering) */}
                    <div className="flex-1">
                      {watchTipeSewa === "perjam" ? (
                        <FormField
                          control={form.control}
                          name="harga_per_jam"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  id="harga_per_jam"
                                  type="number"
                                  placeholder="Masukan Harga Per Jam"
                                  className="bg-white border-gray-300 flex-1"
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? null : value);
                                  }}
                                  value={field.value ?? ""}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="harga_per_hari"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  id="harga_per_hari"
                                  type="number"
                                  placeholder="Masukan Harga Per Hari"
                                  className="bg-white border-gray-300 flex-1"
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? null : value);
                                  }}
                                  value={field.value ?? ""}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {/* --- Fasilitas (Checkboxes) --- */}
                  <div className="space-y-2">
                    <Label className="text-xl font-semibold">Fasilitas</Label>
                    <p className="text-xs text-gray-500">
                      Pilih fasilitas yang tersedia di tempat Anda
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="selectedFacilities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-4">
                          {FACILITIES_OPTIONS.map((facility) => (
                            <FormField
                              key={facility}
                              control={form.control}
                              name="selectedFacilities"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={facility}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          facility
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                facility,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== facility
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {facility}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Fasilitas Kustom */}
                  <FormField
                    control={form.control}
                    name="fasilitas_kustom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fasilitas Kustom (opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Dapur mini, Papan tulis..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Field Peraturan Venue */}
                  <FormField
                    control={form.control}
                    name="peraturan_venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peraturan Vanue (opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Dilarang merokok di dalam ruangan..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t mt-8">
                    <Button
                      type="submit"
                      className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition duration-150"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Simpan Vanue"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </section>
  );
};

export default TambahVanueMain;
