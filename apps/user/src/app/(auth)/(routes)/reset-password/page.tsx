import React, { Suspense } from "react";
import ResetPassword from "../../_components/ResetPassword";

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
