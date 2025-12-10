"use client";
import React, { useState } from "react";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatRupiah } from "@/utils/currency"; // Pastikan utilitas ini ada

interface VenueBookingFormProps {
  hargaPerUnit: number | null;
  tipeSewa: "perjam" | "perhari" | null;
  kapasitasMaks: number;
  durasi?: number;
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const VenueBookingForm: React.FC<VenueBookingFormProps> = ({
  hargaPerUnit,
  tipeSewa,
  kapasitasMaks,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<string>("08:00");
  const [guests, setGuests] = useState<number>(1);

  if (hargaPerUnit === null || !tipeSewa) {
    return (
      <div className="w-full shadow-md rounded-2xl p-6 border bg-white text-center">
        <p className="text-md text-red-500 font-semibold">
          Informasi harga tidak lengkap.
        </p>
      </div>
    );
  }

  const formattedHarga = formatRupiah({ price: hargaPerUnit });
  const unitText = tipeSewa === "perjam" ? "/ Jam" : "/ Hari";

  return (
    <div className="w-full flex flex-col gap-6 shadow-md rounded-2xl p-6 border bg-white">
      {/* 1. HARGA MULAI */}
      <div className="border-b pb-4">
        <Label className="text-md text-muted-foreground">Harga Mulai</Label>
        {/* PERBAIKAN DILAKUKAN DI SINI: mt-20 diubah menjadi mt-2 */}
        <div className="mt-2 flex items-baseline">
          <span className="text-4xl font-bold text-foreground">
            {formattedHarga}
          </span>
          <span className="text-2xl font-bold ml-2 text-muted-foreground">
            {unitText}
          </span>
        </div>
      </div>

      {/* 2. PILIH TANGGAL ACARA (Menggantikan DatePicker) */}
      <div className="w-full space-y-2">
        <Label htmlFor="date" className="px-1">
          Pilih Tanggal Acara
        </Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-full justify-between font-normal"
            >
              {date ? date.toLocaleDateString("id-ID") : "DD / MM / YYYY"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                setIsCalendarOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* 3. DURASI SEWA DAN JAM MULAI */}
      <div className="flex flex-row jutify-between gap-4 w-full">
        {tipeSewa === "perjam" && (
          <div className="space-y-2">
            <Label htmlFor="durasi-sewa">Durasi Sewa</Label>
            <Select
              value={String(duration)}
              onValueChange={(value) => setDuration(Number(value))}
            >
              <SelectTrigger id="durasi-sewa">
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((hr) => (
                  <SelectItem key={hr} value={String(hr)}>
                    {hr} Jam
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Jam Mulai */}
        <div className="space-y-2">
          <Label htmlFor="jam-mulai">Jam Mulai</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger id="jam-mulai">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. JUMLAH TAMU */}
      <div className="space-y-2">
        <Label htmlFor="jumlah-tamu">Jumlah Tamu</Label>
        <div className="relative">
          <Input
            id="jumlah-tamu"
            type="number"
            placeholder={`Max ${kapasitasMaks} Orang`}
            max={kapasitasMaks}
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="pl-4 pr-10"
          />
          <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Kapasitas maksimum venue: {kapasitasMaks} orang.
        </p>
      </div>

      {/* 6. TOMBOL BOOKING */}
      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2">
        Lanjutkan Pemesanan
      </Button>
    </div>
  );
};

export default VenueBookingForm;
