"use client";

import {
  CircleUserRoundIcon,
  HeartIcon,
  MoonIcon,
  SearchIcon,
  ShoppingBagIcon,
  SunIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useTheme } from "next-themes";
import HeaderBottom from "./header-bottom";
import useUser from "@/hooks/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Header = () => {
  const { user, isLoading, isError, refetch } = useUser();

  return (
    <div className="w-full bg-background">
      <div className="border-b">
        <div className="container py-2.5 m-auto flex items-center justify-between h-[70px]">
          <div>
            <Link href={`/`}>
              <span className="text-2xl font-semibold">E-Com</span>
            </Link>
          </div>
          <div className="hidden lg:block w-[50%] relative border border-border rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            />
            <Button className="absolute rounded-none h-full w-[50px] right-0 top-0 bg-primary flex items-center justify-center">
              <SearchIcon className="text-white" />
            </Button>
          </div>

          <HearderButtons
            refetch={refetch}
            user={user}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </div>

      <div className="">
        <HeaderBottom
          refetch={refetch}
          user={user}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
};

type HeaderButtonsProps = {
  refetch: () => void;
  user: any;
  isLoading: boolean;
  isError: boolean;
};

export const HearderButtons = ({
  refetch,
  user,
  isLoading,
  isError,
}: HeaderButtonsProps) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await UserAuthAPI.logout();
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.removeQueries({ queryKey: ["user"] });
      // router.push("/login");
      console.log("Logout successful");
      toast.success("Logout successful");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    },
  });

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size={"icon-lg"}
        className="p-1 relative"
      >
        <HeartIcon className="size-6" />
      </Button>
      <Button
        variant="ghost"
        size={"icon-lg"}
        className="p-1 relative"
      >
        <ShoppingBagIcon className="size-6" />
        <Badge className="absolute top-0 right-0 min-w-4.5 rounded-full">
          7
        </Badge>
      </Button>
      {isLoading ? null : user ? (
        <div className="p-1 relative flex items-center gap-0">
          <CircleUserRoundIcon className="size-10" />
          <p className="flex flex-col gap-0 justify-center items-start text-sm leading-tight">
            <span className="ml-2 text-xs hidden md:inline-block">Hello,</span>
            <span className="ml-2 text-sm hidden md:inline-block">
              {user?.name?.split(" ")[0] || user?.email?.split("@")[0]}
            </span>
            <span
              className="ml-2 text-xs hidden md:inline-block"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </span>
          </p>
        </div>
      ) : (
        <Link
          href={`/login`}
          className="bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
        >
          Login
        </Link>
      )}

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
    </div>
  );
};

export default Header;
