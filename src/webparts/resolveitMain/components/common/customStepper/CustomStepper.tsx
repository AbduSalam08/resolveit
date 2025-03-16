import React from "react";
import type { StepsProps } from "antd";
import { Popover, Steps } from "antd";

interface StepperProps {
  current: number;
  items: Array<{ title: string; description: string; label: string }>;
}

const customDot =
  (items: StepperProps["items"]): StepsProps["progressDot"] =>
  (dot, { status, index }) =>
    (
      <Popover
        content={
          <span>
            {items[index]?.label} - {status}
          </span>
          //   <span>
          //     Step {index + 1}: {items[index].title} - {status}
          //   </span>
        }
      >
        {dot}
      </Popover>
    );

const Stepper: React.FC<StepperProps> = ({ current, items }) => (
  <div
    style={{
      width: "300px",
    }}
  >
    <Steps
      current={current}
      size="small"
      // direction=""
      progressDot={customDot(items)}
      items={items}
      responsive
    />
  </div>
);

export default Stepper;
