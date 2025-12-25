"use client";
import React from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { StoreIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step2ShopProps {
  register: any;
  errors: any;
  onNext: () => void;
  onBack: () => void;
}

const Step2Shop: React.FC<Step2ShopProps> = ({
  register,
  errors,
  onNext,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Field name="shopName">
        <FieldLabel className="block text-sm font-medium uppercase">
          Shop Name
        </FieldLabel>
        <InputGroup className="border-border bg-input py-2">
          <InputGroupInput
            aria-label="Shop Name"
            placeholder="Enter shop name"
            type="text"
            {...register("shopName")}
          />
          <InputGroupAddon>
            <StoreIcon className="size-6 text-gray-400" />
          </InputGroupAddon>
        </InputGroup>
        {errors.shopName?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.shopName.message}</p>
        )}
      </Field>
      <Field name="shopDescription">
        <FieldLabel className="block text-sm font-medium uppercase">
          Description
        </FieldLabel>
        <InputGroup className="border-border bg-input py-2">
          <InputGroupInput
            aria-label="Description"
            placeholder="Brief description"
            type="text"
            {...register("shopDescription")}
          />
          <InputGroupAddon>
            <FileTextIcon className="size-6 text-gray-400" />
          </InputGroupAddon>
        </InputGroup>
        {errors.shopDescription?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.shopDescription.message}
          </p>
        )}
      </Field>
      <div className="flex justify-between mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2Shop;
