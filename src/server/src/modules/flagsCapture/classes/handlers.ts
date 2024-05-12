import { LobbyController } from "../controllers/lobbyController";

export class FlagCaptureHandlers {
    public static lobby: LobbyController | null = null;

    public static playerReady(player: PlayerMp) {
        FlagCaptureHandlers.sortPlayer(player)
    }

    public static sortPlayer(player: PlayerMp) {
        if(FlagCaptureHandlers.lobby == null) return

        const activeLobby = FlagCaptureHandlers.lobby
        const teamsController = activeLobby.teamsController

        const playersInRedTeam = teamsController.getPlayersInTeam('red').length
        const playersInBlueTeam = teamsController.getPlayersInTeam('blue').length

        if(playersInRedTeam == 0) {
            teamsController.addPlayerToTeam('red', player)
        } else

        if(playersInBlueTeam == 0) {
            teamsController.addPlayerToTeam('blue', player)
        }

        if(playersInRedTeam > playersInBlueTeam) {
            teamsController.addPlayerToTeam('blue', player)
        }
        else {
            teamsController.addPlayerToTeam('red', player)
        }          
        
        LobbyController.teleportToRandomSpawn(player)
    }

    public static playerLeft(player: PlayerMp) {
        if(FlagCaptureHandlers.lobby == null) return

        const activeLobby = FlagCaptureHandlers.lobby
        const teamsController = activeLobby.teamsController

        teamsController.removePlayer(player)
    }

    public static startLobby() {
        if(FlagCaptureHandlers.lobby != null) {
            FlagCaptureHandlers.lobby.destroy()
            FlagCaptureHandlers.lobby = null
        }

        FlagCaptureHandlers.lobby = new LobbyController()

        mp.players.forEach(FlagCaptureHandlers.sortPlayer)
    }
}