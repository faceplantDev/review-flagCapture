import { zones } from "./zones";

export class ZonesHandlers {
  public static updatePlayerZones() {
    mp.players.forEach((player) => {
      const { position, dimension } = player;

      zones.pool.map((polygon) => {
        if (!zones.isPositionWithinPolygon(position, polygon.id, dimension)) {
          if (polygon.colliding == undefined) return;
          const index = polygon.colliding.findIndex(
            (_player: any) => _player === player
          );
          if (index !== -1) {
            player.call(`${polygon.id}zoneExit`);
            mp.events.call(`${polygon.id}zoneExit`, player);
            polygon.colliding.splice(index, 1);
            for (let h of mp.events.getAllOf("S:Zones:PlayerLog")) {
              try {
                h(player, false);
              } catch (e) {
                console.log(e);
              }
            }
          }
        } else {
          if (polygon.colliding == undefined) return;
          const index = polygon.colliding.findIndex(
            (_player: any) => _player === player
          );
          if (index == -1) {
            polygon.colliding.push(player);
            player.call(`${polygon.id}zoneEnter`);
            mp.events.call(`${polygon.id}zoneEnter`, player);

            for (let h of mp.events.getAllOf("S:Zones:PlayerLog")) {
              try {
                h(player, true);
              } catch (e) {
                console.log(e);
              }
            }
          }
        }
      });
    });
  }

  public static updateZonesOnCharacterDone(player: PlayerMp) {
    player.call("C:Zones:Update", [zones.toClient()]);
  }

  public static updatePlayerZoneStatus(
    player: PlayerMp,
    isInside: boolean | number
  ) {
    player.setVariable("insideZone", isInside);
  }
}
