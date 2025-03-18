/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  Popconfirm,
  Tag,
  Form,
  message,
  Modal,
  Typography,
  Avatar,
} from "antd";
import { Edit, Delete, AttachFile, Check } from "@mui/icons-material";
import CustomTextInput from "../customInputFields/CustomTextInput/CustomTextInput";
import CustomSelect from "../customInputFields/CustomSelect/CustomSelect";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import CustomMultiText from "../customInputFields/CustomMultiText/CustomMultiText";
import { emptyCheck } from "../../../../../utils/validations";
import styles from "./CustomDateTable.module.scss";
import styles1 from "../customTicketForm/TicketForm.module.scss";
import {
  downloadFiles,
  getAttachmentofTicket,
} from "../../../../../services/TicketServices/TicketServicesMain";

/** Define the Ticket interface */
export interface TicketData {
  key: React.Key;
  ticketNumber: number;
  issueDescription: string;
  status: string;
  priority: string;
  category: string;
  resolvedDate: any;
  additionalNotes: string;
  resolverData: any;
}

/** Props for our reusable table */
interface EditableTicketTableProps {
  data: TicketData[];
  onComplete: (record: TicketData | any) => void;
  onDelete: (record: TicketData) => void;
  onSaveEdit: (updatedData: TicketData) => void;
}

