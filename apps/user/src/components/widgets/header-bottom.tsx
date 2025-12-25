"use client";

import { navItems } from "@/configs/constants";
import { AlignLeftIcon, ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HearderButtons } from "./header";
import { Button } from "../ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";

type Props = {
  refetch: () => void;
  user: any;
  isLoading: boolean;
  isError: boolean;
};

const HeaderBottom = ({ refetch, user, isLoading, isError }: Props) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 99) setIsSticky(true);
      else setIsSticky(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full bg-background transition-all duration-300 ${
        isSticky ? "fixed top-0 left-0 z-100 shadow-md border-b" : "relative"
      }`}
    >
      <div
        className={`container transition-all duration-300 bg-background flex items-center justify-between ${
          isSticky ? "pt-3 h-[70px]" : "py-0 h-[50px]"
        }`}
      >
        <Menu>
          <MenuTrigger
            render={
              <Button
                className={`relative w-[200px] rounded-none ${
                  isSticky ? "-mb-2 rounded-t-md" : "rounded-b-md"
                } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-primary`}
              />
            }
          >
            <div className="flex items-center gap-2">
              <AlignLeftIcon />
              <span className="font-medium">All Categories</span>
            </div>
            <ChevronDownIcon />
          </MenuTrigger>
          <MenuPopup
            side="bottom"
            className="bg-background"
          >
            {navItems.map((item: NavItemsTypes, index: number) => (
              <MenuItem
                key={index}
                className={"w-[190px]"}
                render={<Link href={item?.href} />}
              >
                {item.title}
              </MenuItem>
            ))}
          </MenuPopup>
        </Menu>

        <div className={`hidden lg:flex`}>
          {navItems?.map((item: NavItemsTypes, index: number) => (
            <Link
              key={index}
              href={item.href}
              className={`px-5 font-medium text-base hover:text-primary transition-colors duration-300`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <HearderButtons
              refetch={refetch}
              user={user}
              isLoading={isLoading}
              isError={isError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
