import { SHARED_CONSTANTS } from "@shared/constants";
import { polygons } from "./main";
import { Tools } from "../tools";

SHARED_CONSTANTS.MAPS.forEach(map => {
    polygons.add(map.zone.map(vertex => Tools.xyzToMpVector3(vertex)), 60, {
        visible: true,
        lineColorRGBA: [255, 0, 0, 255],
        dimension: 0
    })
})