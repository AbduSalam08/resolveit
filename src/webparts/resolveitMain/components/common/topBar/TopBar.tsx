/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import styles from "./topBar.module.scss";
import { Avatar, Segmented } from "antd";

const TopBar = (): JSX.Element => {
  type Align = "Dashboard" | "My tickets";
  const [alignValue, setAlignValue] = useState<Align>("Dashboard");

  return (
    <div className={styles.topBar}>
      <span className={styles.topBarLeft}>RESOLVE IT</span>
      <Segmented
        value={alignValue}
        className={"tabs"}
        onChange={(value) => setAlignValue(value as Align)}
        options={["Dashboard", "My tickets"]}
        style={{
          backgroundColor: "transparent",
          border: "1px solid #00000015",
          borderRadius: "30px",
        }}
        onResize={(e: any) => {
          console.log("e: ", e);
        }}
        onResizeCapture={(e: any) => {
          console.log("e: ", e);
        }}
      />
      <div className={styles.topBarRight}>
        <div className={styles.profileInfo}>
          <Avatar
            style={{
              backgroundColor: "var(--bg-dark-main)",
              verticalAlign: "middle",
            }}
            size="small"
            gap={8}
          >
            A
          </Avatar>
          <div className={styles.namePill}>
            <span>Hi, Abdul</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
