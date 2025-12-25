import { Button } from "@/components/ui/button";
import React from "react";
import StripeLogo from "@/assets/logo/stripe.svg";
import Image from "next/image";
import { PaymentAPI } from "@repo/shared-axios";

const BankInfo = () => {
  const connectToStripe = async () => {
    try {
      const response = await PaymentAPI.connectStripe();
      const data = response as { url: string; success: boolean };
      console.log("data: ", data);
      window.location.href = data.url;
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
    }
  };

  return (
    <div className="w-full lg:w-1/2 mt-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl uppercase">Connect with Stripe</h1>
        <p className="mt-2 text-sm text-secondary-foreground">
          Connect to Stripe to securely manage your payouts and financial
          transactions.
        </p>
      </div>

      <div className="flex flex-col">
        <Button
          // variant="secondary"
          className="flex justify-center items-center py-6"
          onClick={connectToStripe}
        >
          Connect to Stripe
          <Image
            src={StripeLogo}
            alt="Stripe Logo"
            className="inline-block size-6"
          />
        </Button>
      </div>
    </div>
  );
};

export default BankInfo;
