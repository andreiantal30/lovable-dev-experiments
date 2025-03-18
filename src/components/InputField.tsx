
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  chip?: string;
}

const InputField = ({
  label,
  helperText,
  type = 'text',
  multiline = false,
  rows = 3,
  error,
  className,
  inputClassName,
  labelClassName,
  chip,
  ...props
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(!!props.value);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(true);
    if (props.onFocus) props.onFocus(e as any);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(false);
    setFilled(!!e.target.value);
    if (props.onBlur) props.onBlur(e as any);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFilled(!!e.target.value);
    if (props.onChange) props.onChange(e as any);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <label 
          htmlFor={props.id} 
          className={cn(
            "text-sm font-medium transition-colors",
            focused ? "text-primary" : "text-foreground",
            labelClassName
          )}
        >
          {label}
        </label>
        {chip && (
          <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {chip}
          </span>
        )}
      </div>
      
      {multiline ? (
        <textarea
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          rows={rows}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 bg-white/80 border rounded-md transition-all duration-200",
            "hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "placeholder:text-muted-foreground/50",
            focused ? "border-primary/50" : "border-input",
            error ? "border-destructive/50 focus:ring-destructive/20" : "",
            inputClassName
          )}
        />
      ) : (
        <input
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
          type={type}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full h-10 px-3 bg-white/80 border rounded-md transition-all duration-200",
            "hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "placeholder:text-muted-foreground/50",
            focused ? "border-primary/50" : "border-input",
            error ? "border-destructive/50 focus:ring-destructive/20" : "",
            inputClassName
          )}
        />
      )}
      
      {(helperText || error) && (
        <p className={cn(
          "text-xs",
          error 
            ? "text-destructive" 
            : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;
