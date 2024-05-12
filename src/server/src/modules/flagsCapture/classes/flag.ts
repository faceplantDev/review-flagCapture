import { Tools } from "../../tools";
import { TeamController } from "../controllers/teamController";
import { IFlagCaptureTeams } from "@shared/types";
import { SHARED_CONSTANTS } from "@shared/constants";
import { FlagCaptureHandlers } from "./handlers";

export class Flag {
  private captureProgress: number = 0;
  private teamsProgress: Record<"red" | "blue", number> = {
    red: 0,
    blue: 0,
  };
  private marker!: MarkerMp;
  private blip!: BlipMp;
  private colshape!: ColshapeMp;
  private captureInterval: NodeJS.Timeout | undefined;
  private playersInside: Record<"owners" | "attackers", PlayerMp[]> = {
    owners: [],
    attackers: [],
  };

  constructor(
    public readonly name: string,
    public position: Vector3,
    public team: IFlagCaptureTeams | undefined
  ) {
    this.createBlip();
    this.createMarker();
    this.createColshape();
  }

  public getProgress(player: PlayerMp) {
    if (FlagCaptureHandlers.lobby == null)
      throw new Error("Lobby is not created");
    if (this.team == undefined) {
      if (player != undefined) {
        const team =
          FlagCaptureHandlers.lobby!.teamsController.getPlayerTeam(player);
        if (team == undefined) throw new Error("Player is not in a team");
        return this.teamsProgress[team];
      }
    }

    return this.captureProgress;
  }
  private createMarker() {
    if (mp.markers.exists(this.marker)) this.marker.destroy();

    const color = TeamController.getColor(this.team);
    const { type, scale, rotation } = SHARED_CONSTANTS.MARKER_PARAMS;
    this.marker = mp.markers.new(type, this.position, scale, {
      color,
      rotation: Tools.xyzToMpVector3(rotation),
    });
  }

  private createBlip() {
    if (mp.blips.exists(this.blip)) this.blip.destroy();

    const color = TeamController.getColorInt(this.team);
    const { type, scale, name } = SHARED_CONSTANTS.BLIP_PARAMS;
    this.blip = mp.blips.new(type, this.position, {
      shortRange: true,
      scale,
      color,
      name: `${Tools.capitalizeFirstLetter(this.team as string)} ${name}`,
    });
  }

  private createColshape() {
    this.colshape = mp.colshapes.newCircle(
      this.position.x,
      this.position.y,
      SHARED_CONSTANTS.MARKER_PARAMS.scale
    );
    this.colshape.data = this;
  }

