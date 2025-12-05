"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// Import Prisma dan Venue Dihapus karena tidak digunakan langsung di sini

// =================================================================
// DUPLIKAT LOGIKA DARI TAMBAH VANUE MAIN (disesuaikan untuk EDIT)
// =================================================================

// --- Zod Schema Definition (Harus sinkron dengan API POST/PUT) ---
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

    fasilitas_kustom: z.string().optional().nullable(),
    selectedFacilities: z.array(z.string()).default([]),
    peraturan_venue: z.string().optional().nullable(),
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

type FormValues = z.infer<typeof formSchema>;

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

type ImageItem = {
  imageUrl: string | null;
  newFile: File | null;
  previewUrl: string | null;
};

const PhotoBox = React.memo(
  ({
    index,
    label,
    isMain = false,
    item,
    handleFileChange,
    handleDelete,
  }: {
    index: number;
    label: string;
    isMain?: boolean;
    item: ImageItem;
    handleFileChange: (
      event: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => void;
    handleDelete: (index: number) => void;
  }) => {
    const aspectRatioClass = isMain
      ? "aspect-[3/2] h-64"
      : "aspect-square h-auto";
    const borderColorClass = isMain ? "border-yellow-500" : "border-gray-300";
    const labelClass = isMain
      ? "text-muted-foreground text-sm"
      : "text-xs text-muted-foreground";

    const displayUrl = item.previewUrl;

    // Fallback image source if URL is missing or fails
    const srcToRender =
      displayUrl && displayUrl !== "/assets/default_venue.jpg"
        ? displayUrl
        : "/assets/default_venue.jpg";

    return (
      <div
        className={`w-full border ${borderColorClass} bg-gray-50 flex items-center justify-center relative overflow-hidden ${aspectRatioClass} ${
          displayUrl ? "p-0" : "p-4"
        }`}
      >
        {displayUrl ? (
          <>
            <img
              src={srcToRender}
              alt={label}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/assets/default_venue.jpg";
              }}
            />
            {/* Tombol Hapus: Mengganti gambar (menghapus preview/file/url) */}
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
        {/* Input file yang tersembunyi */}
        <Input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
          onChange={(e) => handleFileChange(e, index)}
          key={item.imageUrl || item.newFile ? "has-file" : "no-file-" + index}
        />
      </div>
    );
  }
);
PhotoBox.displayName = "PhotoBox";

// =================================================================
// KOMPONEN HALAMAN EDIT
// =================================================================

const EditVenuePage = () => {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const numericVenueId = parseInt(venueId, 10);

  const [defaultData, setDefaultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [galleryData, setGalleryData] = useState<ImageItem[]>(
    Array(5).fill({ imageUrl: null, newFile: null, previewUrl: null })
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      return {} as FormValues;
    }, []),
    values: defaultData
      ? {
          nama_ruangan: defaultData.nama_ruangan,
          deskripsi_venue: defaultData.deskripsi_venue,
          alamat_venue: defaultData.alamat_venue,
          kapasitas_maks: defaultData.kapasitas_maks || 1,
          category: defaultData.category || "resepsi",
          tipe_sewa: defaultData.tipe_sewa || "perhari",
          harga_per_jam: defaultData.harga_per_jam ?? null,
          harga_per_hari: defaultData.harga_per_hari ?? null,
          fasilitas_kustom: defaultData.fasilitas_kustom || "",
          peraturan_venue: defaultData.peraturan_venue || "",
          selectedFacilities: defaultData.selectedFacilities || [],
        }
      : undefined,
  });

  const watchTipeSewa = form.watch("tipe_sewa", "perhari");

  // --- 1. FETCHING DATA DEFAULT ---
  useEffect(() => {
    if (!venueId || isNaN(numericVenueId)) {
      setError("ID Venue tidak valid.");
      setIsLoading(false);
      return;
    }

    const fetchVenueData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/vanue/${venueId}`);

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil data venue detail atau tidak memiliki izin."
          );
        }

        const result = await response.json();
        const fetchedData = result.data;

        // --- Inisialisasi State Gallery ---
        const initialGallery: ImageItem[] = Array(5).fill({
          imageUrl: null,
          newFile: null,
          previewUrl: null,
        });

        fetchedData.images.forEach(
          (img: { image_url: string; sort_order?: number }) => {
            const index =
              img.sort_order ??
              (img.is_primary
                ? 0
                : initialGallery.findIndex((item) => !item.imageUrl));
            if (index >= 0 && index < 5) {
              initialGallery[index] = {
                imageUrl: img.image_url,
                newFile: null,
                previewUrl: img.image_url,
              };
            }
          }
        );

        setGalleryData(initialGallery);
        setDefaultData(fetchedData);
      } catch (err) {
        console.error("Fetch detail error:", err);
        setError("Data venue tidak dapat dimuat atau tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueData();
  }, [venueId, numericVenueId]);

  // --- 2. IMAGE HANDLERS ---
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = event.target.files?.[0];
      const newGalleryData = [...galleryData];

      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Hanya file gambar yang diizinkan!");
          event.target.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          newGalleryData[index] = {
            imageUrl: newGalleryData[index].imageUrl,
            newFile: file,
            previewUrl: reader.result as string,
          };
          setGalleryData(newGalleryData);
        };
        reader.readAsDataURL(file);
      }
    },
    [galleryData]
  );

  const handleDelete = useCallback((index: number) => {
    setGalleryData((prevData) => {
      const newPreviews = [...prevData];
      newPreviews[index] = { imageUrl: null, newFile: null, previewUrl: null };
      return newPreviews;
    });
  }, []);

  // --- 3. SUBMIT HANDLER (Menggunakan FormData) ---
  const handleUpdate = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // 1. Buat FormData
      const formData = new FormData();

      // 2. Tambahkan semua field teks/angka/select ke FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key === "selectedFacilities" && Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        } else {
          formData.append(key, "null");
        }
      });

      // 3. Tambahkan File/URL Gambar ke FormData
      galleryData.forEach((item, index) => {
        const key = `image_${index}`;

        if (item.newFile) {
          // KASUS 1: Ada file baru (kirim File object)
          formData.append(key, item.newFile, item.newFile.name);
        } else if (item.imageUrl) {
          // KASUS 2: Gambar lama dipertahankan (kirim URL string)
          formData.append(key, item.imageUrl);
        }
      });

      // 4. Panggil API PUT dengan FormData
      const response = await fetch(`/api/vanue/${venueId}`, {
        method: "PUT",
        // PENTING: JANGAN tambahkan headers: { "Content-Type": ... }
        body: formData,
      });

      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = `Gagal menyimpan perubahan. Status: ${response.status}.`;
        if (responseText.length > 0) {
          try {
            const errorBody = JSON.parse(responseText);
            errorMessage = errorBody.message || errorMessage;
          } catch (e) {
            errorMessage = `Server Error: ${responseText.substring(0, 100)}...`;
          }
        }
        throw new Error(errorMessage);
      }

      toast.success(`Venue '${values.nama_ruangan}' berhasil diperbarui!`);
      router.push("/dashboard/kelola-vanue");
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(`Terjadi kesalahan saat menyimpan data: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING KONDISIONAL ---
  if (isLoading || !defaultData) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="mt-2 text-gray-600">Memuat data venue...</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <section className="container mx-auto py-8 lg:py-5 p-5 ">
      <h1 className="text-3xl font-bold mb-6">
        Ubah Detail Vanue: {defaultData.nama_ruangan}
      </h1>
      <Card className="w-full p-6 lg:p-8 border rounded-lg shadow-lg bg-white ">
        <Form {...form}>
          {/* Action form diarahkan ke handleUpdate */}
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* --- Galeri Foto Vanue --- */}
                <div className="space-y-4">
                  <div className="">
                    <Label className="text-xl font-semibold">
                      Galeri Foto Vanue
                    </Label>
                    <p className="text-xs text-gray-500">
                      Masukkan Foto terbaik Tempat Anda.
                    </p>
                  </div>

                  {/* Photo Boxes */}
                  <PhotoBox
                    index={0}
                    label={GALLERY_LABELS[0]}
                    isMain={true}
                    item={galleryData[0]}
                    handleFileChange={handleFileChange}
                    handleDelete={handleDelete}
                  />

                  <div className="grid grid-cols-4 gap-2">
                    {GALLERY_LABELS.slice(1).map((label, index) => (
                      <PhotoBox
                        key={index + 1}
                        index={index + 1}
                        label={label}
                        item={galleryData[index + 1]}
                        handleFileChange={handleFileChange}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </div>
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Simpan Perubahan"
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

export default EditVenuePage;
