import { IFlagCaptureTeams } from "@shared/types";
import { SHARED_CONSTANTS } from "@shared/constants";
import { Tools } from "../../tools";
class Hud {
  private show: boolean = false;
  private mapName: string = "";
  private timer: number = 0;
  private phase: number = 0;
  private flags: Record<IFlagCaptureTeams, number> = {
    red: 0,
    blue: 0,
  };
  private teamSizes: Record<IFlagCaptureTeams, number> = {
    red: 0,
    blue: 0,
  };

  private activeFlag: number | undefined;
  private messages: Record<"uuid" | "message", string>[] = [];

  constructor() {
    mp.events.add("C:Flags:ShowHud", this.showHud.bind(this));
    mp.events.add("C:Flags:UpdateHud", this.setData.bind(this));
    mp.events.add("render", this.render.bind(this));
  }

  private showHud(set: boolean) {
    this.show = set;
  }

  private render() {
    if (!this.show) return;

    // DrawMap
    Tools.drawText2D(this.mapName, [0.5, 0.05]);

    // DrawTimer
    if (this.timer != undefined) {
      Tools.drawText2D(Tools.secondsToMinutes(this.timer), [0.5, 0.1]);
    }
    // DrawFlags
    if (this.flags != undefined) {
      Tools.drawText2D(
        this.flags.blue.toString(),
        [0.3, 0.1],
        [15, 15, 200, 255]
      );
      Tools.drawText2D(
        this.flags.red.toString(),
        [0.7, 0.1],
        [200, 15, 15, 255]
      );
    }
    // DrawMessages
    const lastMessageIndex = this.messages.length - 1;
    let currentY = 0.2;
    this.messages.forEach((message, i) => {
      const y = currentY + (lastMessageIndex - i) * 0.05;
      const scale = 0.5 - (lastMessageIndex - i) * 0.03;
      const opacity = 255 - (lastMessageIndex - i) * 25;

      const clampedOpacity = Math.max(0, Math.min(255, opacity));
      Tools.drawText2D(
        message.message,
        [0.5, y],
        [255, 255, 255, clampedOpacity],
        [scale, scale]
      );
    });

    //DrawCpature
    if (this.activeFlag) {
      Tools.drawText2D(
        `${this.activeFlag.toString()} / ${
          SHARED_CONSTANTS.CAPTURE_MAX_PROGRESS
        }`,
        [0.5, 0.9],
        [255, 255, 255, 255],
        [0.5, 0.5]
      );
    }
  }

  private setData(data: string) {
    const dataObj = JSON.parse(data) as {
      mapName: string;
      timer: number;
      phase: number;
      flags: Record<IFlagCaptureTeams, number>;
      teamSizes: Record<IFlagCaptureTeams, number>;
      activeFlag: number | undefined;
      message: string;
    };
    this.mapName = dataObj.mapName;
    this.timer = dataObj.timer;
    this.phase = dataObj.phase;
    this.flags = dataObj.flags;
    this.teamSizes = dataObj.teamSizes;
    this.activeFlag = dataObj.activeFlag;

    if (dataObj.message) this.addMessage(dataObj.message);
  }

  private addMessage(message: string) {
    this.messages.push({
      uuid: Tools.generateUUID(),
      message: message,
    });

    setTimeout(() => {
      this.messages = this.messages.filter(
        (m) => m.uuid !== this.messages[0].uuid
      );
    }, SHARED_CONSTANTS.MESSAGE_TIMEOUT);
  }
}

export const hud = new Hud();
