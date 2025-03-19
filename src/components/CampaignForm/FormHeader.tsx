
import React from "react";

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl md:text-3xl font-medium text-center text-foreground">
          {title}
        </h2>
        <span className="ml-3 px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full">
          AI Embeddings + Granular Control
        </span>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-16">
        {subtitle}
      </p>
    </>
  );
};

export default FormHeader;
