import React from "react";
import { Input } from "antd";
import styles from "./CustomMultiText.module.scss";

interface CustomMultiTextProps {
  placeholder?: string;
  value?: string;
  isValid?: boolean;
  errorMsg?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const CustomMultiText: React.FC<CustomMultiTextProps> = ({
  placeholder,
  value,
  isValid,
  errorMsg,
  onChange,
}) => {
  return (
    <div className={styles.wrapper}>
      <Input.TextArea
        className={`${styles.multiTextInput} ${isValid ? "" : styles.error}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        // size="large"
      />
      {!isValid && <span className={styles.errorMessage}>{errorMsg}</span>}
    </div>
  );
};

export default CustomMultiText;