  private stopInterval() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }
  }

  private everyTick() {
    if (!mp.markers.exists(this.marker) || FlagCaptureHandlers.lobby != null) {
      this.destroy();
      return;
    }
    if (this.team != undefined) {
      const enemy = this.playersInside.attackers.length;
      const owner = this.playersInside.owners.length;

      let progressChange: number = 0;

      if (enemy == 0 && owner == 0) {
        progressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
      }

      if (enemy != 0 && owner == 0) {
        progressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        progressChange =
          progressChange *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, enemy);
      }

      if (enemy != 0 && owner != 0) {
        let weight = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        let enemyWeight =
          weight *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, enemy);
        let ownerWeight =
          weight *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, owner);

        progressChange = enemyWeight + ownerWeight;
      }

      if (enemy == 0 && owner != 0) {
        let playersWeight = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        progressChange = -(
          playersWeight *
            Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, owner) +
          SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE
        );
      }

      if (enemy > owner && owner != 0) {
        progressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        progressChange =
          progressChange *
          Math.pow(
            SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
            enemy - owner
          );
      }

      if (owner > enemy && enemy != 0) {
        progressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        progressChange = -(
          progressChange *
            Math.pow(
              SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
              owner - enemy
            ) +
          SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE
        );
      }

      progressChange = parseFloat(progressChange.toFixed(2));

      this.captureProgress += progressChange;

      if (this.captureProgress > SHARED_CONSTANTS.CAPTURE_MAX_PROGRESS) {
        this.teamTakesFlag(TeamController.getEnemyTeam(this.team));
      }

      if (this.captureProgress <= 0) {
        this.stopInterval();
      }
    } else {
      const redTeam = this.playersInside.attackers
        .map(
          (player) =>
            FlagCaptureHandlers.lobby?.teamsController.getPlayerTeam(player) ===
            "red"
        )
        .filter((e) => e != undefined).length;
      const blueTeam = this.playersInside.attackers
        .map(
          (player) =>
            FlagCaptureHandlers.lobby?.teamsController.getPlayerTeam(player) ===
            "blue"
        )
        .filter((e) => e != undefined).length;

      let redProgressChange: number = 0;
      let blueProgressChange: number = 0;

      if (redTeam == 0) {
        redProgressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
      }

      if (blueTeam == 0) {
        blueProgressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
      }

      if (redTeam != 0) {
        redProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        redProgressChange =
          redProgressChange *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, redTeam);
      }

      if (blueTeam != 0) {
        blueProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        blueProgressChange =
          blueProgressChange *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, redTeam);
      }

      if (blueTeam == redTeam) {
        redProgressChange = 0;
        blueProgressChange = 0;
      }

      if (redTeam > blueTeam && blueTeam != 0) {
        blueProgressChange = 0;
        redProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        redProgressChange =
          redProgressChange *
          Math.pow(
            SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
            redTeam - blueTeam
          );
      }

      if (blueTeam > redTeam && redTeam != 0) {
        redProgressChange = 0;
        blueProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        blueProgressChange =
          blueProgressChange *
          Math.pow(
            SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
            blueTeam - redTeam
          );
      }

      blueProgressChange = parseFloat(blueProgressChange.toFixed(2));
      redProgressChange = parseFloat(redProgressChange.toFixed(2));

      this.teamsProgress = {
        red: this.teamsProgress.red + redProgressChange,
        blue: this.teamsProgress.blue + blueProgressChange,
      };

      if (this.teamsProgress.red > SHARED_CONSTANTS.CAPTURE_MAX_PROGRESS) {
        this.teamTakesFlag("red");
      }

      if (this.teamsProgress.blue > SHARED_CONSTANTS.CAPTURE_MAX_PROGRESS) {
        this.teamTakesFlag("blue");
      }

      if (this.teamsProgress.red <= 0 && this.teamsProgress.blue <= 0) {
        this.stopInterval();
      }
    }

    FlagCaptureHandlers.lobby!.teamsController.updateHud();
  }

  public getPosition() {
    return this.marker.position;
  }

  public playerEnter(player: PlayerMp) {
    if (!FlagCaptureHandlers.lobby) return;

    const targetTeam =
      FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player);
    if (targetTeam === this.team) {
      this.playersInside.owners.push(player);
    } else if (targetTeam != undefined) {
      this.playersInside.attackers.push(player);
    }

    if (
      this.playersInside.attackers.length >= 1 &&
      this.captureInterval == undefined
    ) {
      this.captureInterval = setInterval(
        () => this.everyTick.bind(this),
        SHARED_CONSTANTS.CAPTURE_INTERVAL
      );
      if (this.team != undefined) {
        FlagCaptureHandlers.lobby!.teamsController.updateHud({
          message: `Враг начал захват нашей точки ${this.name}`,
          team: this.team,
        });

        FlagCaptureHandlers.lobby!.teamsController.updateHud({
          message: `Мы начинаем захват точки ${this.name}`,
          team: TeamController.getEnemyTeam(this.team),
        });
      }
    }

    if (
      this.playersInside.owners.length >= 1 &&
      this.captureInterval == undefined &&
      this.captureProgress != 0
    ) {
      this.captureInterval = setInterval(
        () => this.everyTick.bind(this),
        SHARED_CONSTANTS.CAPTURE_INTERVAL
      );
    }
  }

  public playerLeaveOrDead(player: PlayerMp) {
    if (!FlagCaptureHandlers.lobby) return;

    const targetTeam =
      FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player);
    if (targetTeam === this.team) {
      this.playersInside.owners = this.playersInside.owners.filter(
        (player) => player != player
      );
    } else if (targetTeam != undefined) {
      this.playersInside.attackers = this.playersInside.attackers.filter(
        (player) => player != player
      );
    }

    if (
      this.playersInside.attackers.length >= 1 &&
      this.captureInterval == undefined
    ) {
      this.captureInterval = setInterval(
        () => this.everyTick.bind(this),
        SHARED_CONSTANTS.CAPTURE_INTERVAL
      );
    }

    if (
      this.playersInside.owners.length >= 1 &&
      this.captureInterval == undefined &&
      this.captureProgress != 0
    ) {
      this.captureInterval = setInterval(
        () => this.everyTick.bind(this),
        SHARED_CONSTANTS.CAPTURE_INTERVAL
      );
    }
  }

  public teamTakesFlag(team: IFlagCaptureTeams) {
    if (!mp.blips.exists(this.blip)) throw new Error("Blip is not created");
    if (!mp.markers.exists(this.marker))
      throw new Error("Marker is not created");
    if (!FlagCaptureHandlers.lobby) throw new Error("Lobby is not created");

    const color = TeamController.getColor(team);
    const colorInt = TeamController.getColorInt(team);

    this.marker.setColor(...color);
    this.blip.color = colorInt;
    this.team = team;

    this.captureProgress = 0;
    this.teamsProgress = { red: 0, blue: 0 };

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }

    FlagCaptureHandlers.lobby!.flagsController.teamTakesFlag(team, this);
    FlagCaptureHandlers.lobby!.teamsController.updateHud({
      message: `Враг захватил точку ${this.name}`,
      team: TeamController.getEnemyTeam(this.team),
    });

    FlagCaptureHandlers.lobby!.teamsController.updateHud({
      message: `Мы захватили точку ${this.name}`,
      team: this.team,
    });
  }

  public destroy() {
    if (!mp.blips.exists(this.blip)) return;
    if (!mp.markers.exists(this.marker)) return;

    this.marker.destroy();
    this.blip.destroy();
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }
  }
}
