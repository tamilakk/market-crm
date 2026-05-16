"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Store, LayoutDashboard, Users, Package, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/clients", label: "Клиенты", icon: Users },
  { href: "/products", label: "Товары", icon: Package },
  { href: "/sales", label: "Продажи", icon: ShoppingCart },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-1">
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Рынок CRM</span>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-900">Рынок CRM</span>
      </div>
    </header>
  );
}
