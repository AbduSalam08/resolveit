/* eslint-disable @typescript-eslint/no-var-requires */
const saveAs = require("file-saver");
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { sp } from "@pnp/sp/presets/all";
import { IItemAddResult } from "@pnp/sp/items";
import "@pnp/sp/webs";
import {
  SPAddItem,
  SPReadItems,
  SPReadItemUsingId,
  SPUpdateItem,
  SPDeleteItem,
  //   SPAddAttachments,
  SPGetAttachments,
  SPDeleteAttachments,
  batchInsert,
  batchUpdate,
  batchDelete,
} from "../SPServices/SpServices";
import { sp } from "@pnp/sp";
import JSZip from "jszip";

// 🎯 Ticket List Name
const TICKET_LIST_NAME = "IT_Tickets";

// 🟢 **Create Ticket**
export const createTicket = async (
  ticketData: any
): Promise<IItemAddResult> => {
  return await SPAddItem({
    Listname: TICKET_LIST_NAME,
    RequestJSON: ticketData,
  });
};

// 🔵 **Read All Tickets**
export const getAllTickets = async (): Promise<any[]> => {
  return await SPReadItems({
    Listname: TICKET_LIST_NAME,
    Select:
      "ID,Title,Description,Category,Priority,ResolvedDate,Status,AssignedTo/Title,AssignedTo/ID,AssignedTo/EMail,Created,Modified",
    Expand: "AssignedTo",
    Orderby: "Created",
    Orderbydecorasc: false,
  });
};

// 🟠 **Get Ticket by ID**
export const getTicketById = async (ticketID: number): Promise<any> => {
  return await SPReadItemUsingId({
    Listname: TICKET_LIST_NAME,
    SelectedId: ticketID,
    Select:
      "TicketID,Title,Description,Category,Priority,Status,AssignedTo/Title,Created,Modified",
    Expand: "AssignedTo",
  });
};

// 🟡 **Update Ticket**
export const updateTicket = async (
  ticketID: number,
  updateData: any
): Promise<any> => {
  return await SPUpdateItem({
    Listname: TICKET_LIST_NAME,
    ID: ticketID,
    RequestJSON: updateData,
  });
};

// 🔴 **Delete Ticket**
export const deleteTicket = async (ticketID: number): Promise<any> => {
  return await SPDeleteItem({
    Listname: TICKET_LIST_NAME,
    ID: ticketID,
  });
};

// 🔄 **Batch Insert Tickets**
export const batchInsertTickets = async (tickets: any[]): Promise<any> => {
  return await batchInsert({
    ListName: TICKET_LIST_NAME,
    responseData: tickets,
  });
};

// 🔁 **Batch Update Tickets**
export const batchUpdateTickets = async (tickets: any[]): Promise<any> => {
  return await batchUpdate({
    ListName: TICKET_LIST_NAME,
    responseData: tickets,
  });
};

// 🗑️ **Batch Delete Tickets**
export const batchDeleteTickets = async (ticketIDs: number[]): Promise<any> => {
  return await batchDelete({
    ListName: TICKET_LIST_NAME,
    responseData: ticketIDs.map((id) => ({ ID: id })),
  });
};

/**
 * Upload multiple files to SharePoint one by one to avoid 409 conflicts.
 */
export const bulkUploadAttachments = async (
  ticketID: number,
  attachments: any[]
): Promise<void> => {
  const list = sp.web.lists.getByTitle(TICKET_LIST_NAME); // Ensure your list name is correct

  for (const item of attachments) {
    const file = item.originFileObj;
    if (!file) continue;

    try {
      const item = list.items.getById(ticketID);
      const fileArrayBuffer = await file.arrayBuffer(); // Convert file to ArrayBuffer

      // Retry logic to handle 409 conflicts
      let attempts = 0;
      while (attempts < 3) {
        try {
          await item.attachmentFiles.add(file.name, fileArrayBuffer);
          console.log(`✅ Uploaded: ${file.name}`);
          break; // Exit retry loop if successful
        } catch (uploadError: any) {
          if (uploadError.message.includes("Save Conflict") && attempts < 2) {
            console.warn(`🔄 Retry ${attempts + 1} for ${file.name}`);
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay before retry
          } else {
            console.error(`❌ Failed Upload: ${file.name}`, uploadError);
            break;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file.name}:`, error);
    }
  }

  console.log("✅ All attachments uploaded successfully.");
};

// 🖼️ **Attach Files to Ticket**
export const addTicketAttachments = async (
  ticketID: number,
  //   files: File[],
  files: string,
  fileArrayBuffer: any
): Promise<any> => {
  console.log("fileArrayBuffer: ", fileArrayBuffer);
  return await sp.web.lists
    .getByTitle("IT_Tickets")
    .items.getById(ticketID)
    .attachmentFiles.add(files, fileArrayBuffer);
};

// 📂 **Get Attachments of a Ticket**
export const getTicketAttachments = async (
  ticketID: number
): Promise<any[]> => {
  return await SPGetAttachments({
    Listname: TICKET_LIST_NAME,
    ID: ticketID,
  });
};

// ❌ **Delete a Ticket Attachment**
export const deleteTicketAttachment = async (
  ticketID: number,
  fileName: string
): Promise<any> => {
  return await SPDeleteAttachments({
    ListName: TICKET_LIST_NAME,
    ListID: ticketID,
    AttachmentName: fileName,
  });
};

export const getAttachmentofTicket = async (ticketID: number): Promise<any> => {
  try {
    const attachments = await sp.web.lists
      .getByTitle(TICKET_LIST_NAME)
      .items.getById(ticketID)
      .attachmentFiles();
    return attachments;
  } catch (error) {
    console.error("Error retrieving attachments: ", error);
    throw error;
  }
};

/**
 * Downloads files either as a single file (if one file is provided)
 * or as a ZIP archive (if multiple files are provided).
 *
 * @param {string} zipFileName - Name of the ZIP file (if applicable).
 * @param {Array} files - Array of files to download. Each file should be an object with:
 *   - name: The name of the file (e.g., "example.txt").
 *   - content: The URL of the file content.
 */
export const downloadFiles = async (
  zipFileName: string,
  files: any[]
): Promise<void> => {
  if (!files || files.length === 0) {
    console.error("No files provided for download.");
    return;
  }

  if (files.length === 1) {
    // Single file scenario
    const file = files[0];
    try {
      const anchor = document.createElement("a");
      anchor.href = file.content;
      anchor.download = file.name;
      anchor.click();
    } catch (error) {
      console.error("Error downloading single file:", error);
    }
  } else {
    // Multiple files scenario
    const zip = new JSZip();

    for (const file of files) {
      try {
        const response = await fetch(file.content, {
          mode: "cors",
        });
        if (!response.ok) {
          console.error(
            `Failed to fetch file ${file.name}: ${response.statusText}`
          );
          continue;
        }
        const blob = await response.blob();
        zip.file(file.name, blob);
      } catch (error) {
        console.error(`Error adding file ${file.name} to ZIP:`, error);
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, zipFileName || "files.zip");
    } catch (error) {
      console.error("Error generating ZIP file:", error);
    }
  }
};

// ✅ **Export Functions**
export default {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  batchInsertTickets,
  batchUpdateTickets,
  batchDeleteTickets,
  addTicketAttachments,
  getTicketAttachments,
  deleteTicketAttachment,
};
