import {
  generateUniquePolygonId,
  getAngleSumBetweenPositionAndVertices,
  isPointInArea2D,
} from "./helper";
type zoneServ = {
  colliding?: PlayerMp[];
  visible: boolean;
  lineColorRGBA: number[];
  dimension: number;
  id: any;
  vertices: Vector3[];
  height: number;
};
interface globalZone {
  pool: zoneServ[];
  add(
    verticles: Vector3[],
    height: number,
    options?: {
      visible: boolean;
      lineColorRGBA: [number, number, number, number];
      dimension: number;
    }
  ): void;
  remove(zone: number): void;
  exists(zone: number): boolean;
  isPositionWithinPolygon(
    position: Vector3,
    zone: number,
    dimension: number
  ): boolean;
}

type zoneClient = {
  visible: boolean;
  lineColorRGBA: number[];
  dimension: number;
  id: any;
  vertices: Vector3[];
  height: number;
};
interface globalZoneE extends globalZone {
  pool: zoneServ[];
  add(
    verticles: Vector3[],
    height: number,
    options?: {
      visible: boolean;
      lineColorRGBA: [number, number, number, number];
      dimension: number;
    }
  ): number;
  remove(zone: number): void;
  exists(zone: number): boolean;
  toClient(): zoneServ[];
  isPositionWithinPolygon(
    position: Vector3,
    zone: number,
    dimension: number
  ): boolean;
}

export let zones: globalZoneE = {
  pool: [],
  add: (
    vertices: Vector3[],
    height: number,
    options = {
      visible: false,
      lineColorRGBA: [255, 255, 255, 255],
      dimension: 0,
    }
  ): number => {
    const polygon: zoneServ = {
      id: generateUniquePolygonId(),
      vertices,
      height,
      ...options,
      colliding: [],
    };

    zones.pool.push(polygon);
    mp.players.call("C:Zones:Update", [zones.toClient()]);
    return polygon.id;
  },
  remove: (polygon: number) => {
    const index = zones.pool.findIndex((p) => p.id === polygon);

    if (index !== -1) zones.pool.splice(index, 1);
    mp.players.call("C:Zones:Update", [zones.toClient()]);
  },
  exists: (polygon: number) => {
    return zones.pool.some((p) => p.id === polygon);
  },

  isPositionWithinPolygon: (
    position: Vector3,
    zone: number,
    dimension: number
  ) => {
    if (!zones.exists(zone)) return false;
    let polygon = zones.pool.find((p) => p.id === zone);
    if (!polygon) return false;
    if (
      dimension &&
      polygon.dimension !== dimension &&
      polygon.dimension !== -1
    )
      return false;
    const { vertices } = polygon;

    const polygonPoints2D = [];

    for (let i in vertices) {
      if (
        (position.z >= vertices[i].z &&
          position.z <= vertices[i].z + polygon.height) ||
        getAngleSumBetweenPositionAndVertices(position, vertices) >= 5.8
      )
        polygonPoints2D.push([vertices[i].x, vertices[i].y]);
      else return false;
    }

    return isPointInArea2D([position.x, position.y], polygonPoints2D);
  },
  toClient: (): zoneClient[] => {
    const zoneArrWithoutColliding: zoneClient[] = zones.pool.map(
      (zone: zoneServ) => {
        const { colliding, ...zoneWithoutColliding } = zone;
        return zoneWithoutColliding;
      }
    );
    return zoneArrWithoutColliding;
  },
};
