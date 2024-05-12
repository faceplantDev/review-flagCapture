import { SHARED_CONSTANTS } from "@shared/constants";
import { ZonesData } from "./data";
import { ZonesHandlers } from "./handlers";
import { zones } from "./zones";
export class ZonesEvents {
  public static events: Record<string, (...args: any[]) => any> = {
    "S:Character:Done": ZonesHandlers.updateZonesOnCharacterDone,
    "S:Zones:PlayerLog": ZonesHandlers.updatePlayerZoneStatus,
  };
  public static init() {
    for (const eventName in ZonesEvents.events) {
      mp.events.add(eventName, ZonesEvents.events[eventName]);
    }

    ZonesData.AssassinsCreedZoneId = zones.add(
      [
        new mp.Vector3(2818.650146484375, 4432.4951171875, 48.67475509643555),
        new mp.Vector3(2826.71630859375, 4404.873046875, 49.078147888183594),
        new mp.Vector3(2762.537841796875, 4383.287109375, 49.178836822509766),
        new mp.Vector3(2753.28466796875, 4416.9140625, 48.48793411254883),
        new mp.Vector3(2813.18408203125, 4334.58544921875, 68.02012634277344),
      ],
      10,
      { visible: true, lineColorRGBA: [255, 255, 255, 255], dimension: 0 }
    );
    SHARED_CONSTANTS.MAPS.forEach((map) => {
      const zone = map.zone;
      const zoneCoordinates = zone.map(
        (position) => new mp.Vector3(position.x, position.y, position.z)
      );
      const zonesId = zones.add(zoneCoordinates, 10, {
        visible: true,
        lineColorRGBA: [0, 255, 0, 255],
        dimension: 0,
      });

      ZonesData.ArenaZones.push(zonesId);
    });
    setInterval(ZonesHandlers.updatePlayerZones, 1000)
  }

  public static destroy() {
    clearInterval(ZonesData.interval);
    if (ZonesData.AssassinsCreedZoneId != undefined) {
      zones.remove(ZonesData.AssassinsCreedZoneId);
      ZonesData.AssassinsCreedZoneId = undefined;
    }

    ZonesData.ArenaZones = [];

    for (const eventName in ZonesEvents.events) {
      mp.events.remove(eventName, ZonesEvents.events[eventName]);
    }
  }
}
