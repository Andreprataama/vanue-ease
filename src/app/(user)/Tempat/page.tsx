import BerandaCTA from "../Beranda/_components/BerandaCTA";
import BerandaPopulerVanue from "../Beranda/_components/BerandaPopulerVanue";
import TempatFilterSection from "./_components/TempatFilterSection";
import TempatHeroSection from "./_components/TempatHeroSection";

const page = () => {
  return (
    <>
      <TempatHeroSection />
      <TempatFilterSection />
      <BerandaPopulerVanue />
      <BerandaCTA />
    </>
  );
};

export default page;
