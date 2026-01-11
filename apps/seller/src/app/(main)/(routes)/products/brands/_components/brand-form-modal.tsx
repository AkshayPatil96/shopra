"use client";

import type { ReactNode } from "react";
import { Brand } from "@repo/shared-types";
import { Modal } from "@repo/ui/modal";
import BrandForm, { BrandFormValues } from "./brand-form";

type ModalMode = "add" | "edit" | null;

interface BrandFormModalProps {
  mode: ModalMode;
  brand?: Brand;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const toBrandFormValues = (brand?: Brand): BrandFormValues | undefined => {
  if (!brand) return undefined;

  return {
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl ?? null,
    isActive: brand.isActive,
  };
};

const descriptions: Record<Exclude<ModalMode, null>, string> = {
  add: "Fill in the details to create a new brand.",
  edit: "Update the details of your brand.",
};

const titles: Record<Exclude<ModalMode, null>, string> = {
  add: "Add New Brand",
  edit: "Edit Brand",
};

export default function BrandFormModal({
  mode,
  brand,
  isOpen,
  onClose,
  isLoading,
}: BrandFormModalProps) {
  if (!mode) return null;

  let body: ReactNode;

  if (mode === "edit" && isLoading) {
    body = (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Loading brand details...
      </p>
    );
  } else if (mode === "edit" && !brand) {
    body = (
      <p className="text-sm text-muted-foreground">
        Unable to load the selected brand.
      </p>
    );
  } else {
    body = (
      <BrandForm
        mode={mode}
        id={mode === "edit" ? brand?.id : undefined}
        brand={toBrandFormValues(brand)}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      header={
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{titles[mode]}</h2>
          <p className="text-sm text-muted-foreground">{descriptions[mode]}</p>
        </div>
      }
      body={body}
    />
  );
}
