import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full h-15 flex justify-between p-10 items-center bg-black">
      <h3 className="text-3xl font-bold text-white tracking-wider ">
        Venue Ease
      </h3>
      <div className="flex gap-2 font-semibold">
        <div className="p-2 rounded-sm">
          <Link className="text-white" href="/">
            Beranda
          </Link>
        </div>
        <div className="p-2 rounded-sm">
          <Link className="text-white" href="/Tempat">
            Tempat
          </Link>
        </div>
        <div className="p-2 rounded-sm">
          <Link className="text-white" href="/Tentang-kami">
            Tentang
          </Link>
        </div>
        <div className="p-2 rounded-sm">
          <Link className="text-white" href="/Kontak-kami">
            Kontak
          </Link>
        </div>
        <div className="p-2 rounded-sm">
          <Link className="text-white" href="/Bantuan">
            Bantuan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
