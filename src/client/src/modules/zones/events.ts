import { polygons } from "./main";

setInterval(() => {
  const { position, dimension } = mp.players.local;
  polygons.pool.map((polygon) => {

    if (polygon.colliding) {
      if (!polygons.isPositionWithinPolygon(position, polygon, dimension)) {
        polygon.colliding = false;
        mp.events.callRemote('playerLeavePolygon', polygon);
      }
    }
    else {
      if (polygons.isPositionWithinPolygon(position, polygon, dimension)) {
        polygon.colliding = true;
        mp.events.callRemote('playerEnterPolygon', polygon);
      }
    }
  });

}, 100);