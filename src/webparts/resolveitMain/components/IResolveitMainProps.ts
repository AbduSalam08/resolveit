import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IResolveitMainProps {
  context: WebPartContext;
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
