"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

export type StepDef = {
  id: number;
  label: string;
  description?: string;
  optional?: boolean;
};

interface StepperProps {
  steps: StepDef[];
  current: number; // zero-based index
  completed?: number; // highest completed index (inclusive)
  onStepClick?: (index: number) => void;
}

const OnboardingStepper = ({
  steps,
  current,
  completed = -1,
  onStepClick,
}: StepperProps) => {
  return (
    <div className="space-y-8 text-center w-full">
      <Stepper
        value={current}
        // onValueChange={(val) => {
        //   onStepClick && onStepClick(val);
        // }}
      >
        {steps.map(({ id, label, description }) => (
          <StepperItem
            className="relative flex-1 flex-col!"
            key={id}
            step={id}
          >
            <StepperTrigger className="flex-col gap-3 rounded">
              <StepperIndicator />
              <div className="space-y-0.5 px-2">
                <StepperTitle>{label}</StepperTitle>
                <StepperDescription className="max-sm:hidden">
                  {description}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {id < steps.length && (
              <StepperSeparator className="bg-border -order-1 -translate-y-1/2 absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] m-0 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
};

export default OnboardingStepper;
