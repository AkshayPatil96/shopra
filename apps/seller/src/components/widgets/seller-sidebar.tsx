"use client";

import { memo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Activity,
  Database,
  Shield,
  Zap,
  Bell,
  Settings,
  Moon,
  Sun,
  User,
  LogOutIcon,
  WalletIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SellerAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";
import useSeller from "@/hooks/useUser";
import { useRouter } from "next/navigation";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    title: "Main Menu",
    menuItems: [
      { title: "Orders", icon: Users, href: "/orders" },
      { title: "Payments", icon: WalletIcon, href: "/payments" },
    ],
  },
  {
    title: "Products",
    menuItems: [
      { title: "All Products", icon: FileText, href: "/products" },
      { title: "Add Product", icon: Activity, href: "/products/add" },
      { title: "Categories", icon: Database, href: "/products/categories" },
      {
        title: "Add Category",
        icon: Database,
        href: "/products/categories/add",
      },
      {
        title: "Brands",
        icon: BarChart3,
        href: "/products/brands",
      },
    ],
  },
  {
    title: "Events",
    menuItems: [
      { title: "All Events", icon: Shield, href: "/events" },
      { title: "Create Event", icon: Zap, href: "/events/new" },
    ],
  },
  {
    title: "Controllers",
    menuItems: [
      { title: "Inbox", icon: Bell, href: "/inbox" },
      { title: "Settings", icon: Settings, href: "/settings" },
      { title: "Notifications", icon: Bell, href: "/notifications" },
    ],
  },
  {
    title: "Extras",
    menuItems: [
      { title: "Discount Codes", icon: Shield, href: "/discount-codes" },
    ],
  },
];

export const SellerSidebar = memo(() => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { seller, refetch, isLoading, isError } = useSeller();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await SellerAuthAPI.logout();
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller"] });
      await queryClient.removeQueries({ queryKey: ["seller"] });

      console.log("Logout successful");
      toast.success("Logout successful");
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    },
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link
                prefetch={false}
                href="#dashboard"
              >
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TechCorp</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        prefetch={false}
                        href={item.href}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        {menu.map((section, index) =>
          section.menuItems?.length ? (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {"menuItems" in section
                    ? section.menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild>
                              <Link
                                prefetch={false}
                                href={item.href}
                              >
                                <Icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })
                    : null}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarGroup key={index}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        prefetch={false}
                        href={section.href ?? "/dashboard"}
                      >
                        <LayoutDashboard />
                        <span>{section.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ),
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                prefetch={false}
                href="#profile"
              >
                <User />
                <span>Admin Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div onClick={() => logoutMutation.mutate()}>
                <LogOutIcon />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

SellerSidebar.displayName = "SellerSidebar";
