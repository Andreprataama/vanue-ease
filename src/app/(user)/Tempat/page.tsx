import BerandaCTA from "../Beranda/_components/BerandaCTA";
import BerandaPopulerVanue from "../Beranda/_components/BerandaPopulerVanue";
import TempatFilterSection from "./_components/TempatFilterSection";
import TempatHeroSection from "./_components/TempatHeroSection";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const page = () => {
  return (
    <>
      <TempatHeroSection />
      <Suspense fallback={<div className="min-h-screen">Loading...</div>}>
        <TempatFilterSection />
      </Suspense>
      <BerandaPopulerVanue />
      <BerandaCTA />
    </>
  );
};

export default page;
