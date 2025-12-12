import BerandaCTA from "./_components/BerandaCTA";
import BerandaHero from "./_components/BerandaHero";
import BerandaKategory from "./_components/BerandaKategory";
import BerandaKeuntungan from "./_components/BerandaKeuntungan";
import BerandaPopulerVanue from "./_components/BerandaPopulerVanue";
import BerandaVanueUs from "./_components/BerandaVanueUs";

export const Main = () => {
  return (
    <div>
      <BerandaHero />
      <BerandaKeuntungan />
      <BerandaKategory />
      <BerandaPopulerVanue />
      <BerandaVanueUs />
      <BerandaCTA />
    </div>
  );
};

export default Main;
