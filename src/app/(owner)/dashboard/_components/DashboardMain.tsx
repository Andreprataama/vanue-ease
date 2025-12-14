"use client";

import useSWR from "swr";
import DashboardOverview from "./DashboardOverview";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DashboardMain = () => {
  const { data, error } = useSWR("/api/vanue", fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Gagal memuat data vanue.</div>;
  }

  const venues = data.data;
  console.log(venues);

  return (
    <div>
      <DashboardOverview
        TotalVanue={venues.length}
        TotalBooking={venues[0].bookings.length}
        TotalRevanue={0}
        ConversionRate={0}
      />
    </div>
  );
};

export default DashboardMain;
