export class MouseControl {
    public rotate: [number, number] = [0, 0];

    private dragging = false;
    private lastPos: [number, number] = [0, 0];
    
    constructor(private node: HTMLElement) {
        this.initEvent();
    }

    private initEvent() {
        this.node.onmousedown = (ev) => {
            let x = ev.clientX;
            let y = ev.clientY;
            this.lastPos = [x, y];
            this.dragging = true;
        };

        this.node.onmousemove = (ev) => {
            if (!this.dragging) return;
            let x = ev.clientX;
            let y = ev.clientY;
            let offsetX = x - this.lastPos[0];
            let offsetY = y - this.lastPos[1];
            this.lastPos = [x, y];
            console.log(offsetX, offsetY);
            if (offsetX > 0) {
                this.rotate[0] += 0.01;
            }
            else if (offsetX < 0) {
                this.rotate[0] -= 0.01;
            }

            if (offsetY > 0) {
                this.rotate[1] += 0.01;
            }
            else if (offsetY < 0) {
                this.rotate[1] -= 0.01;
            }
        }

        this.node.onmouseup = () => {
            this.dragging = false;
            this.rotate = [0, 0];
        }
    }
}