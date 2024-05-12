import { SHARED_CONSTANTS } from "@shared/constants";
import { PlayerTools } from "../../player/playerTools";
import { Tools } from "../../tools";
import { LobbyController } from "../controllers/lobbyController";

export class FlagCaptureHandlers {
  public static lobby: LobbyController | null = null;

  public static playerReady(player: PlayerMp) {
    console.log(`Player ${player.name} joined`);
    FlagCaptureHandlers.sortPlayer(player);
  }

  public static sortPlayer(player: PlayerMp) {
    if (FlagCaptureHandlers.lobby == null) return;

    const activeLobby = FlagCaptureHandlers.lobby;
    if(activeLobby.timerController.getPhase() != 0) {
        PlayerTools.teleport(player, Tools.xyzToMpVector3(SHARED_CONSTANTS.LOBBY_POSITION))
        return
    }
    const teamsController = activeLobby.teamsController;

    const playersInRedTeam = teamsController.getPlayersInTeam("red").length;
    const playersInBlueTeam = teamsController.getPlayersInTeam("blue").length;

    if (playersInRedTeam == 0) {
      teamsController.addPlayerToTeam("red", player);
    } else if (playersInBlueTeam == 0) {
      teamsController.addPlayerToTeam("blue", player);
    } else if (playersInRedTeam > playersInBlueTeam) {
      teamsController.addPlayerToTeam("blue", player);
    } else {
      teamsController.addPlayerToTeam("red", player);
    }

    LobbyController.teleportToRandomSpawn(player);
    console.log(`Player ${player.name} sorted`);
  }

  public static playerLeft(player: PlayerMp) {
    if (FlagCaptureHandlers.lobby == null) return;

    const activeLobby = FlagCaptureHandlers.lobby;
    const teamsController = activeLobby.teamsController;

    teamsController.removePlayer(player);

    console.log(`Player ${player.name} left`);
  }

  public static startLobby() {
    if (FlagCaptureHandlers.lobby != null) {
      FlagCaptureHandlers.lobby.destroy();
      FlagCaptureHandlers.lobby = null;
    }

    FlagCaptureHandlers.lobby = new LobbyController();
    
    FlagCaptureHandlers.lobby.teamsController.updateHud({
        message: `Ожидание начала`,
        team: 'all'
    })

    mp.players.forEach(FlagCaptureHandlers.sortPlayer);

    console.log("Lobby started handler");
  }
}