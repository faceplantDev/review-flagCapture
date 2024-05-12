import { Flag } from "@/src/modules/flagsCapture/classes/flag";

declare global {
  var globalVariables: GlobalVariables
}

declare interface IServerEvents {}

export class ColshapeMpExtended extends ColshapeMp {
  flagInfo: Flag
}

export {};


