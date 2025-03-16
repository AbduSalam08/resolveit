/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./CustomUpload.module.scss";

interface CustomUploadProps {
  fileList: any[];
  isValid?: boolean;
  errorMsg?: string;
  onChange: (info: any) => void;
}

const CustomUpload: React.FC<CustomUploadProps> = ({
  fileList,
  isValid,
  errorMsg,
  onChange,
}) => {
  return (
    <div className={styles.wrapper}>
      <Upload
        multiple
        onChange={onChange}
        beforeUpload={() => false}
        fileList={fileList}
        className={`${styles.customUpload} ${isValid ? "" : styles.error}`}
      >
        <Button
          icon={<UploadOutlined />}
          style={{
            border: "1px solid #00000010",
            borderRadius: "8px",
            color: "#555",
            fontSize: "13px",
          }}
        >
          Upload Files
        </Button>
      </Upload>
      {!isValid && <span className={styles.errorMessage}>{errorMsg}</span>}
    </div>
  );
};

export default CustomUpload;
