import { Tools } from "../tools"

export class PlayerTools {
    public static async teleport(player: PlayerMp, position: Vector3) {
        /** Тут типо можно сделать что то для античита и тп */

        player.call('C:Player:Blackscreen', [true])
        await Tools.sleep(500)
        player.position = position
        player.call('C:Player:Blackscreen', [false])
        
        return true
    }
}