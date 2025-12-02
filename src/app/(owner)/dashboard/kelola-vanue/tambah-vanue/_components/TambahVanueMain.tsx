"use client";

import React, { useState, useCallback } from "react";
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

const PhotoBox = ({
  index,
  label,
  isMain = false,
  galleryPreviews,
  handleFileChange,
  handleDelete,
}) => {
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
  const [galleryPreviews, setGalleryPreviews] = useState(Array(5).fill(null));
  const [selectedFacilities, setSelectedFacilities] = useState([]); // State untuk fasilitas

  const handleFileChange = useCallback(
    (event, index) => {
      const file = event.target.files[0];
      const newPreviews = [...galleryPreviews];

      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Hanya file gambar yang diizinkan!");
          event.target.value = null;
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

  const handleDelete = useCallback((index) => {
    setGalleryPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews[index] = null;
      return newPreviews;
    });
  }, []);

  const handleFacilityChange = useCallback((facility) => {
    setSelectedFacilities((prevFacilities) => {
      if (prevFacilities.includes(facility)) {
        return prevFacilities.filter((f) => f !== facility);
      } else {
        return [...prevFacilities, facility];
      }
    });
  }, []);

  return (
    <section className="container mx-auto py-8 lg:py-5 p-5 ">
      <Card className="w-full p-6 lg:p-8 border rounded-lg shadow-lg bg-white ">
        <form className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
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
              </div>

              <div className="space-y-3 pt-4">
                <div>
                  <Label className="text-xl font-semibold">
                    Deskripsi Vanue
                  </Label>
                  <p className="text-xs text-gray-500">
                    Masukkan Deskripsi Tempat Anda
                  </p>
                </div>
                <Label>Nama</Label>
                <Input placeholder="Nama Vanue" />
                <Label>Deskrpsi</Label>
                <Textarea placeholder="Deskrpsi Vanue" />
                <Label>Alamat Google Maps</Label>
                <Input placeholder="Masukan Link Google Maps" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="">
                  <Label className="text-xl font-semibold">
                    Harga dan Kapasitas
                  </Label>
                  <p className="text-xs text-gray-500">
                    Masukkan Kapasitas, Kategori, dan Harga
                  </p>
                </div>
                <Label>Kapasitas Maksimum</Label>
                <Input placeholder="Jumlah" type="Number" />

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori Tempat Anda</Label>
                  <Select name="category" defaultValue="resepsi">
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Pilih kategori fungsi utama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resepsi">
                        Ruang Pesta & Resepsi
                      </SelectItem>
                      <SelectItem value="olahraga">
                        Fasilitas Olahraga
                      </SelectItem>
                      <SelectItem value="pameran">Event & Pameran</SelectItem>
                      <SelectItem value="rapat">Ruang Rapat & Kerja</SelectItem>
                      <SelectItem value="outdoor">
                        Area Outdoor/Rooftop
                      </SelectItem>
                      <SelectItem value="studio">Studio & Kreatif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex ">
                    <Input
                      id="harga"
                      type="number"
                      placeholder="Masukan Harga"
                      className="bg-white border-gray-300 flex-1"
                    />
                    <Select name="unitWaktu" defaultValue="perhari">
                      <SelectTrigger
                        id="unitWaktu"
                        className="w-[130px] bg-white border-gray-300"
                      >
                        <SelectValue placeholder="Per Hari" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perhari">Per Hari</SelectItem>
                        <SelectItem value="perjam">Per Jam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div>
                  <Label className="text-xl font-semibold">Fasilitas</Label>
                  <p className="text-xs text-gray-500">
                    Pilih fasilitas yang tersedia di tempat Anda
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {FACILITIES_OPTIONS.map((facility) => (
                    <div
                      key={facility}
                      className="flex items-center space-x-10"
                    >
                      <Checkbox
                        id={facility}
                        checked={selectedFacilities.includes(facility)}
                        onCheckedChange={() => handleFacilityChange(facility)}
                      />
                      <label
                        htmlFor={facility}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {facility}
                      </label>
                    </div>
                  ))}
                </div>
                <div></div>
                <div className="flex justify-end pt-4 border-t mt-8">
                  <Button
                    type="submit"
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition duration-150"
                  >
                    Simpan Vanue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default TambahVanueMain;
