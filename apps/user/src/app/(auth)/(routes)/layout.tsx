import React from "react";
import AuthHeader from "../_components/AuthHeader";

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div>
      <AuthHeader />
      {children}
    </div>
  );
};

export default AuthLayout;
