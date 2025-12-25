"use client";

import { Button } from "@/components/ui/button";
import useSeller from "@/hooks/useUser";
import { SellerAuthAPI } from "@repo/shared-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const AuthHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { seller, isLoading, isError } = useSeller();
  const queryClient = useQueryClient();

  const logOutMutation = useMutation({
    mutationFn: async () => {
      const response = await SellerAuthAPI.logout();
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller"] });
      await queryClient.removeQueries({ queryKey: ["seller"] });
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
    },
  });

  return (
    <header className="shadow-sm sticky top-0 z-50 bg-background">
      <div className="container flex items-center justify-between py-5">
        <h1 className="">
          <Link href={`/`}>
            <span className="text-2xl font-semibold">E-Com</span>
          </Link>
        </h1>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size={"icon"}
            className="p-1 relative"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <MoonIcon className="size-4" />
            ) : (
              <SunIcon className="size-4" />
            )}
          </Button>

          {["/onboarding", "/suspended"]?.includes(pathname) ? (
            <Button
              onClick={async () => {
                await logOutMutation.mutateAsync();
              }}
            >
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
