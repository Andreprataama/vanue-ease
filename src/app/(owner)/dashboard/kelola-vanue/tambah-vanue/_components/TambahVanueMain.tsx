"use client";

import React, { useState, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { toast } from "sonner"; //
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// --- Zod Schema Definition (Harus sama dengan di route.ts) ---
const formSchema = z
  .object({
    // Section 1: Basic Info
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z
      .string()
      .min(1, "Alamat Google Maps wajib diisi.")
      .or(z.string().url("Alamat harus berupa link yang valid.")),

    // Section 2: Capacity & Pricing
    kapasitas_maks: z.coerce.number().min(1, "Kapasitas minimum adalah 1."),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"], {
      errorMap: () => ({ message: "Tipe sewa wajib dipilih." }),
    }),
    harga_per_jam: z.coerce.number().optional().nullable().default(null),
    harga_per_hari: z.coerce.number().optional().nullable().default(null),

    // Section 4: Facilities and Rules
    fasilitas_kustom: z.string().optional(),
    selectedFacilities: z.array(z.string()).default([]),
    peraturan_venue: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Custom refinement untuk validasi harga
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
// --- End Zod Schema Definition ---

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

// Component PhotoBox (Tidak berubah, hanya untuk UI)
const PhotoBox = ({
  index,
  label,
  isMain = false,
  galleryPreviews,
  handleFileChange,
  handleDelete,
}: any) => {
  const preview = galleryPreviews[index];

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
  const [galleryPreviews, setGalleryPreviews] = useState<any[]>(
    Array(5).fill(null)
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
      const newPreviews = [...galleryPreviews];

      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Hanya file gambar yang diizinkan!");
          event.target.value = "";
          newPreviews[index] = null;
          setGalleryPreviews(newPreviews);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews[index] = reader.result;
          setGalleryPreviews(newPreviews);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews[index] = null;
        setGalleryPreviews(newPreviews);
      }
    },
    [galleryPreviews]
  );

  const handleDelete = useCallback((index: number) => {
    setGalleryPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews[index] = null;
      return newPreviews;
    });
  }, []);

  // --- LOGIKA SUBMIT MENGGUNAKAN FETCH KE API ENDPOINT BARU ---
  async function onSubmit(values: VanueFormValues) {
    setIsLoading(true);

    try {
      // Panggil endpoint API Route Handler
      const response = await fetch("/api/vanue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Venue berhasil ditambahkan!");
        router.push("/dashboard/kelola-vanue");
      } else {
        // Tangani error dari API
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
                  <PhotoBox
                    index={0}
                    label={GALLERY_LABELS[0]}
                    isMain={true}
                    galleryPreviews={galleryPreviews}
                    handleFileChange={handleFileChange}
                    handleDelete={handleDelete}
                  />

                  <div className="grid grid-cols-4 gap-2">
                    {GALLERY_LABELS.slice(1).map((label, index) => (
                      <PhotoBox
                        key={index + 1}
                        index={index + 1}
                        label={label}
                        galleryPreviews={galleryPreviews}
                        handleFileChange={handleFileChange}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </div>
                  {/* Anda perlu menyesuaikan kode untuk mengunggah file yang sebenarnya */}
                </div>

                {/* --- Deskripsi Vanue --- */}
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
                {/* --- Harga dan Kapasitas --- */}
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
                            <SelectItem value="resepsi">
                              Ruang Pesta & Resepsi
                            </SelectItem>
                            <SelectItem value="olahraga">
                              Fasilitas Olahraga
                            </SelectItem>
                            <SelectItem value="pameran">
                              Event & Pameran
                            </SelectItem>
                            <SelectItem value="rapat">
                              Ruang Rapat & Kerja
                            </SelectItem>
                            <SelectItem value="outdoor">
                              Area Outdoor/Rooftop
                            </SelectItem>
                            <SelectItem value="studio">
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

                    {/* Input Harga */}
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
                  <div>
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
