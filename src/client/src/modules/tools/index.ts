export class Tools {
    public static drawText2D(text: string, position: [number, number], color : [number, number, number, number] = [255, 255,255,255], scale: [number, number] = [0.4, 0.4]) {
        mp.game.graphics.drawText(text, position, {
            font: 4,
            color,
            centre: true,
            outline: false,
            scale
        });
    }


    public static secondsToMinutes(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        const secStr = sec < 10 ? '0' + sec : sec;
        return minutes + ':' + secStr;
    }

    public static randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    public static generateUUID(): string {
        let d = new Date().getTime();
        let d2 = (typeof performance === "object" && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            if (d > 0) {
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    public static xyzToMpVector3({x, y, z}: {x: number, y: number, z: number}): Vector3 {
        return new mp.Vector3(x, y, z);
    }
}