import * as React from "react";
import type { IResolveitMainProps } from "./IResolveitMainProps";
import MyTickets from "../../../pages/MyTickets/MyTickets";
import styles from "./ResolveitMain.module.scss";
const ResolveitMain = ({
  context,
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
}: IResolveitMainProps): JSX.Element => {
  return (
    <div className={styles.main}>
      <MyTickets />
    </div>
  );
};

export default ResolveitMain;
