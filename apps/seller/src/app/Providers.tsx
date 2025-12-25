"use client";

import { SellerAuthAPI } from "@repo/shared-axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

type Props = {
  children?: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const queryClient = new QueryClient();

  const refreshUser = async () => {
    try {
      await SellerAuthAPI.refresh();
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Providers;
