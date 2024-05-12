export class Tools {
    public static getRandomElementOfArray<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    public static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static getRandomNumberByRange(minOrArray: number | [number, number], max?: number): number {
        if(Array.isArray(minOrArray)) {
            return Math.floor(Math.random() * (minOrArray[1] - minOrArray[0]) + minOrArray[0]);
        }
        if(max != undefined) {
            return Math.floor(Math.random() * (max - minOrArray) + minOrArray);
        }

        return 0
    }

    public static getRandomElementOfObject<T>(object: {[key: string]: T}): T {
        const keys = Object.keys(object);
        return object[keys[Math.floor(Math.random() * keys.length)]];
    }

    public static xyzToMpVector3({x, y, z}: {x: number, y: number, z: number}): Vector3 {
        return new mp.Vector3(x, y, z);
    }

    public static capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static getDistanceTo2D(a: Vector3, b: Vector3): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    }

    public static getDistanceTo3D(a: Vector3, b: Vector3): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2))
    }
}