import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/widgets/dashboard-header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <SidebarProvider>
        <SellerSidebar />

        <SidebarInset>
          <DashboardHeader />
          <div className="container py-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
