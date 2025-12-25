import React from "react";
import AuthHeader from "../../../components/widgets/auth-header";

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
