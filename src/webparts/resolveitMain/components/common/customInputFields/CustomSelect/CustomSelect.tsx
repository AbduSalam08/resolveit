/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Select } from "antd";
import styles from "./CustomSelect.module.scss";

interface CustomSelectProps {
  placeholder?: string;
  options: any;
  value?: string;
  isValid?: boolean;
  errorMsg?: string;
  onChange?: (value: string) => void;
  size?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  placeholder,
  options,
  value,
  isValid,
  errorMsg,
  onChange,
  size,
  ...rest
}) => {
  return (
    <div className={styles.wrapper}>
      <Select
        {...rest}
        className={`${styles.customSelect} ${isValid ? "" : styles.error}`}
        placeholder={placeholder}
        onChange={onChange}
        value={value || undefined}
        options={options}
        autoFocus
        // size="large"
      />
      {!isValid && <span className={styles.errorMessage}>{errorMsg}</span>}
    </div>
  );
};

export default CustomSelect;
