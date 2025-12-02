"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarContent, sidebarItems } from "./DashboardSideBar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Komponen Breadcrumb
const BreadcrumbHeader = ({ pathname }) => {
  const pathSegments = pathname.split("/").filter(Boolean);

  let currentPath = "";
  const breadcrumbs = [];

  const itemMap = new Map(
    sidebarItems.map((item) => [item.link, item.headers])
  );

  pathSegments.forEach((segment, index) => {
    currentPath += "/" + segment;

    const isSidebarLink = itemMap.has(currentPath);
    let label = isSidebarLink ? itemMap.get(currentPath) : null;

    if (!label) {
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    breadcrumbs.push({
      href: currentPath,
      label: label,
      isLast: index === pathSegments.length - 1,
    });
  });

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({
      href: "/dashboard",
      label: "Dashboard",
      isLast: true,
    });
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {crumb.isLast ? (
            // Item terakhir (aktif)
            <span className="font-semibold text-gray-800 dark:text-white">
              {crumb.label}
            </span>
          ) : (
            // Item yang bisa di-klik
            <Link href={crumb.href}>
              <span className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                {crumb.label}
              </span>
            </Link>
          )}
          {!crumb.isLast && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
};

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-slate-900 p-0 text-white">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}

const DashboardHeader = () => {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white dark:bg-slate-900 h-[81px] dark:border-slate-800 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileSidebar />

          <BreadcrumbHeader pathname={pathname} />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
