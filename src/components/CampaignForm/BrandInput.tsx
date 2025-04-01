
import React from "react";
import InputField from "@/components/InputField";
import TransitionElement from "@/components/TransitionElement";

interface BrandInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  delay?: number;
}

const BrandInput: React.FC<BrandInputProps> = ({
  value,
  onChange,
  error,
  delay = 100
}) => {
  return (
    <TransitionElement delay={delay}>
      <InputField
        label="Brand Name"
        id="brand"
        name="brand"
        placeholder="e.g. Nike, Apple, Spotify"
        value={value}
        onChange={onChange}
        error={error}
        chip="Required"
      />
    </TransitionElement>
  );
};

export default BrandInput;
