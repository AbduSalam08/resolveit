/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { sp } from "@pnp/sp";
import { assignResolver } from "../services/TicketServices/TicketAssignment";
import {
  updateTicket,
  deleteTicket,
  //   addTicketAttachments,
  bulkUploadAttachments,
  getAllTickets,
} from "../services/TicketServices/TicketServicesMain";

interface FormField {
  value: string;
  isValid: boolean;
  errorMsg: string;
}

/**
 * Validates form data and returns whether it's valid.
 */
export const validateFormData = (
  formData: Record<string, FormField>
): boolean => {
  let isValid = true;
  const updatedFormData = { ...formData };

  Object.keys(updatedFormData).forEach((key) => {
    if (!updatedFormData[key].isValid) {
      isValid = false;
      updatedFormData[key].errorMsg = "This field is required";
    }
  });

  return isValid;
};

/**
 * Submits a new ticket to SharePoint.
 */

export const handleSubmitTicket = async (
  formData: any,
  attachments: any[],
  groupName: string,
  setSteps: any,
  setCurrentStep: any,
  setIsLoading: any
): Promise<any> => {
  try {
    setIsLoading({
      loading: true,
      completed: false,
    });
    setCurrentStep(0);

    const issueName = formData.issueDescription.value || "your request";

    const stepsData = [
      {
        step: "Creating Ticket",
        status: "Logging your issue...",
        completed: false,
      },
      {
        step: "Finding Resolver",
        status: "Scanning the IT desk...",
        completed: false,
      },
      {
        step: "Assigning Resolver",
        status: "Assigning the best expert...",
        completed: false,
      },
      ...(attachments.length > 0
        ? [
            {
              step: "Uploading Files",
              status: "Uploading attachments...",
              completed: false,
            },
          ]
        : []),
      {
        step: "Completion",
        status: "Finalizing the process...",
        completed: false,
      },
    ];
    setSteps(stepsData);

    // Step 1: Creating Ticket
    setCurrentStep(0);
    const ticketData = {
      Title: issueName,
      Description: formData.issueDescription.value,
      Category: formData.ticketCategory.value,
      Priority: formData.priority.value,
      Status: "Open",
      AssignedToId: null,
    };
    const response = await sp.web.lists
      .getByTitle("IT_Tickets")
      .items.add(ticketData);
    const ticketID = response.data.Id;
    setSteps((prev: any) =>
      prev.map((s: any, i: number) =>
        i === 0 ? { ...s, status: "Ticket created!", completed: true } : s
      )
    );

    // Step 2: Finding Resolver
    setCurrentStep(1);
    setSteps((prev: any) =>
      prev.map((s: any, i: number) =>
        i === 1
          ? { ...s, status: "Found the right expert!", completed: true }
          : s
      )
    );

    // Step 3: Assigning Resolver
    setCurrentStep(2);
    const assignedResolver = await assignResolver(ticketID, groupName);
    setSteps((prev: any) =>
      prev.map((s: any, i: number) =>
        i === 2
          ? {
              ...s,
              status: `Assigned to ${assignedResolver.name}!`,
              completed: true,
            }
          : s
      )
    );

    // Step 4: Uploading Attachments (If Any)
    if (attachments.length > 0) {
      setCurrentStep(3);
      await bulkUploadAttachments(ticketID, attachments);
      setSteps((prev: any) =>
        prev.map((s: any, i: number) =>
          i === 3 ? { ...s, status: "Files uploaded!", completed: true } : s
        )
      );
    }

    // Final Step: Completion
    setCurrentStep(stepsData?.length - 1);

    setSteps((prev: any) =>
      prev.map((s: any, i: number) =>
        i === prev.length - 1
          ? {
              ...s,
              status: "All set! Your request is now in progress.",
              completed: true,
            }
          : s
      )
    );

    setIsLoading({
      loading: true,
      completed: true,
      data: {
        ticketID: ticketID,
        resolver: assignedResolver.name,
      },
    });
  } catch (error) {
    setSteps((prev: any) =>
      prev.map((s: any) => ({
        ...s,
        completed: false,
        status: "❌ Something went wrong!",
      }))
    );
    setIsLoading({
      loading: false,
      completed: false,
    });
    console.error(`❌ Error Creating Ticket:`, error);
  }
};

