import React from "react";
import styles from "./FormCounter.module.scss";

interface FormCounterProps {
  currentStep: number;
  totalSteps: number;
}

const FormCounter: React.FC<FormCounterProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className={styles.counterWrapper}>
      Step
      <span className={styles.highlight}>{currentStep}</span> of
      <span className={styles.totalSteps}>{` ${totalSteps}`}</span>
    </div>
  );
};

export default FormCounter;
