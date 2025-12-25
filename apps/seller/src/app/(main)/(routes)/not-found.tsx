import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/widgets/dashboard-header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { Home, Settings } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <SidebarProvider>
      <SellerSidebar />

      <SidebarInset>
        <DashboardHeader />
        <div className="flex items-center justify-center bg-background h-full">
          <div className="text-center space-y-6 p-8">
            <div className="space-y-2">
              <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
              <h2 className="text-2xl font-semibold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to access it.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                variant="default"
              >
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
              >
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Error Code: 404</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