/**
 * Updates an existing ticket.
 */
export const updateTicketDetails = async (
  ticketID: number,
  formData: Record<string, FormField>,
  attachments: File[]
): Promise<void> => {
  if (!validateFormData(formData)) return;

  const updatedData: any = {};

  Object.keys(formData).forEach((key) => {
    if (formData[key].value.trim() !== "") {
      updatedData[key] = formData[key].value;
    }
  });

  try {
    // ✅ Update Ticket in SharePoint
    await updateTicket(ticketID, updatedData);

    // ✅ Upload Attachments (if any)
    if (attachments.length > 0) {
      console.log("update attachment is pending");
      //   await addTicketAttachments(ticketID, attachments);
    }

    console.log("✅ Ticket Updated Successfully");
  } catch (error) {
    console.error("❌ Error Updating Ticket:", error);
  }
};

/**
 * Deletes a ticket from SharePoint.
 */
export const deleteTicketById = async (ticketID: number): Promise<void> => {
  try {
    await deleteTicket(ticketID);
    console.log(`✅ Ticket ID ${ticketID} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting Ticket ID ${ticketID}:`, error);
  }
};

// Get filtered values
export const fetchFilteredValues = async (
  setTicketProperties: any
): Promise<void> => {
  try {
    const allTickets = await getAllTickets();
    console.log("All Tickets: ", allTickets);

    if (!allTickets || allTickets.length === 0) {
      setTicketProperties({
        totalTickets: 0,
        latestTicketNumber: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,

        highPriorityTickets: 0,
        mediumPriorityTickets: 0,
        lowPriorityTickets: 0,
        criticalPriorityTickets: 0,

        networkIssues: 0,
        softwareIssues: 0,
        hardwareIssues: 0,
        otherIssues: 0,

        workloadPercentage: 0,
        resolutionRate: 0,
        averageResolutionTime: 0,
      });
      return;
    }

    const totalTickets = allTickets.length;
    const latestTicketNumber =
      Math.max(...allTickets.map((t: any) => t.ID), 0) + 1;

    // **Ticket Status Counts**
    const openTickets = allTickets.filter(
      (t: any) => t.Status?.toLowerCase() === "open"
    ).length;
    const inProgressTickets = allTickets.filter(
      (t: any) => t.Status?.toLowerCase() === "in progress"
    ).length;
    const resolvedTickets = allTickets.filter(
      (t: any) => t.Status?.toLowerCase() === "resolved"
    ).length;

    // **Priority Counts**
    const highPriorityTickets = allTickets.filter(
      (t: any) => t.Priority?.toLowerCase() === "high"
    ).length;
    const mediumPriorityTickets = allTickets.filter(
      (t: any) => t.Priority?.toLowerCase() === "medium"
    ).length;
    const lowPriorityTickets = allTickets.filter(
      (t: any) => t.Priority?.toLowerCase() === "low"
    ).length;
    const criticalPriorityTickets = allTickets.filter(
      (t: any) => t.Priority?.toLowerCase() === "critical"
    ).length;

    // **Category Counts**
    const networkIssues = allTickets.filter(
      (t: any) => t.Category?.toLowerCase() === "network"
    ).length;
    const softwareIssues = allTickets.filter(
      (t: any) => t.Category?.toLowerCase() === "software"
    ).length;
    const hardwareIssues = allTickets.filter(
      (t: any) => t.Category?.toLowerCase() === "hardware"
    ).length;
    const otherIssues = allTickets.filter(
      (t: any) => t.Category?.toLowerCase() === "others"
    ).length;

    // **Workload & Efficiency Calculations**
    const workloadPercentage = totalTickets
      ? Math.round((inProgressTickets / totalTickets) * 100)
      : 0;
    const resolutionRate = totalTickets
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

    // **Calculate Average Resolution Time Using Created & ResolvedDate**
    const resolvedTicketsWithDates = allTickets.filter(
      (t: any) =>
        t.Status?.toLowerCase() === "resolved" && t.Created && t.ResolvedDate
    );

    const totalResolutionTime = resolvedTicketsWithDates.reduce(
      (sum, ticket) => {
        const createdDate = dayjs(ticket.Created);
        const resolvedDate = dayjs(ticket.ResolvedDate);

        // Ensure both dates are valid before proceeding
        if (createdDate.isValid() && resolvedDate.isValid()) {
          return sum + resolvedDate.diff(createdDate, "days");
        }
        return sum;
      },
      0
    );

    const averageResolutionTime = resolvedTicketsWithDates.length
      ? Math.round(totalResolutionTime / resolvedTicketsWithDates.length)
      : 0;

    setTicketProperties({
      totalTickets,
      latestTicketNumber,
      openTickets,
      inProgressTickets,
      resolvedTickets,

      highPriorityTickets,
      mediumPriorityTickets,
      lowPriorityTickets,
      criticalPriorityTickets,

      networkIssues,
      softwareIssues,
      hardwareIssues,
      otherIssues,

      workloadPercentage,
      resolutionRate,
      averageResolutionTime,
    });
  } catch (error) {
    console.error("Error fetching ticket data:", error);
  }
};

