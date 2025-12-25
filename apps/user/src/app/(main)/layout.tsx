import { Header } from "@/components/widgets";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
