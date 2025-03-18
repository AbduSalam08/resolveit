/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button, Checkbox, message, Modal, Progress, Tag } from "antd";
import TopBar from "../../webparts/resolveitMain/components/common/topBar/TopBar";
import TicketForm from "../../webparts/resolveitMain/components/common/customTicketForm/TicketForm";
import CustomDataTable, {
  TicketData,
} from "../../webparts/resolveitMain/components/common/customDataTable/CustomDataTable";
import {
  deleteTicket,
  getAllTickets,
  updateTicket,
} from "../../services/TicketServices/TicketServicesMain";
import styles from "./MyTickets.module.scss";
import CustomTextInput from "../../webparts/resolveitMain/components/common/customInputFields/CustomTextInput/CustomTextInput";
import {
  exportListToPdfAndUpload,
  fetchFilteredValues,
} from "../../utils/TicketUtils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const MyTickets = (): JSX.Element => {
  const [open, setOpen] = React.useState(false);

  const handleClose = (): void => {
    setOpen(false);
  };

  const [tickets, setTickets] = useState<TicketData[]>([]);

  const fetchAllTickets = async (): Promise<void> => {
    const allTickets = await getAllTickets();
    console.log("allTickets: ", allTickets);
    const tickets: TicketData[] = allTickets?.map((ticket: any) => ({
      key: ticket.Id,
      Created: `${dayjs(ticket.Created).format("DD MMM YYYY")}`,
      ticketNumber: ticket.Id,
      issueDescription: ticket.Title,
      status: ticket.Status,
      priority: ticket.Priority,
      category: ticket.Category,
      additionalNotes: ticket.Description,
      resolverData: ticket.AssignedTo,
      resolvedDate: ticket.ResolvedDate
        ? dayjs(ticket.ResolvedDate).format("DD MMM YYYY")
        : "pending",
      createdDateText: dayjs(ticket.Created, "DD/MM/YYYY").fromNow(),
    }));
    setTickets(tickets);
  };

  const [ticketProperties, setTicketProperties] = useState<{
    totalTickets: number | string | any;
    latestTicketNumber: number | string | any;
    openTickets: number | string | any;
    inProgressTickets: number | string | any;
    resolvedTickets: number | string | any;
    // priority base
    highPriorityTickets: number | string | any;
    mediumPriorityTickets: number | string | any;
    lowPriorityTickets: number | string | any;
    criticalPriorityTickets: number | string | any;
    // category base
    networkIssues: number | string | any;
    softwareIssues: number | string | any;
    hardwareIssues: number | string | any;
    otherIssues: number | string | any;
    // extras
    workloadPercentage: number | string | any;
    resolutionRate: number | string | any;
    averageResolutionTime: number | string | any;
  }>();

  const handleComplete = async (record: any): Promise<void> => {
    const key = "updating";
    message.loading({ content: "Updating changes!", key });
    await updateTicket(Number(record.data.key), {
      Status: "Resolved",
      ResolutionNotes: record?.value,
      ResolvedDate: dayjs(new Date()),
    });
    await fetchAllTickets();
    message.success({ content: "Ticket marked as resolved!", key });
  };

  const handleDelete = async (record: TicketData): Promise<void> => {
    await deleteTicket(Number(record.key));
    await fetchAllTickets();
    message.success(
      `Ticket #${record.ticketNumber} has been deleted successfully!`
    );
  };

  useEffect(() => {
    (async () => {
      await fetchAllTickets();
      await fetchFilteredValues(setTicketProperties);
    })();
  }, []);

  return (
    <div>
      <TopBar />
      <div className="iwrap">
        <div>
          <span>✨ Ask ResolveIT Copilot!</span>
          <span className="subtext">
            An <strong>AI Powered Ticketing system</strong> in SPFX
          </span>
        </div>
        <iframe
          src="https://copilotstudio.microsoft.com/environments/Default-3e8e53be-a48f-4147-adf8-7e90a6e46b57/bots/cr5a7_resolveIt/webchat?__version__=2"
          // frameborder="0"
          style={{ width: "70%", height: "330px" }}
        />
      </div>
      <div className={styles.myTicketsWrapper}>
        <div className={styles.dtWrapperMain}>
          <div className={styles.Header}>
            <div className={styles.flexCenter}>
              <span className={styles.headerTitle}>All tickets</span>
              <Tag
                color="#adadad20"
                style={{
                  color: "#555",
                  cursor: "default",
                }}
                className="smallTagGlobal"
              >
                {tickets?.length || "0"} ticket(s) found
              </Tag>
            </div>

            <div className={styles.filtersGroup}>
              <Checkbox
                className="manualCbx"
                onChange={(e: any) => {
                  console.log("e: ", e.target.check);
                  if (!e.target.checked) {
                    fetchAllTickets();
                  } else {
                    const filterdata = tickets?.filter(
                      (item: any) => item?.priority === "High"
                    );
                    setTickets(filterdata);
                  }
                }}
                style={{
                  // width: "220px",
                  fontSize: "13px",
                  marginTop: "-5px",
                  color: "#555",
                }}
              >
                High Prority
              </Checkbox>
              <Checkbox
                className="manualCbx"
                onChange={(e: any) => {
                  console.log("e: ", e.target.check);
                  if (!e.target.checked) {
                    fetchAllTickets();
                  } else {
                    const filterdata = tickets?.filter(
                      (item: any) => item?.priority === "Critical"
                    );
                    setTickets(filterdata);
                  }
                }}
                style={{
                  // width: "220px",
                  fontSize: "13px",
                  marginTop: "-5px",
                  color: "#555",
                }}
              >
                Critical
              </Checkbox>
              <div
                style={{
                  width: "200px",
                }}
              >
                <CustomTextInput
                  autoFocus={false}
                  placeholder="Search issues"
                  onChange={(e) => {
                    if (e.target.value?.length === 0) {
                      fetchAllTickets();
                    } else {
                      const filterdata = tickets?.filter((item: any) =>
                        item?.issueDescription
                          ?.toLowerCase()
                          ?.includes(e?.target.value)
                      );
                      setTickets(filterdata);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className={styles.dtWrapper}>
            <CustomDataTable
              onSaveEdit={async (record) => {
                await updateTicket(Number(record.key), {
                  Title: record.issueDescription,
                  Status: record.status,
                  Priority: record.priority,
                  Category: record.category,
                  Description: record.additionalNotes,
                });
                await fetchAllTickets();
                // await exportListToExcelAndUpload("IT_Tickets");
                await exportListToPdfAndUpload("IT_Tickets");
                message.success("Ticket changes saved!");
              }}
              data={tickets}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          </div>
        </div>

        <div className={styles.leftUtils}>
          <div
            className={styles.newTicketBanner}
            onClick={() => {
              setOpen(true);
            }}
          >
            <div className={styles.textim}>
              <span className={styles.headText}>
                Having any issue?
                <Button
                  onClick={() => {
                    setOpen(true);
                  }}
                  size="small"
                  type="primary"
                  className="newTicketBtn"
                  style={{
                    backgroundColor: "#fff",
                    color: "var(--primary)",
                    fontSize: "13px",
                    fontFamily: '"interMedium",sans-serif',
                  }}
                >
                  raise a ticket
                </Button>
              </span>
              <span className={styles.secondaryPara}>
                Raise your issue as a ticket & get resolved by our IT experts
                using AI ✨
              </span>
            </div>
          </div>
          <div className={styles.detailsSection}>
            {/* <span className={styles.mainLabel}>Have a look on this</span> */}
            <div className={styles.s1}>
              <span className={styles.title}>
                In progress tickets ({ticketProperties?.inProgressTickets || 0})
              </span>
              <div className={styles.percentage}>
                <Progress percent={30} size="small" />
              </div>
            </div>
            <div className={styles.s3}>
              <span className={styles.title}>Open tickets</span>
              <div className={styles.percentage}>
                {/* 99% */}
                <Progress percent={80} size="small" />
              </div>
            </div>
            <div className={styles.s4}>
              <span className={styles.title}>Resolved</span>
              <div className={styles.percentage}>
                <Progress percent={100} size="small" />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                marginTop: "10px",
              }}
            >
              <div className={styles.s4}>
                <span className={styles.title}>Response range</span>
                <div
                  className={styles.percentage}
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <Progress type="circle" percent={65} />
                </div>
              </div>
              <div className={styles.s4}>
                <span className={styles.title}>Resolving quality</span>
                <div
                  className={styles.percentage}
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <Progress
                    type="circle"
                    percent={80}
                    strokeColor={"#52c41a"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={""}
        open={open}
        className="ticketModal"
        // onOk={handleOk}
        // onCancel={handleClose}
        width={500}
        footer={null}
        closable={false}
        bodyStyle={{
          padding: "0",
        }}
      >
        <TicketForm
          ticketNumber={ticketProperties?.latestTicketNumber}
          onClosePopup={handleClose}
          fetchTickets={fetchAllTickets}
        />
      </Modal>
    </div>
  );
};

export default MyTickets;