import * as XLSX from "xlsx";
// import { SPReadItems } from "../services/SPServices/SpServices";

/**
 * Exports a SharePoint list to an Excel file and uploads/replaces it in a document library folder.
 * Handles locked files by checking in before replacing.
 */
export const exportListToExcelAndUpload = async (
  listTitle: string,
  libraryName: string = "Shared Documents", // ✅ Ensure correct document library name
  folderName: string = "TicketSource",
  fileName: string = "IT_Tickets.xlsx"
): Promise<void> => {
  try {
    console.log("🔹 Fetching list data...");
    // 1️⃣ Fetch all list items
    const items = await sp.web.lists
      .getByTitle(listTitle)
      .items.select("*")
      .get();

    // const items = await SPReadItems({
    //   Listname: listTitle,
    //   Select:
    //     "ID,Title,Description,Category,Priority,ResolvedDate,Status,AssignedTo/Title,AssignedTo/ID,AssignedTo/EMail,Created,Modified",
    //   Expand: "AssignedTo",
    //   Orderby: "Created",
    //   Orderbydecorasc: false,
    // });

    if (!items || items.length === 0) {
      console.warn("⚠ No data found in the list.");
      return;
    }

    // console.log("✅ List data retrieved successfully.");

    // 2️⃣ Convert list data to Excel format
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert workbook to binary data
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // console.log("✅ Excel file created successfully.");

    // 3️⃣ Define the correct file path (server-relative URL)
    const fileServerRelativeUrl = `/sites/ResolveIT/${libraryName}/${folderName}/${fileName}`;
    // console.log(`🔍 Checking if file exists: ${fileServerRelativeUrl}`);

    // 4️⃣ Check if the file exists
    let fileExists = false;
    try {
      await sp.web
        .getFileByServerRelativeUrl(fileServerRelativeUrl)
        .select("Exists")
        .get();
      fileExists = true;
    } catch (error) {
      fileExists = false; // File does not exist
    }

    // 5️⃣ If the file exists, check out and check in to release lock
    if (fileExists) {
      // console.log("📂 File exists, checking for locks...");

      try {
        // 🔹 Check out the file to release any locks
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .checkout();
        // console.log("🔓 File checked out to unlock.");

        // 🔹 Replace the file
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .setContent(fileBlob);
        console.log("✅ File replaced successfully!");

        // 🔹 Check in the file after replacing
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .checkin("Updated file", 1);
        // console.log("✅ File checked in successfully!");
      } catch (lockError) {
        console.error("❌ Unable to unlock the file:", lockError);
        return;
      }
    } else {
      // console.log("📂 File does not exist, uploading new file...");
      await sp.web
        .getFolderByServerRelativeUrl(
          `/sites/ResolveIT/${libraryName}/${folderName}`
        )
        .files.add(fileName, fileBlob, true);
      console.log("✅ File uploaded successfully!");
    }
  } catch (error) {
    console.error("❌ Error exporting list to Excel:", error);
  }
};

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Exports a SharePoint list to a PDF file and uploads/replaces it in a document library folder.
 * @param listTitle - Name of the SharePoint list
 * @param libraryName - Name of the document library (e.g., 'Shared Documents')
 * @param folderName - Folder inside the document library (e.g., 'TicketSource')
 * @param fileName - Name of the PDF file (default: 'IT_Tickets.pdf')
 */
