/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from "@pnp/sp/presets/all";

// Fetch all resolvers from M365 group
export const getResolversFromGroup = async (
  groupName: string
): Promise<any[]> => {
  const users = await sp.web.siteGroups.getByName(groupName).users();
  return users.map((user) => ({
    id: user.Id,
    name: user.Title,
    email: user.Email,
  }));
};

// Fetch all assigned tickets from IT_Tickets List
export const getAllResolversData = async (): Promise<any[]> => {
  const tickets = await sp.web.lists
    .getByTitle("IT_Tickets")
    .items.select("AssignedTo/Id")
    .expand("AssignedTo")();
  const resolverCounts: Record<number, number> = {};

  tickets.forEach((ticket) => {
    const resolverId = ticket.AssignedTo?.Id;
    if (resolverId) {
      resolverCounts[resolverId] = (resolverCounts[resolverId] || 0) + 1;
    }
  });

  return Object.keys(resolverCounts).map((id) => ({
    id: parseInt(id),
    ticketCount: resolverCounts[parseInt(id)],
  }));
};

// Get unassigned resolvers by comparing with existing tickets
export const getUnassignedResolvers = async (
  groupName: string
): Promise<any[]> => {
  const resolvers = await getResolversFromGroup(groupName);
  const assignedResolvers = await getAllResolversData();
  const assignedIds = assignedResolvers.map((r) => r.id);

  return resolvers.filter((resolver) => !assignedIds.includes(resolver.id));
};

// Assign resolver based on ticket count & alphabetical order
export const assignResolver = async (
  ticketID: number,
  groupName: string
): Promise<any> => {
  const resolvers = await getResolversFromGroup(groupName);
  const resolverTickets = await getAllResolversData();

  // Merge resolver data with ticket counts
  const resolverList = resolvers.map((resolver) => {
    const ticketData = resolverTickets.find((r) => r.id === resolver.id);
    return {
      id: resolver.id,
      name: resolver.name,
      ticketCount: ticketData ? ticketData.ticketCount : 0,
    };
  });

  // Sorting Logic: Least tickets first, then alphabetical
  resolverList.sort(
    (a, b) => a.ticketCount - b.ticketCount || a.name.localeCompare(b.name)
  );

  // Pick the best resolver (first in the sorted list)
  const selectedResolver = resolverList[0];

  // Update SharePoint List with assigned resolver
  await sp.web.lists.getByTitle("IT_Tickets").items.getById(ticketID).update({
    AssignedToId: selectedResolver.id,
  });

  return selectedResolver;
};
