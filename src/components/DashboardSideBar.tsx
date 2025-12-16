"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  FileText,
  Building,
  MoreHorizontal,
  CircleDollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth-client";

const handleLogout = async () => {
  try {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const sidebarItems = [
  {
    icon: BarChart3,
    label: "Dashboard",
    link: "/dashboard",
    headers: "Dashboard",
  },
  {
    icon: Building,
    label: " Kelola Vanue",
    link: "/dashboard/kelola-vanue",
    headers: "Kelola Vanue",
  },
  {
    icon: Calendar,
    label: "Kalender & Ketersediaan",
    link: "/dashboard/kalender-dan-ketersediaan",
    headers: "Kalender & Ketersediaan",
  },
  {
    icon: FileText,
    label: "Riwayat Pemesanan",
    link: "/dashboard/riwayat-pesanan",
    headers: "Riwayat Pemesanan",
  },
];

function SidebarContent() {
  const pathname = usePathname();
  const { data } = authClient.useSession();

  return (
    <>
      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-yellow-400 uppercase">
            Vanue Ease
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.link;
            return (
              <li key={index}>
                <Link href={item.link}>
                  <div
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                      isActive
                        ? "bg-slate-800 text-yellow-400"
                        : "text-white hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/professional-headshot.png" />
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {data?.user?.name}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {data?.user?.email}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              {" "}
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

export default function page() {
  return (
    <div className="hidden w-64 flex-col bg-black  md:flex">
      <SidebarContent />
    </div>
  );
}
export { SidebarContent, sidebarItems };
