import { Tools } from "../../tools";

export class PlayerTools {
    public static setBlackScreen(value: boolean) {
        if(value) {
            mp.game.cam.doScreenFadeOut(250);
        } else {
            mp.game.cam.doScreenFadeIn(250);
        }
    }

    public static ragDoll() {
        mp.players.local.setToRagdoll(2000, 2000, 1, true, true, true);
    }

    public static setFreeze(val: boolean) {
        mp.players.local.freezePosition(val)
    }

    public static incomingDamage(sourceEntity: PedMpBase, sourcePlayer: PlayerMp, targetEntity: PedMpBase, weapon: number, boneIndex: number, damage: number) {
        if(sourcePlayer.getVariable('godmode') == true) return true;
        if(mp.players.local.getVariable('godmode') == true) return true;

        let max = 85;
        let min = 60;

        const percent = Tools.randomInt(min, max) / 100;
        let customDamage = damage - (damage * percent);

        if (boneIndex === 20) {
            customDamage /= 10;
        }

        targetEntity.applyDamageTo(parseInt(`${customDamage}`), true);

        const currentHealth = targetEntity.getHealth();

        if (currentHealth > 0) {
            mp.game.weapon.setCurrentDamageEventAmount(0);
        }

    }
}