const CustomDataTable: React.FC<EditableTicketTableProps> = ({
  data,
  onComplete,
  onDelete,
  onSaveEdit,
}) => {
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState<React.Key | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resolveNotes, setResolveNotes] = useState<{
    data?: TicketData;
    open: boolean;
    value: string;
    isValid: boolean;
    errorMsg: string;
  }>({
    open: false,
    value: "",
    isValid: true,
    errorMsg: "",
  });

  const isEditing = (record: TicketData): boolean => record.key === editingKey;

  /** Edit Function - Set the form with existing values */
  const edit = (record: TicketData): any => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const [editIsLoading, setEditIsLoading] = useState(false);

  /** Save Function - Validate and update data */
  const save = async (key: React.Key): Promise<void> => {
    try {
      setEditIsLoading(true);
      const row = (await form.validateFields()) as TicketData;
      await onSaveEdit({ ...row, key });
      setEditingKey(null);
      setEditIsLoading(false);
    } catch (errInfo) {
      await message.error("Invalid inputs!");
      setEditIsLoading(false);
    }
  };

  /** Cancel Editing */
  const cancel = (): void => {
    setEditingKey(null);
  };

  /** Priority Badge Colors */
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "Low":
        return "green";
      case "Medium":
        return "orange";
      case "High":
        return "red";
      case "Critical":
        return "orange";
      default:
        return "#555";
    }
  };

  /** Editable Cell Component */
  const EditableCell: React.FC<{
    editing: boolean;
    dataIndex: keyof TicketData;
    title: string;
    inputType: "text" | "select";
    record: TicketData;
    children: React.ReactNode;
  }> = ({ editing, dataIndex, inputType, record, children, ...restProps }) => {
    let inputNode;

    if (inputType === "select") {
      const options =
        dataIndex === "category"
          ? [
              { label: "Software", value: "Software" },
              { label: "Hardware", value: "Hardware" },
              { label: "Network", value: "Network" },
              { label: "Others", value: "Others" },
            ]
          : [
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
              { label: "Critical", value: "Critical" },
            ];

      inputNode = (
        <CustomSelect isValid={true} size={"small"} options={options} />
      );
    } else {
      inputNode = <CustomTextInput isValid={true} autoFocus={false} />;
    }

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `field can't be empty`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  /** Define Columns */
  const columns = [
    {
      title: "Ticket no",
      fixed: "left",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
      sorter: (a: TicketData, b: TicketData) => a.ticketNumber - b.ticketNumber,
      sortDirections: ["ascend", "descend"],
      width: 100,
      render: (_: any, record: TicketData) => {
        return (
          <span
            style={{
              color: "#555",
              fontFamily: `'interMedium', sans-serif`,
            }}
          >
            #{record?.ticketNumber}
          </span>
        );
      },
    },
    {
      title: "Issue description",
      dataIndex: "issueDescription",
      key: "issueDescription",
      editable: true,
      inputType: "text",
      width: 160,
      render: (_: any, record: TicketData) => {
        return (
          <Typography.Text
            style={{ width: 160 }}
            ellipsis={{ tooltip: record.issueDescription }}
          >
            {record.issueDescription}
          </Typography.Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (_: any, record: TicketData) => (
        <Tag
          color={record.status === "Resolved" ? "green" : "blue"}
          className="smallTagGlobal"
          style={{
            fontSize: "13px",
            color: record.status === "Resolved" ? "green" : "var(--secondary)",
            width: "fit-content",
            border: "0",
          }}
        >
          {record.status}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      editable: true,
      inputType: "select",
      width: 120,
      render: (_: any, record: TicketData) => (
        <Tag
          color={getPriorityColor(record.priority)}
          className="smallTagGlobal"
          style={{
            fontSize: "13px",
            color: getPriorityColor(record.priority),
            border: "0",
            width: "fit-content",
          }}
        >
          {record.priority}
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      editable: true,
      inputType: "select",
      width: 120,
      render: (_: any, record: TicketData) => (
        <Tag
          // color={`#55555520`}
          className="smallTagGlobal"
          style={{
            fontSize: "13px",
            color: "#555",
            border: "0",
            width: "fit-content",
          }}
        >
          {record.category}
        </Tag>
      ),
    },
    {
      title: "Created on",
      dataIndex: "Created",
      key: "Created",
      editable: false,
      inputType: "select",
      width: 150,
    },
    {
      title: "Resolver",
      dataIndex: "resolvedDate",
      key: "resolvedDate",
      editable: false,
      inputType: "select",
      width: 180,
      render: (_: any, record: TicketData) => {
        return (
          <span>
            {record.resolverData?.ID ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "10px",
                }}
              >
                <Avatar
                  shape="square"
                  size="small"
                  src={`/_layouts/15/userphoto.aspx?size=S&username=${record.resolverData?.EMail}`}
                  style={{
                    borderRadius: "50%",
                  }}
                />
                <Typography.Text
                  style={{ width: 80 }}
                  ellipsis={{ tooltip: record.resolverData?.Title }}
                >
                  {record.resolverData?.Title}
                </Typography.Text>
              </div>
            ) : (
              <Tag
                // color={`#55555520`}
                className="smallTagGlobal"
                style={{
                  fontSize: "13px",
                  color: "#adadad",
                  border: "0",
                  width: "fit-content",
                }}
              >
                unassigned
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      title: "Resolved on",
      dataIndex: "resolvedDate",
      key: "resolvedDate",
      editable: false,
      inputType: "select",
      width: 150,
      render: (_: any, record: TicketData) => {
        return (
          <span>
            {record.resolvedDate === "pending" ? (
              <Tag
                // color={`#55555520`}
                className="smallTagGlobal"
                style={{
                  fontSize: "13px",
                  color: "#adadad",
                  border: "0",
                  width: "fit-content",
                }}
              >
                {record.resolvedDate}
              </Tag>
            ) : (
              record.resolvedDate
            )}
          </span>
        );
      },
    },
    {
      title: "Attachment",
      dataIndex: "attachment",
      key: "attachment",
      editable: false,
      // inputType: "text",
      width: 100,
      render: (_: any, record: TicketData) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "flex-start",
              cursor: "pointer",
            }}
            onClick={async () => {
              const files: any = await getAttachmentofTicket(
                Number(record?.key)
              );
              const mappedFiles: any = files?.map((item: any) => {
                return {
                  name: item?.FileName,
                  content: `${window.location.origin}${item?.ServerRelativeUrl}?web=1`,
                };
              });
              await downloadFiles(
                `${Number(record?.key)} - Attachments`,
                mappedFiles
              );

              if (mappedFiles?.length !== 0) {
                await message.success("Attachment downloaded!");
              } else {
                await message.warning("No Attachments found!");
              }
            }}
          >
            <AttachFile
              style={{
                color: "#414141",
                fontSize: "16px",
                transform: "rotate(40deg)",
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Additional notes",
      dataIndex: "additionalNotes",
      key: "additionalNotes",
      editable: true,
      inputType: "text",
      width: 250,
      render: (_: any, record: TicketData) => {
        return (
          <Typography.Text
            style={{ width: 150 }}
            ellipsis={{ tooltip: record.additionalNotes }}
          >
            {record.additionalNotes}
          </Typography.Text>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      dataIndex: "action",
      width: 200,
      fixed: "right",
      render: (_: any, record: TicketData) => {
        const editable = isEditing(record);
        return editable ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              //   gap: "3px",
              justifyContent: "flex-start",
            }}
          >
            <Tag
              color="#51b36d"
              onClick={() => save(record.key)}
              style={{
                fontSize: "13px",
              }}
              className="smallTagGlobal"
            >
              {editIsLoading && (
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: 13,
                        color: "#fff",
                        marginRight: "5px",
                      }}
                      spin
                    />
                  }
                />
              )}
              save
            </Tag>
            <Popconfirm title="Cancel changes?" onConfirm={cancel}>
              <Tag
                color="#55555520"
                // onClick={() => save(record.key)}
                className="smallTagGlobal"
                style={{
                  color: "#555",
                  fontSize: "13px",
                }}
              >
                close
              </Tag>
            </Popconfirm>
          </span>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                cursor: "pointer",
                backgroundColor: "#eeeeee90",
              }}
              onClick={() => edit(record)}
            >
              <Edit
                style={{
                  color: "#555",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              />
            </div>
            <Popconfirm
              title="Delete this ticket?"
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                  backgroundColor: "#d32f2f15",
                }}
              >
                <Delete
                  style={{
                    color: "var(--critical)",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                />
              </div>
            </Popconfirm>
            {!editable && record.status !== "Completed" && (
              // <Popconfirm
              //   title="Mark as resolved?"
              //   onConfirm={() => {
              //     setResolveNotes((prev: any) => ({
              //       ...prev,
              //       open: false,
              //     }));
              //   }}
              //   okText="Yes"
              //   cancelText="No"
              // >
              <Tag
                color="#51b36d"
                onClick={() => {
                  setResolveNotes((prev: any) => ({
                    ...prev,
                    data: record,
                    open: true,
                  }));
                }}
                className="smallTagGlobal"
              >
                <Check
                  sx={{
                    fontSize: "18px",
                  }}
                />
              </Tag>
              // </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const mergedColumns: any = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: TicketData) => ({
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <Form form={form} component={false}>
        <Table
          size="middle"
          scroll={{ x: 1500, y: 500 }}
          className={"ticketsList"}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          // bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            total: data.length,
            current: currentPage,
            pageSize: 10,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} tickets`,
            onChange: (page: number, pageSize: number) => {
              setCurrentPage(page);
              cancel();
            },
          }}
        />
      </Form>
      <Modal
        open={resolveNotes.open}
        className="ticketModal"
        width={500}
        centered
        footer={null}
        closable={false}
        bodyStyle={{
          padding: "",
        }}
      >
        <div className={styles.popupWrapper}>
          <span className={styles.formTitle}>Resolve notes</span>
          <CustomMultiText
            // onKeyDown={(e: any) => (e.key === "Enter" ? handleNext() : undefined)}
            placeholder={
              "Enter the root cause/how to fix this issue/about this ticket, etc."
            }
            value={resolveNotes.value}
            isValid={resolveNotes.isValid}
            errorMsg={resolveNotes.errorMsg}
            onChange={(e: any) => {
              setResolveNotes((prev: any) => ({
                ...prev,
                value: e.target.value,
                isValid: emptyCheck(e.target.value),
                errorMsg: emptyCheck(e.target.value)
                  ? ""
                  : "This field is required",
              }));
            }}
          />

          <div className={styles.actionBtns}>
            <button
              onClick={async () => {
                setResolveNotes((prev: any) => ({
                  ...prev,
                  open: false,
                  value: "",
                  isValid: true,
                  data: [],
                }));
              }}
              className={styles1.closeButton}
            >
              Close
            </button>
            <button
              onClick={async () => {
                if (emptyCheck(resolveNotes?.value)) {
                  onComplete(resolveNotes);
                  setResolveNotes((prev: any) => ({
                    ...prev,
                    open: false,
                    data: [],
                    errorMsg: "",
                    value: "",
                    isValid: true,
                  }));
                } else {
                  setResolveNotes((prev: any) => ({
                    ...prev,
                    isValid: false,
                    errorMsg: "This field is required",
                  }));
                }
              }}
              className={styles1.nextSubmitButton}
            >
              mark as resolved
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomDataTable;
