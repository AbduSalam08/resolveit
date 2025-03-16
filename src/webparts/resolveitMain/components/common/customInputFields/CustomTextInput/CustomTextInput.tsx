import React from "react";
import { Input } from "antd";
import "../mainStyles.css";

// Omit the native 'size' property
interface CustomTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // size?: "sm" | "md" | "xl";
  isValid?: boolean;
  errorMsg?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  // size = "md",
  placeholder,
  value,
  onChange,
  isValid = true,
  errorMsg = "",
  ...rest
}) => {
  return (
    <div className="custom-input-wrapper">
      <Input
        {...rest}
        autoFocus={rest?.autoFocus || true}
        className={`custom-input ${!isValid ? "input-error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        // size="large"
      />
      {!isValid && errorMsg && (
        <span className="error-message">{errorMsg}</span>
      )}
    </div>
  );
};

export default CustomTextInput;
