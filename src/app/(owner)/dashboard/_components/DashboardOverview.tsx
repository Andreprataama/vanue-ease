import {
  Calendar,
  Building,
  DollarSignIcon,
  TrendingUpIcon,
} from "lucide-react";

interface DashboardOverviewProps {
  TotalVanue: number;
  TotalBooking: number;
  TotalRevanue: number;
  ConversionRate: number;
}

interface MetricDetail {
  title: string;
  icon: React.ElementType;
  key: keyof DashboardOverviewProps;
}

const details: MetricDetail[] = [
  {
    title: "Total Vanue",
    icon: Building,
    key: "TotalVanue",
  },
  {
    title: "Total Booking",
    icon: Calendar,
    key: "TotalBooking",
  },
  {
    title: "Total Revenue",
    icon: DollarSignIcon,
    key: "TotalRevanue",
  },
  {
    title: "Conversion Rate",
    icon: TrendingUpIcon,
    key: "ConversionRate",
  },
];

const DashboardOverview = (props: DashboardOverviewProps) => {
  const formatValue = (
    key: keyof DashboardOverviewProps,
    value: number
  ): string => {
    if (key === "ConversionRate") {
      return `${value.toFixed(2)}%`;
    }
    if (key === "TotalRevanue") {
      // Asumsikan ini mata uang, bisa ditambahkan format Rp. atau sejenisnya
      return `Rp${value.toLocaleString("id-ID")}`;
    }
    return value.toLocaleString("id-ID");
  };

  return (
    <div className="w-full h-50   space-x-4  grid grid-cols-4">
      {details.map((detail, index) => {
        const valueKey = detail.key;

        const value = props[valueKey];

        return (
          <div
            key={index}
            className="bg-white border rounded-2xl p-4 flex flex-col space-y-5 "
          >
            {/* Header */}
            <div className="flex flex-row justify-between">
              <h1 className="uppercase tracking-wider text-gray-500">
                {detail.title}
              </h1>

              <detail.icon size={30} className="text-yellow-400" />
            </div>

            <h1 className="text-3xl font-bold">
              {formatValue(valueKey, value)}
            </h1>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardOverview;
