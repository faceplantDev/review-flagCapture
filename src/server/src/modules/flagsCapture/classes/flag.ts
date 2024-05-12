import { Tools } from "../../tools";
import { TeamController } from "../controllers/teamController";
import { IFlagCaptureTeams } from "@shared/types";
import { SHARED_CONSTANTS } from "@shared/constants";
import { FlagCaptureHandlers } from "./handlers";
import { ColshapeMpExtended } from "@/@types";

export class Flag {
  private captureProgress: number = 0;
  private teamsProgress: Record<"red" | "blue", number> = {
    red: 0,
    blue: 0,
  };
  private marker!: MarkerMp;
  private blip!: BlipMp;
  private colshape!: ColshapeMpExtended;
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

    console.log("Marker created");
  }

  private createBlip() {
    if (mp.blips.exists(this.blip)) this.blip.destroy();

    const color = TeamController.getColorInt(this.team);
    const { type, scale, name } = SHARED_CONSTANTS.BLIP_PARAMS;
    this.blip = mp.blips.new(type, this.position, {
      shortRange: true,
      scale,
      color,
      name: `${Tools.capitalizeFirstLetter(`${this.team}`)} ${name}`,
    });

    console.log("Blip created");
  }

  private createColshape() {
    this.colshape = mp.colshapes.newCircle(
      this.position.x,
      this.position.y,
      SHARED_CONSTANTS.MARKER_PARAMS.scale
    ) as ColshapeMpExtended;
    this.colshape.flagInfo = this;

    console.log("Colshape created");
  }

  private stopInterval() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.captureInterval = undefined;

    console.log("Interval stopped");
  }

  private everyTick() {
    if (FlagCaptureHandlers.lobby == null) return;
    if (this.team != undefined) {
      console.log("Every tick enter 1");
      const enemy = this.playersInside.attackers.length;
      const owner = this.playersInside.owners.length;

      let progressChange: number = 0;

      // Если никого в точке
      if (enemy == 0 && owner == 0) {
        progressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
      }

      // Если в точке только атакующие
      if (enemy != 0 && owner == 0) {
        progressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        if (enemy !== 1) {
          progressChange =
            progressChange *
            Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, enemy);
        }
      }

      // Если в точке все вместе (считаем вес игроков)
      if (enemy != 0 && owner != 0) {
        let weight = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        let enemyWeight =
          weight *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, enemy);
        let ownerWeight = -(
          weight *
          Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, owner)
        );

        progressChange = enemyWeight + ownerWeight;
      }

      // Если в точке только защищающие
      if (enemy == 0 && owner != 0) {
        let playersWeight = -SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        if (owner !== 1) {
          progressChange =
            playersWeight *
              Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, owner) +
            SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
        }
      }

      // Если в точке сразу защищающие и атакующие, но атакующих больше
      if (enemy > owner && owner != 0) {
        progressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        progressChange =
          progressChange *
          Math.pow(
            SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
            enemy - owner
          );
      }
    // Если в точке сразу защищающие и атакующие, но защищающих больше
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
      const redTeam = this.playersInside.attackers.filter(
        (player) =>
          FlagCaptureHandlers.lobby?.teamsController.getPlayerTeam(player) ===
          "red"
      ).length;

      const blueTeam = this.playersInside.attackers.filter(
        (player) =>
          FlagCaptureHandlers.lobby?.teamsController.getPlayerTeam(player) ===
          "blue"
      ).length;

      let redProgressChange: number = 0;
      let blueProgressChange: number = 0;

      // Если в точке нет красной команды
      if (redTeam == 0 && this.teamsProgress.red > 0) {
        if (
          this.teamsProgress.red <=
          SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE
        ) {
          redProgressChange = -this.teamsProgress.red;
        } else {
          redProgressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
        }
      }

      // Если в точке нет синей команды
      if (blueTeam == 0 && this.teamsProgress.blue > 0) {
        if (
          this.teamsProgress.blue <=
          SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE
        ) {
          blueProgressChange = -this.teamsProgress.blue;
        } else {
          blueProgressChange = -SHARED_CONSTANTS.CLEARED_ZONE_PROGRESS_RESTORE;
        }
      }

      // Если в точке красные
      if (redTeam != 0) {
        redProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;
        if (redTeam !== 1) {
          redProgressChange =
            redProgressChange *
            Math.pow(SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF, redTeam);
        }
      }

      // Если в точке синие
      if (blueTeam != 0) {
        blueProgressChange = SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_WEIGHT;

        if (blueTeam !== 1) {
          blueProgressChange *= Math.pow(
            SHARED_CONSTANTS.PLAYER_CAPTURE_PROGRESS_COEF,
            blueTeam
          );
        }
      }

      // Если в точке и одинаковое кол-во людей разных команд
      if (blueTeam == redTeam && redTeam != 0 && blueTeam != 0) {
        redProgressChange = 0;
        blueProgressChange = 0;
      }

      // Если в точке больше красных чем синих
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

      // Если в точке больше синих чем красных
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

    // Колхоз на доп. очистку таймера
    let allPlayers = FlagCaptureHandlers.lobby!.teamsController.getPlayers()
    allPlayers = allPlayers.filter((p) => {
      return FlagCaptureHandlers.lobby!.flagsController.isPlayerOnFlag(p) == this
    })

    if(allPlayers.length == 0) {
      this.stopInterval();
    }

    const targetTeam =
      FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player);
    if (targetTeam === this.team) {
      this.playersInside.owners.push(player);
    } else if (targetTeam != undefined) {
      this.playersInside.attackers.push(player);
    }

    // Это если первый игрок захватывает точку
    if (
      this.playersInside.attackers.length >= 1 &&
      (this.captureInterval == undefined || this.captureInterval == null)
    ) {
      this.captureInterval = setInterval(
        this.everyTick.bind(this),
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

    // Это если первый игрок защищает точку
    if (
      this.playersInside.owners.length >= 1 &&
      this.captureInterval == undefined
    ) {
      this.captureInterval = setInterval(
        this.everyTick.bind(this),
        SHARED_CONSTANTS.CAPTURE_INTERVAL
      );
    }

    console.log("Player enter");
  }

  public playerLeaveOrDead(player: PlayerMp) {
    if (!FlagCaptureHandlers.lobby) return;

    const targetTeam =
      FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player);
    if (targetTeam === this.team) {
      if (!this.playersInside.owners.includes(player)) return;
      this.playersInside.owners.splice(
        this.playersInside.owners.indexOf(player),
        1
      );
    } else if (targetTeam != undefined) {
      if (!this.playersInside.attackers.includes(player)) return;
      this.playersInside.attackers.splice(
        this.playersInside.attackers.indexOf(player),
        1
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

    console.log("Player leave");
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
    this.blip.name = `${Tools.capitalizeFirstLetter(`${team}`)} ${
      SHARED_CONSTANTS.BLIP_PARAMS.name
    }`;
    this.playersInside = {
      owners: this.playersInside.attackers,
      attackers: this.playersInside.owners,
    };
    this.team = team;

    this.captureProgress = 0;
    this.teamsProgress = { red: 0, blue: 0 };

    FlagCaptureHandlers.lobby!.flagsController.teamTakesFlag(team, this);
    FlagCaptureHandlers.lobby!.teamsController.updateHud({
      message: `Враг захватил точку ${this.name}`,
      team: TeamController.getEnemyTeam(this.team),
    });

    FlagCaptureHandlers.lobby!.teamsController.updateHud({
      message: `Мы захватили точку ${this.name}`,
      team: this.team,
    });

    console.log("Team takes flag");
  }

  public destroy() {
    if (!mp.blips.exists(this.blip)) return;
    if (!mp.markers.exists(this.marker)) return;
    if (!mp.colshapes.exists(this.colshape)) return;

    this.marker.destroy();
    this.blip.destroy();
    this.colshape.destroy();
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.captureInterval = undefined;
  }
}
