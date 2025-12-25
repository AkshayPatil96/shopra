import React from "react";

type Props = {
  title: string;
  subtitle?: string;
};

const SectionHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-6">
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {subtitle && <p className="text-secondary-foreground">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
