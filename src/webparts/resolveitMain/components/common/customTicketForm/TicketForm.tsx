/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import styles from "./TicketForm.module.scss";
import CustomTextInput from "../customInputFields/CustomTextInput/CustomTextInput";
import CustomSelect from "../customInputFields/CustomSelect/CustomSelect";
import CustomUpload from "../customInputFields/CustomUpload/CustomUpload";
import CustomMultiText from "../customInputFields/CustomMultiText/CustomMultiText";
import {
  checkFile,
  emptyCheck,
  validateSelect,
} from "../../../../../utils/validations";
import {
  TicketCategory,
  TicketPriority,
} from "../../../../../constants/TicketFormConstants";
import {
  handleSubmitTicket,
  // submitTicket,
} from "../../../../../utils/TicketUtils";
import FormCounter from "../formCounter/FormCounter";
import {
  BugOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Divider, Spin, Steps, Tag } from "antd";
import { CheckCircle } from "@mui/icons-material";

interface FormField {
  value: string;
  isValid: boolean;
  errorMsg: string;
  options?: { label: string; value: string }[];
}

interface IFields {
  key: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
}

const fields: IFields[] = [
  { key: "issueDescription", label: "Describe your issue", type: "text" },
  {
    key: "ticketCategory",
    label: "Select Ticket Category",
    type: "select",
    options: TicketCategory,
  },
  {
    key: "priority",
    label: "Select Priority",
    type: "select",
    options: TicketPriority,
  },
  { key: "attachments", label: "Attach Supporting Files", type: "file" },
  { key: "additionalNotes", label: "Additional Notes", type: "multiText" },
];

const initialFormData: Record<string, FormField> = fields.reduce(
  (acc, field) => {
    acc[field.key] = { value: "", isValid: true, errorMsg: "", ...field };
    return acc;
  },
  {} as Record<string, FormField>
);

