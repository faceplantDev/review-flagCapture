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
}