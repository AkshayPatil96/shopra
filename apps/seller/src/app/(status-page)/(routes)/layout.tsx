import AuthHeader from "@/components/widgets/auth-header";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <AuthHeader />
      {children}
    </div>
  );
};

export default MainLayout;
