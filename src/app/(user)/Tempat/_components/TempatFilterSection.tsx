"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useSWR, { Fetcher } from "swr";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { Venue, ApiResponse } from "@/type/venua"; //
import Link from "next/link";

const categoryFiltersTab = [
  { id: 1, value: "Ruang Meeting", label: "Ruang Meeting" },
  { id: 2, value: "Gedung & Aula", label: "Gedung & Aula" },
  { id: 3, value: "Pesta & Gathering", label: "Pesta & Gathering" },
  { id: 4, value: "Kafe & Restoran", label: "Kafe & Restoran" },
  { id: 5, value: "Studio & Kreatif", label: "Studio & Kreatif" },
];

const sortOptions = [
  { value: "nama_asc", label: "Nama A-Z" },
  { value: "harga_rendah", label: "Harga Termurah" },
  { value: "harga_tinggi", label: "Harga Termahal" },
  { value: "kapasitas_desc", label: "Kapasitas Terbesar" },
  { value: "terbaru", label: "Terbaru" },
];

const sewaTypeOptions = [
  { value: "perhari", label: "Per Hari" },
  { value: "perjam", label: "Per Jam" },
];

const fetcher: Fetcher<ApiResponse> = (url: string) =>
  fetch(url).then((res) => res.json());

const ITEMS_PER_PAGE = 6;

