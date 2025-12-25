"use client";

import React, { useEffect, useState } from "react";
import OnboardingStepper from "./onboarding-stepper";
import BankInfo from "./bank-info";
import useSeller from "@/hooks/useUser";
import ShopSetup from "./shop-setup";

const steps = [
  { id: 1, label: "Shop Setup" },
  { id: 2, label: "Bank Information" },
];

const OnboardingContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { seller, isLoading } = useSeller();
  // console.log("seller: ", seller);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  useEffect(() => {
    if (!isLoading && seller) {
      const desired = seller.shops && seller.shops.length > 0 ? 2 : 1;
      setCurrentStep((prev) => (prev === desired ? prev : desired));
    }
  }, [seller, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex flex-col items-center my-8">
        <OnboardingStepper
          steps={steps}
          current={currentStep}
          onStepClick={(index) => setCurrentStep(index)}
        />

        {currentStep === 1 ? (
          <ShopSetup handleStepClick={handleStepClick} />
        ) : currentStep === 2 ? (
          <BankInfo />
        ) : null}
      </div>
    </div>
  );
};

export default OnboardingContainer;
