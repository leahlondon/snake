const sLetterAnimation = {
    1: [[18, 10], [24, 4], [24, 10], [31, 4]],
    2: [[18, 9], [23, 4], [24, 5], [24, 9], [25, 10], [31, 5]],
    3: [[31, 6], [26, 10], [24, 8], [24, 6], [22, 4], [18, 8]],
    4: [[31, 7], [27, 10], [24, 7], [21, 4], [18, 7]],
    5: [[31, 8], [28, 10], [20, 4], [18, 6]],
    6: [[31, 9], [29, 10], [19, 4], [18, 5]],
    7: [[18, 4], [30, 10], [31, 10]],

};

const nLetterAnimation = {
    1: [[31, 13], [18, 15], [31, 17], [18, 19]],
    2: [[30, 13], [18, 14], [19, 15], [30, 17], [31, 18], [19, 19]],
    3: [[29, 13], [18, 13], [20, 15], [29, 17], [31, 19], [20, 19]],
    4: [[28, 13], [19, 13], [21, 15], [28, 17], [30, 19], [21, 19]],
    5: [[20, 13], [27, 13], [22, 15], [27, 17], [29, 19], [22, 19]],
    6: [[21, 13], [26, 13], [22, 16], [26, 17], [28, 19], [23, 19]],
    7: [[25, 13], [22, 13], [26, 16], [23, 16], [27, 19], [24, 19]],
    8: [[24, 13], [23, 13], [25, 16], [24, 16], [26, 19], [25, 19]]
}

const aLetterAnimation = {
    1: [[18, 22], [18, 27], [31, 22], [31, 27]],
    2: [[30, 22], [30, 27], [19, 22], [18, 23], [18, 26], [19, 27]],
    3: [[29, 22], [20, 22], [18, 24], [18, 25], [20, 27], [29, 27]],
    4: [[28, 22], [21, 22], [21, 27], [28, 27]],
    5: [[27, 22], [27, 27], [22, 22], [22, 27]],
    6: [[26, 22], [26, 27], [23, 22], [23, 27]],
    7: [[25, 22], [24, 22], [25, 27], [24, 27]],
    8: [[24, 23], [24, 26]],
    9: [[24, 24], [24, 25]]
}

const kLetterAnimation = {
    1: [[31, 30], [31, 36], [18, 30], [18, 36], [24, 31], [25, 31]],
    2: [[30, 30], [30, 36], [19, 30], [19, 36], [24, 32], [25, 32]],
    3: [[20, 30], [29, 30], [29, 36], [20, 36], [23, 32], [26, 32]],
    4: [[21, 30], [28, 30], [29, 35], [27, 32], [22, 32], [20, 35]],
    5: [[27, 30], [22, 30], [22, 33], [20, 34], [27, 33], [29, 34]],
    6: [[27, 34], [28, 34], [22, 34], [21, 34], [26, 30], [23, 30]],
    7: [[25, 30], [24, 30]]
}

const eLetterAnimation = {
    1: [[18, 39], [18, 45], [24, 45], [31, 45], [31, 39]],
    2: [[18, 44], [18, 40], [19, 39], [24, 44], [30, 39], [31, 40], [31, 44]],
    3: [[31, 43], [31, 41], [29, 39], [24, 43], [20, 39], [18, 41], [18, 43]],
    4: [[31, 42], [28, 39], [24, 42], [21, 39], [18, 42]],
    5: [[27, 39], [24, 41], [22, 39]],
    6: [[26, 39], [23, 39], [24, 40]],
    7: [[25, 39], [24, 39]]
}

const headerAnimations = [sLetterAnimation, nLetterAnimation, aLetterAnimation, kLetterAnimation, eLetterAnimation];

class Animation {
    constructor() {
        this.frames = {};
    }

    addFrames(otherAnimationArray) {
        for (let k of Object.keys(otherAnimationArray)) {
            if (Object.keys(this.frames).includes(k)) {
                this.frames[k].push(...otherAnimationArray[k]);
            }
            else {
                this.frames[k] = otherAnimationArray[k];
            }
        }
    }
    shiftAnimation(coordinate, pixels) {
        for (let k of Object.keys(this.frames)) {
            this.frames[k].forEach(element => { element[coordinate] += pixels });
        }
    }
}

class Pixels {
    constructor(width, height, htmlFather) {
        this.father = htmlFather;
        this.width = width;
        this.height = height;
        this.pixelSize = 25;
        this.pixelsArray = this.buildPixelsArray();
    }
    togglePixels(coordinates, cssClass) {
        for (let c of coordinates) {
            let x = c[0];
            let y = c[1];
            this.pixelsArray[x][y].classList.toggle(cssClass);
        }
    }

    buildPixelsArray() {
        this.father.style.width = `${this.width * this.pixelSize}px`;
        let pixels = [];
        for (let i = 0; i < this.height; i++) {
            let col = [];
            for (let j = 0; j < this.width; j++) {
                let d = document.createElement('div');
                d.classList.add('pixel', 'backgroundPixel');
                d.style.width = `${this.pixelSize}px`;
                d.style.height = `${this.pixelSize}px`;
                this.father.appendChild(d);
                col.push(d);
            }
            pixels.push(col);
        }
        return pixels;
    }
}

class Display {
    constructor(width = 51, height = 18) {
        this.startGameButton = document.querySelector("#startGameButton");
        this.numPlayersSelect = document.querySelector('#numPlayersSelect');
        this.board = document.querySelector(".board");
        this.pixels = new Pixels(width, height, this.board);
        this.intervalId = null;
        this.timeTick = 150;
        this.timeTickCounter = 0;
        this.headerAnimation = new Animation();
        for (let a of headerAnimations) {
            this.headerAnimation.addFrames(a);
        }
        this.headerAnimation.shiftAnimation(0, -16);
    }

    initiate() {
        this.buildNewGameButton();
        this.startHeaderAnimation();
    }

    startHeaderAnimation() {
        this.intervalId = setInterval(() => {
            this.timeTickCounter++;
            if (this.timeTickCounter <= Object.keys(this.headerAnimation.frames).length) {
                this.pixels.togglePixels(this.headerAnimation.frames[this.timeTickCounter], 'snake1');
            }
        }, this.timeTick);
    }

    buildNewGameButton() {
        this.startGameButton.addEventListener('click', () => {
            window.localStorage.setItem('numPlayers', this.numPlayersSelect.value);
        });
    }

}
window.onload = () => {
    const display = new Display();
    display.initiate();
};