const TempatFilterSection = () => {
  const { data } = useSWR<ApiResponse>(`/api/public-vanue`, fetcher);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategoryParam = searchParams.get("kategori");
  const initialCategories = useMemo(() => {
    return initialCategoryParam
      ? [decodeURIComponent(initialCategoryParam)]
      : [];
  }, [initialCategoryParam]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nama_asc");
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [selectedSewaTypes, setSelectedSewaTypes] = useState<string[]>([]);

  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [capacityMaxInput, setCapacityMaxInput] = useState("");
  const [localSearchInput, setLocalSearchInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: 0,
    maxPrice: Infinity,
    maxCapacity: Infinity,
    localSearchQuery: "",
  });

  useEffect(() => {
    const categoryParam = searchParams.get("kategori");
    const decodedCategory = categoryParam
      ? decodeURIComponent(categoryParam)
      : null;

    if (decodedCategory && selectedCategories.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategories([decodedCategory]);
      setCurrentPage(1);
    }
  }, [searchParams, selectedCategories.length]);

  const handleCategoryChange = (categoryValue: string, isChecked: boolean) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      if (isChecked) {
        return [...prev, categoryValue];
      } else {
        return prev.filter((c) => c !== categoryValue);
      }
    });
  };

  const handleSewaTypeChange = (sewaType: string, isChecked: boolean) => {
    setCurrentPage(1);
    setSelectedSewaTypes((prev) => {
      if (isChecked) {
        return [...prev, sewaType];
      } else {
        return prev.filter((t) => t !== sewaType);
      }
    });
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setAppliedFilters({
      minPrice: priceMinInput ? parseFloat(priceMinInput) : 0,
      maxPrice: priceMaxInput ? parseFloat(priceMaxInput) : Infinity,
      maxCapacity: capacityMaxInput ? parseFloat(capacityMaxInput) : Infinity,
      localSearchQuery: localSearchInput.trim().toLowerCase(),
    });
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
    setSelectedSewaTypes([]);
    setPriceMinInput("");
    setPriceMaxInput("");
    setCapacityMaxInput("");
    setLocalSearchInput("");
    setAppliedFilters({
      minPrice: 0,
      maxPrice: Infinity,
      maxCapacity: Infinity,
      localSearchQuery: "",
    });
  };
  const handleResetCategories = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
    const currentParams = new URLSearchParams(searchParams.toString());

    currentParams.delete("kategori");

    router.push(`?${currentParams.toString()}#tempat`, { scroll: false });
  };
  const getEffectivePrice = (venue: Venue) => {
    let price = 0;
    if (venue.harga_per_hari) {
      price = parseFloat(venue.harga_per_hari);
    } else if (venue.harga_per_jam) {
      price = parseFloat(venue.harga_per_jam);
    }
    return isNaN(price) ? 0 : price;
  };

  const allProcessedVenues = useMemo<Venue[]>(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];

    let currentList: Venue[] = [...data.data];

    const localQuery = appliedFilters.localSearchQuery;

    if (localQuery) {
      currentList = currentList.filter((venue: Venue) => {
        const name = (venue.nama_ruangan || "").toLowerCase();
        return name.includes(localQuery);
      });
    }

    // FILTER 1: KATEGORI
    if (selectedCategories.length > 0) {
      currentList = currentList.filter((venue: Venue) => {
        return venue.venueCategories.some((catObj) =>
          selectedCategories.includes(catObj.category.nama_kategori)
        );
      });
    }

    // FILTER 2: TIPE SEWA
    if (selectedSewaTypes.length > 0) {
      currentList = currentList.filter((venue: Venue) => {
        return venue.tipe_sewa && selectedSewaTypes.includes(venue.tipe_sewa);
      });
    }

    // FILTER 3 & 4: Harga dan Kapasitas
    currentList = currentList.filter((venue: Venue) => {
      const price = getEffectivePrice(venue);
      const capacity = venue.kapasitas_maks || 0;

      const priceOk =
        price >= appliedFilters.minPrice && price <= appliedFilters.maxPrice;
      const capacityOk = capacity <= appliedFilters.maxCapacity;

      return priceOk && capacityOk;
    });

    const venues = currentList;

    // Logika Sorting
    switch (sortBy) {
      case "harga_rendah":
        venues.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "harga_tinggi":
        venues.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "nama_asc":
        venues.sort((a: Venue, b: Venue) => {
          const nameA = (a.nama_ruangan || "").toUpperCase();
          const nameB = (b.nama_ruangan || "").toUpperCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        break;
      case "kapasitas_desc":
        venues.sort(
          (a: Venue, b: Venue) =>
            (b.kapasitas_maks || 0) - (a.kapasitas_maks || 0)
        );
        break;
      case "terbaru":
        venues.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return venues;
  }, [data, sortBy, selectedCategories, appliedFilters, selectedSewaTypes]);

  const totalItems = allProcessedVenues.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const sortedVenues = allProcessedVenues.slice(startIndex, endIndex);

  return (
    <div id="tempat" className="p-10 space-y-4 ">
      <div className="flex justify-between border-b-2 border-gray-300 pb-4 ">
        <h1 className="font-bold text-2xl">Temukan Vanue sesuai kebutuhanmu</h1>
        <div>
          <Select defaultValue={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan Berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-row w-full bg-white rounded-2xl border overflow-hidden ">
        <div className="w-1/4 p-4 border ">
          <h2 className="text-lg font-bold mb-4">Filter</h2>
          <Accordion
            type="multiple"
            defaultValue={["pencarian", "kategori", "harga", "kapasitas"]}
            className="w-full"
          >
            {/*  Search Bar */}
            <AccordionItem value="pencarian" className="border-b pb-5">
              <AccordionTrigger className="font-medium hover:no-underline">
                Pencarian Nama
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <Input
                  type="text"
                  placeholder="Cari nama venue..."
                  value={localSearchInput}
                  onChange={(e) => setLocalSearchInput(e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Kategori */}
            <AccordionItem value="kategori" className="border-b pb-5">
              <AccordionTrigger className="font-medium hover:no-underline">
                Kategori
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-3">
                {categoryFiltersTab.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${option.value}`}
                      checked={selectedCategories.includes(option.value)}
                      onCheckedChange={(isChecked: boolean) =>
                        handleCategoryChange(option.value, isChecked)
                      }
                    />
                    <label
                      htmlFor={`category-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
                <div className="w-full flex justify-end items-end ">
                  <Button
                    onClick={handleResetCategories}
                    className=" text-sm font-medium leading-none text-end hover:underline "
                  >
                    <span className="text-sm font-medium leading-none text-end w-full  justify-end ">
                      Reset Kategori
                    </span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Harga */}
            <AccordionItem value="harga" className="border-b pb-5">
              <AccordionTrigger className="font-medium hover:no-underline">
                Harga (Rp)
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-3">
                <div className="flex space-x-2 mb-3">
                  <Input
                    type="number"
                    name="hargaMin"
                    placeholder="Harga Min"
                    min="0"
                    className="w-1/2"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                  />
                  <Input
                    type="number"
                    name="hargaMaks"
                    placeholder="Harga Maks"
                    min="0"
                    className="w-1/2"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium">Tipe Sewa</p>
                  {sewaTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`sewa-${option.value}`}
                        checked={selectedSewaTypes.includes(option.value)}
                        onCheckedChange={(isChecked: boolean) =>
                          handleSewaTypeChange(option.value, isChecked)
                        }
                      />
                      <label
                        htmlFor={`sewa-${option.value}`}
                        className="text-sm font-medium"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Kapasitas */}
            <AccordionItem value="kapasitas" className="border-b pb-5">
              <AccordionTrigger className="font-medium hover:no-underline">
                Kapasitas Maksimal
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <Input
                  type="number"
                  name="kapasitasMaks"
                  placeholder="Maks. Orang"
                  min="1"
                  value={capacityMaxInput}
                  onChange={(e) => setCapacityMaxInput(e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 space-y-2">
            <Button className="w-full" onClick={handleApplyFilter}>
              Apply Filter
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="w-3/4 p-4  border">
          <h2 className="text-xl font-semibold mb-4">
            Daftar Tempat Vanue ({totalItems} total)
          </h2>
          <div className=" grid grid-cols-3 gap-10 ">
            {sortedVenues.map((vanue) => (
              <ProductCard key={vanue.id} ruanganData={vanue} />
            ))}
            {sortedVenues.length === 0 && (
              <p className=" col-span-3 text-yellow-400 flex items-center justify-center h-40">
                Tidak ada venue yang cocok dengan kriteria filter.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="jutify-center items-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempatFilterSection;
