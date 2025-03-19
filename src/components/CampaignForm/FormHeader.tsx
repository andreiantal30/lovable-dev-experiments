
import React from "react";

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-medium text-center mb-6 text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-16">
        {subtitle}
      </p>
    </>
  );
};

export default FormHeader;
