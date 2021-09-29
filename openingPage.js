const snakeAnimation = {
    1: [[18, 10], [24, 4], [24, 10], [31, 4], [31, 13], [18, 15], [31, 17], [18, 19]],
    2: [[18, 9], [23, 4], [24, 5], [24, 9], [25, 10], [31, 5], [30, 13], [18, 14], [19, 15], [30, 17], [31, 18], [19, 19]],
    3: [[31, 6], [26, 10], [24, 8], [24, 6], [22, 4], [18, 8], [29, 13], [18, 13], [20, 15], [29, 17], [31, 19], [20, 19]],
    4: [[31, 7], [27, 10], [24, 7], [21, 4], [18, 7], [28, 13], [19, 13], [21, 15], [28, 17], [30, 19], [21, 19]],
    5: [[31, 8], [28, 10], [20, 4], [18, 6], [20, 13], [27, 13], [22, 15], [27, 17], [29, 19], [22, 19]],
    6: [[31, 9], [29, 10], [19, 4], [18, 5], [21, 13], [26, 13], [22, 16], [26, 17], [28, 19], [23, 19]],
    7: [[18, 4], [30, 10], [31, 10], [25, 13], [22, 13], [26, 16], [23, 16], [27, 19], [24, 19]],
    8: [[24, 13], [23, 13], [25, 16], [24, 16], [26, 19], [25, 19]]
};

class Pixels {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.pixelSize = 25;
        this.array = this.buildArray();
        this.pixelsArray = this.buildPixelsArray();
    }
    togglePixels(coordinates, cssClass) {
        for (let c of coordinates) {
            let x = c[0];
            let y = c[1];
            this.pixelsArray[x][y].classList.toggle(cssClass);
        }
    }

    buildArray() {
        let array = document.createElement('section');
        array.classList.add('board');
        array.style.width = `${this.width * this.pixelSize}px`;
        return array;
    }

    buildPixelsArray() {
        let pixels = [];
        for (let i = 0; i < this.height; i++) {
            let col = [];
            for (let j = 0; j < this.width; j++) {
                let d = document.createElement('div');
                d.classList.add('pixel', 'backgroundPixel');
                d.style.width = `${this.pixelSize}px`;
                d.style.height = `${this.pixelSize}px`;
                this.array.appendChild(d);
                col.push(d);
            }
            pixels.push(col);
        }
        return pixels;
    }
}

class Display {
    constructor(width = 51, height = 51) {
        this.main = document.querySelector(".mainPanel");
        this.pixels = new Pixels(width, height);
        this.main.appendChild(this.pixels.array);
        this.intervalId = null;
        this.timeTick = 150;
        this.timeTickCounter = 0;
    }

    initiate() {
        this.intervalId = setInterval(() => {
            this.timeTickCounter++;
            if (this.timeTickCounter <= Object.keys(snakeAnimation).length) {
                this.pixels.togglePixels(snakeAnimation[this.timeTickCounter], 'snake1');
            }
        }, this.timeTick);
    }
}

const display = new Display();
display.initiate();