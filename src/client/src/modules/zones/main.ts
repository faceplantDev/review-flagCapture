import { Tools } from '../tools'
import { generateUniquePolygonId, getAngleSumBetweenPositionAndVertices, isPointInArea2D } from './helpers'

export const polygons: {
    pool: {
        id: number,
        vertices: Vector3[],
        height: number,
        visible: boolean,
        lineColorRGBA: [number, number, number, number],
        dimension: number,
        colliding: boolean
    }[],
    add: (vertices: Vector3[], height: number, options?: { visible: boolean, lineColorRGBA: [number, number, number, number], dimension: number }) => {
        id: number,
        vertices: Vector3[],
        height: number,
        visible: boolean,
        lineColorRGBA: [number, number, number, number],
        dimension: number,
        colliding: boolean
    },
    remove: (polygon: {
        id: number,
        vertices: Vector3[],
        height: number,
        visible: boolean,
        lineColorRGBA: [number, number, number, number],
        dimension: number,
        colliding: boolean
    }) => void,
    exists: (polygon: {
        id: number,
        vertices: Vector3[],
        height: number,
        visible: boolean,
        lineColorRGBA: [number, number, number, number],
        dimension: number,
        colliding: boolean,
    }) => boolean,
    isPositionWithinPolygon: (position: Vector3, polygon: {
        id: number,
        vertices: Vector3[],
        height: number,
        visible: boolean,
        lineColorRGBA: [number, number, number, number],
        dimension: number,
        colliding: boolean,
    }, dimension: number) => boolean
} = {
  pool: [],
  add: (vertices, height, options = { visible: false, lineColorRGBA: [255,255,255,255], dimension: 0 }) => {
    
    const polygon = {
      id: generateUniquePolygonId(),
      vertices,
      height,
      ...options,
      colliding: false
    }

    polygons.pool.push(polygon);

    return polygon;
  },
  remove: (polygon) => {
    const index = polygons.pool.findIndex(p => p.id === polygon.id);

    if (index !== -1)
        polygons.pool.splice(index, 1);
  },
  exists: (polygon) => {
    return polygons.pool.some(p => p.id === polygon.id)
  },
  isPositionWithinPolygon: (position, polygon, dimension) => {
    if (dimension && polygon.dimension !== dimension && polygon.dimension !== -1)
      return false;

    const { vertices } = polygon;

    const polygonPoints2D: [number, number][] = [];

    for (let i in vertices) {
      if (position.z >= vertices[i].z && position.z <= (vertices[i].z + polygon.height) || getAngleSumBetweenPositionAndVertices(position, vertices) >= 5.8)
        polygonPoints2D.push([vertices[i].x, vertices[i].y]);
      else
        return false;  
    }

    return isPointInArea2D([position.x, position.y], polygonPoints2D);
  }
}


mp.events.add('render', () => {
  polygons.pool.forEach(polygon => {
    if (!polygon.visible) return;

    const { vertices, height, lineColorRGBA } = polygon;

    vertices.forEach((vertex, index) => {
      vertex = Tools.xyzToMpVector3(vertex);
      const nextVertex = index  === (vertices.length - 1) ?  vertices[0] : vertices[index + 1];
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z, nextVertex.x, nextVertex.y, nextVertex.z, ...lineColorRGBA);
      
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z, vertex.x, vertex.y, vertex.z + height, ...lineColorRGBA);
      
      mp.game.graphics.drawLine(nextVertex.x, nextVertex.y, nextVertex.z, nextVertex.x, nextVertex.y, nextVertex.z + height, ...lineColorRGBA);  
      
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z + height, nextVertex.x, nextVertex.y, nextVertex.z + height, ...lineColorRGBA);
    });
  });
});