const TicketForm = ({
  onClosePopup,
  ticketNumber,
}: {
  onClosePopup: () => void;
  ticketNumber: any;
}): JSX.Element => {
  const totalSlides = fields.length;

  const [formData, setFormData] = useState(initialFormData);
  const [step, setStep] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<{
    loading: boolean;
    completed: boolean;
    data: any;
  }>({
    loading: false,
    completed: false,
    data: {},
  });
  const [currentStep, setCurrentStep] = useState<number>(0);

  const changeStep = (newStep: number): void => {
    setFade(false);
    setTimeout(() => {
      setStep(newStep);
      setFade(true);
    }, 300);
  };

  const validateField = (
    key: string,
    value: string
  ): { isValid: boolean; errorMsg: string } => {
    switch (key) {
      case "issueDescription":
      case "additionalNotes":
        return {
          isValid: emptyCheck(value),
          errorMsg: emptyCheck(value) ? "" : "This field is required",
        };
      case "ticketCategory":
      case "priority":
        return {
          isValid: validateSelect("Select", value),
          errorMsg: validateSelect("Select", value)
            ? ""
            : "Please select a valid option",
        };
      case "attachments":
        return {
          isValid: !checkFile(value),
          errorMsg: !checkFile(value) ? "" : "Please upload at least one file",
        };
      default:
        return { isValid: true, errorMsg: "" };
    }
  };

  const handleNext = (): void => {
    const field = fields[step];
    const { key } = field;
    const { value } = formData[key];

    const validation = validateField(key, value);
    if (!validation.isValid) {
      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...validation },
      }));
      return;
    }

    if (step < totalSlides) {
      changeStep(step + 1);
    }
  };

  const handleBack = (): void => {
    if (step > 0) {
      changeStep(step - 1);
    }
  };

  const handleReset = (): void => {
    setFormData(initialFormData);
    setAttachments([]);
    changeStep(0);
    setIsLoading({
      loading: false,
      completed: false,
      data: {},
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ): void => {
    const value = e.target.value;
    const validation = validateField(key, value);

    setFormData((prev) => ({
      ...prev,
      [key]: { value, ...validation },
    }));
  };

  const handleSelectChange = (value: string, key: string): void => {
    const validation = validateField(key, value);

    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, ...validation },
    }));
  };

  const handleFileChange = (info: any): void => {
    setAttachments(info.fileList);

    const validation = validateField(
      "attachments",
      info.fileList.length > 0 ? "valid" : ""
    );
    setFormData((prev) => ({
      ...prev,
      attachments: {
        value: info.fileList,
        ...validation,
      },
    }));
  };

  const renderInputs = (): JSX.Element | null => {
    const field = fields[step];
    const { key, label, type } = field;
    const fieldData = formData[key];

    switch (type) {
      case "text":
        return (
          <CustomTextInput
            onKeyDown={(e: any) =>
              e.key === "Enter" ? handleNext() : undefined
            }
            placeholder={"software issue, hardware issue, etc."}
            value={fieldData.value}
            isValid={fieldData.isValid}
            errorMsg={fieldData.errorMsg}
            onChange={(e: any) => handleInputChange(e, key)}
          />
        );
      case "multiText":
        return (
          <CustomMultiText
            placeholder={"Add any additional notes here"}
            value={fieldData.value}
            isValid={fieldData.isValid}
            errorMsg={fieldData.errorMsg}
            onChange={(e: any) => handleInputChange(e, key)}
          />
        );
      case "select":
        return (
          <CustomSelect
            placeholder={label?.split(" ")[1]}
            options={fieldData.options}
            value={fieldData.value}
            isValid={fieldData.isValid}
            errorMsg={fieldData.errorMsg}
            onChange={(value) => {
              handleSelectChange(value, key);
              // handleNext()
              changeStep(step + 1);
            }}
          />
        );
      case "file":
        return (
          <CustomUpload
            fileList={attachments}
            isValid={fieldData.isValid}
            errorMsg={fieldData.errorMsg}
            onChange={handleFileChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.ticketFormWrapper}>
      {!isLoading?.completed && (
        <>
          <div className={styles.formHeader}>
            <div className={styles.formTitleWrapper}>
              <span className={styles.formTitle}>New ticket</span>
              <Tag
                color="var(--success-light)"
                style={{
                  borderRadius: "6px",
                  fontSize: "11px",
                  // marginLeft: "10px",
                  fontFamily: '"interMedium", sans-serif',
                }}
              >
                #{ticketNumber}
              </Tag>
            </div>
            {!isLoading.loading &&
            !isLoading.completed &&
            step !== totalSlides ? (
              <FormCounter currentStep={step + 1} totalSteps={totalSlides} />
            ) : (
              !isLoading.loading &&
              !isLoading.completed && (
                <CheckCircleOutlined
                  style={{
                    fontSize: "20px",
                    color: "var(--success-light)",
                  }}
                />
              )
            )}
          </div>
          <div className={styles.formSubtitleWrapper}>
            <Tag
              // color="var(--success-light)"
              style={{
                borderRadius: "6px",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '"interMedium", sans-serif',
              }}
            >
              <BugOutlined style={{ fontSize: "12px" }} />
              <span className={styles.formSubtitle}>
                Report a new issue or bug
              </span>
            </Tag>
          </div>
          <div className={styles.carouselWrapper}>
            <div
              className={`${styles.carousel} ${
                fade ? styles.fadeIn : styles.fadeOut
              }`}
            >
              {step < totalSlides &&
                !isLoading.loading &&
                !isLoading.completed && (
                  <div className={styles.slide}>
                    <label className={styles.fieldLabel}>
                      {fields[step].label}
                    </label>
                    {renderInputs()}
                  </div>
                )}
            </div>

            {/* Summary Slide */}
            {step === totalSlides &&
              !isLoading.loading &&
              !isLoading.completed && (
                <div
                  className={styles.slide}
                  style={{
                    padding: "0 10px",
                  }}
                >
                  <div className={styles.summary}>
                    <Divider
                      style={{
                        margin: "0",
                        marginBottom: "10px",
                      }}
                      orientation="left"
                    >
                      <span className={styles.confirmTitle}>
                        Confirm details
                      </span>
                    </Divider>
                    {fields.map(({ key, label }, index: number) => (
                      <div key={key} className={styles.summaryItem}>
                        <strong>
                          {index + 1}.{label}
                        </strong>
                        <span>
                          {key === "attachments" ? (
                            `${attachments.length} files uploaded`
                          ) : key === "priority" || key === "ticketCategory" ? (
                            <Tag
                              color="var(--bg-main-light)"
                              style={{
                                borderRadius: "6px",
                                fontSize: "11px",
                                // marginLeft: "10px",
                                fontFamily: '"interMedium", sans-serif',
                              }}
                            >
                              {formData[key].value}
                            </Tag>
                          ) : (
                            formData[key].value
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Ant Design Verticsal Stepper with Current Step Highlighting */}
            {isLoading.loading && !isLoading.completed && (
              <Steps
                direction="vertical"
                className={`${styles.submissionSteppers} submissionSteppers`}
                current={currentStep}
              >
                {steps?.map((step, index) => (
                  <Steps.Step
                    key={index}
                    progressDot
                    title={step.step}
                    description={step.status}
                    status={
                      index === currentStep
                        ? "process"
                        : step.completed
                        ? "finish"
                        : "wait"
                    }
                    icon={
                      step.completed ? (
                        <CheckCircleOutlined
                          style={{
                            color: "var(--primary-light)",
                            fontSize: "15px",
                          }}
                        />
                      ) : index === currentStep ? (
                        <Spin
                          indicator={
                            <LoadingOutlined
                              style={{
                                color: "var(--bg-dark-main)",
                                fontSize: "15px",
                              }}
                            />
                          }
                        />
                      ) : (
                        <div className={styles.dotBox}>
                          <span className={styles.dot} />
                        </div>
                      )
                    }
                  />
                ))}
              </Steps>
            )}
          </div>
        </>
      )}

      {isLoading.completed && (
        <div className={styles.ticketSuccessMsg}>
          <div className={styles.successMsg}>
            <CheckCircle
              sx={{
                fontSize: "20px",
                color: "var(--success-light",
              }}
            />
            <div>Ticket has been submitted successfully.</div>
          </div>

          <div className={styles.ticketDetails}>
            <span className={styles.ticketInfoMsg}>
              The issue{" "}
              <Tag
                // color="var(--success-light)"
                style={{
                  borderRadius: "6px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "5px",
                  fontFamily: '"interMedium", sans-serif',
                }}
              >
                <span className={styles.formSubtitle}>
                  #{isLoading?.data?.ticketID || "00"}
                </span>
              </Tag>
              has been raised and assigned to resolver{" "}
              <Tag
                // color="var(--success-light)"
                style={{
                  borderRadius: "6px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "5px",
                  fontFamily: '"interMedium", sans-serif',
                }}
              >
                <span className={styles.formSubtitle}>
                  {isLoading?.data?.resolver || "resolver"}
                </span>
              </Tag>
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step <= totalSlides && (
        <div
          className={styles.buttonGroup}
          style={{
            justifyContent: isLoading?.completed ? "center" : "space-between",
          }}
        >
          <button
            onClick={() => {
              onClosePopup();
              handleReset();
            }}
            className={styles.closeButton}
          >
            {isLoading?.completed ? "Okay, got it!" : "Close"}
          </button>
          {!isLoading?.completed && (
            <div className={styles.nextButtonGroup}>
              {step > 0 && (
                <>
                  <button onClick={handleReset} className={styles.resetButton}>
                    <ReloadOutlined
                      style={{
                        fontSize: "14px",
                        color: "#fff",
                      }}
                    />
                  </button>
                  <button onClick={handleBack} className={styles.backButton}>
                    Previous
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  if (step === totalSlides) {
                    await handleSubmitTicket(
                      formData,
                      attachments,
                      "Resolvers",
                      setSteps,
                      setCurrentStep,
                      setIsLoading
                    );
                  } else {
                    handleNext();
                  }
                }}
                className={
                  step !== totalSlides
                    ? styles.nextButton
                    : styles.nextSubmitButton
                }
              >
                {step === totalSlides ? "Confirm & submit" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketForm;