export const exportListToPdfAndUpload = async (
  listTitle: string,
  libraryName: string = "Shared Documents",
  folderName: string = "TicketSource",
  fileName: string = "IT_Tickets.pdf"
): Promise<void> => {
  try {
    console.log("🔹 Fetching list data...");
    // 1️⃣ Fetch all list items
    const items = await sp.web.lists
      .getByTitle(listTitle)
      .items.select(
        "ID,Title,Description,Category,Priority,Status,AssignedTo/Title,Created,ResolvedDate,ResolutionNotes,Author/Title"
      )
      .expand("AssignedTo, Author")
      .get();

    if (!items || items.length === 0) {
      console.warn("⚠ No data found in the list.");
      return;
    }

    console.log("✅ List data retrieved successfully.");

    // 2️⃣ Create a new PDF document
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("IT Ticket Report", 105, 15, { align: "center" });

    // Metadata
    doc.setFontSize(10);
    const generatedDate = new Date().toLocaleString();
    doc.text(`Generated On: ${generatedDate}`, 15, 25);

    // 3️⃣ Prepare Table Data
    const tableData = items.map((item, index) => [
      index + 1, // Serial Number
      item.ID,
      item.Title,
      item.Description,
      item.Category || "N/A",
      item.Priority || "N/A",
      item.Status || "N/A",
      item.AssignedTo?.Title || "Unassigned",
      new Date(item.Created).toLocaleDateString(),
      item.ResolvedDate
        ? new Date(item.ResolvedDate).toLocaleDateString()
        : "Pending",
      item.ResolutionNotes || "N/A",
      item.Author.Title || "N/A",
    ]);

    // Define Table Columns
    const tableColumns = [
      "#",
      "Ticket ID",
      "Title",
      "Description",
      "Category",
      "Priority",
      "Status",
      "Resolver",
      "Created",
      "Resolved",
      "Notes",
    ];

    // 4️⃣ Generate the table in the PDF
    autoTable(doc, {
      startY: 30,
      head: [tableColumns],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // 5️⃣ Convert PDF to Blob
    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });

    console.log("✅ PDF file created successfully.");

    // 6️⃣ Define the correct file path (server-relative URL)
    const fileServerRelativeUrl = `/sites/ResolveIT/${libraryName}/${folderName}/${fileName}`;
    console.log(`🔍 Checking if file exists: ${fileServerRelativeUrl}`);

    // 7️⃣ Check if the file exists
    let fileExists = false;
    try {
      await sp.web
        .getFileByServerRelativeUrl(fileServerRelativeUrl)
        .select("Exists")
        .get();
      fileExists = true;
    } catch (error) {
      fileExists = false; // File does not exist
    }

    // 8️⃣ If the file exists, check out and check in to release lock
    if (fileExists) {
      console.log("📂 File exists, checking for locks...");

      try {
        // 🔹 Check out the file to unlock if needed
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .checkout();
        console.log("🔓 File checked out to unlock.");

        // 🔹 Replace the file
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .setContent(pdfBlob);
        console.log("✅ File replaced successfully!");

        // 🔹 Check in the file after replacing
        await sp.web
          .getFileByServerRelativeUrl(fileServerRelativeUrl)
          .checkin("Updated file", 1);
        console.log("✅ File checked in successfully!");
      } catch (lockError) {
        console.error("❌ Unable to unlock the file:", lockError);
        return;
      }
    } else {
      console.log("📂 File does not exist, uploading new file...");
      await sp.web
        .getFolderByServerRelativeUrl(
          `/sites/ResolveIT/${libraryName}/${folderName}`
        )
        .files.add(fileName, pdfBlob, true);
      console.log("✅ PDF file uploaded successfully!");
    }
  } catch (error) {
    console.error("❌ Error exporting list to PDF:", error);
  }
};
