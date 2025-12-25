"use client";
import React from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CreditCardIcon, HashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step3BankProps {
  register: any;
  errors: any;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const Step3Bank: React.FC<Step3BankProps> = ({ register, errors, onSubmit, onBack, isSubmitting }) => {
  return (
    <div className="flex flex-col gap-4">
      <Field name="accountHolder">
        <FieldLabel className="block text-sm font-medium uppercase">Account Holder</FieldLabel>
        <InputGroup className="border-border bg-input py-2">
          <InputGroupInput
            aria-label="Account Holder"
            placeholder="Name on account"
            type="text"
            {...register("accountHolder")}
          />
          <InputGroupAddon>
            <CreditCardIcon className="size-6 text-gray-400" />
          </InputGroupAddon>
        </InputGroup>
        {errors.accountHolder?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.accountHolder.message}</p>
        )}
      </Field>
      <Field name="accountNumber">
        <FieldLabel className="block text-sm font-medium uppercase">Account Number</FieldLabel>
        <InputGroup className="border-border bg-input py-2">
          <InputGroupInput
            aria-label="Account Number"
            placeholder="Enter account number"
            type="text"
            {...register("accountNumber")}
          />
          <InputGroupAddon>
            <HashIcon className="size-6 text-gray-400" />
          </InputGroupAddon>
        </InputGroup>
        {errors.accountNumber?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.accountNumber.message}</p>
        )}
      </Field>
      <div className="flex justify-between mt-2">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default Step3Bank;
