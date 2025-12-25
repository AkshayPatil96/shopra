"use client";

import { ChevronDownIcon, PhoneIcon } from "lucide-react";
import React, { useId, useState } from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  error?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

export const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  PhoneInputProps
>(
  (
    {
      value,
      onChange,
      name,
      label = "Phone Number",
      error,
      id,
      disabled,
      required,
      placeholder = "Enter phone number",
      ...rest
    },
    ref,
  ) => {
    const newId = useId();
    const inputId = id || newId;
    return (
      <div
        className="*:not-first:mt-2 w-full"
        dir="ltr"
      >
        {/* Label removed: parent form should render label if needed */}
        <RPNInput.default
          className="w-full flex rounded-md shadow-xs border border-input bg-background focus-within:border-ring focus-within:ring-ring/20 hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 overflow-hidden"
          international
          defaultCountry="IN"
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInput}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(val) => onChange(val ?? "")}
          disabled={disabled}
          required={required}
          {...rest}
        />
        {error && <span className="text-destructive text-xs">{error}</span>}
      </div>
    );
  },
);
PhoneInputField.displayName = "PhoneInputField";

const PhoneInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <Input
      data-slot="phone-input"
      className={cn(
        "-ms-px rounded-none border-none shadow-none overflow-hidden focus-visible:z-10 bg-input",
        className,
      )}
      {...props}
    />
  );
};

PhoneInput.displayName = "PhoneInput";

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country);
  };

  return (
    <div className="border-border bg-input text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-input hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex items-center self-stretch rounded-s-md border py-2 ps-3 pe-2 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50">
      <div
        className="inline-flex items-center gap-1"
        aria-hidden="true"
      >
        <FlagComponent
          country={value}
          countryName={value}
          aria-hidden="true"
        />
        <span className="text-muted-foreground/80">
          <ChevronDownIcon
            size={16}
            aria-hidden="true"
          />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Select country"
      >
        <option
          key="default"
          value=""
        >
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option
              key={option.value ?? `empty-${i}`}
              value={option.value}
            >
              {option.label}{" "}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon
          size={16}
          aria-hidden="true"
        />
      )}
    </span>
  );
};
