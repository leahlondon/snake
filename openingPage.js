/**
 * openingPage.js conatains the logic of openingPage.html which is the preview page of the game.
 * the main class in openingPage.js is Display - this class controls and manages the html elements in the page.
 */

/**
 * letters' animations - [x,y] coordinates that will be colored at each time tick.
 */
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

/**
 * Animation holds a dictionary of "frames" - 
 * the key is the frame number (starts from 1) and the value is a list of the pixels' coordinates that will "change" on this frame.
 * meaning, if the pixel isn't colored it will become colored and vice versa.
 */
class Animation {
    constructor() {
        this.frames = {};
    }
    /**
     * adds another frames to this.frames.
     * @param {*} otherFrames a dictionary of frames as explained above.
     */
    addFrames(otherFrames) {
        for (let k of Object.keys(otherFrames)) {
            if (Object.keys(this.frames).includes(k)) {
                for (let pixel of otherFrames[k]) {
                    if (!this.frames[k].includes(pixel))
                        this.frames[k].push(pixel);
                }
            }
            else {
                this.frames[k] = otherFrames[k];
            }
        }
    }
    /**
     * adds or substracts a given number of pixels from every pixel's coordinates.
     * for example, shiftAnimation(0, 5) will move the animation 5 pixels right along the x axis.
     * shiftAnimation(1, -4) will move the animation 4 pixels up along the y axis.
     * @param {*} coordinate a number, what coordinate to change - 0 for x, 1 for y.
     * @param {*} pixels a number, the number of pixels to add or subtract.
     */
    shiftAnimation(coordinate, pixels) {
        for (let k of Object.keys(this.frames)) {
            this.frames[k].forEach(element => { element[coordinate] += pixels });
        }
    }
}

/**
 * Pixels represents a two dimentional array of html div elements.
 * these elements creates the board.
 * Pixels can easily color a pixel using x,y coordinates.
 */
class Pixels {
    /**
     * constructor method.
     * @param {*} width a number, the width of the board.
     * @param {*} height a number, the height of the board.
     * @param {*} htmlFather html element, the pixels will be created as his children.
     */
    constructor(width, height, htmlFather) {
        this.father = htmlFather;
        this.width = width;
        this.height = height;
        this.pixelSize = 25;
        this.pixelsArray = this.#buildPixelsArray();
    }
    /**
     * toggle a given css class of a given pixel.
     * @param {*} coordinates [x, y], the cooredinates of the desired pixel.
     * @param {*} cssClass String, the css class.
     */
    togglePixels(coordinates, cssClass) {
        for (let c of coordinates) {
            let x = c[0];
            let y = c[1];
            this.pixelsArray[x][y].classList.toggle(cssClass);
        }
    }
    /**
     * builds the actual board with html elements.
     * @returns a two dimentional array of the pixels, represented by html div elements.
     */
    #buildPixelsArray() {
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

/**
 * Display is responsible for creating the event listners of buttons on the page.
 * Display draws the Animation on a Pixels object.
 */
class Display {
    /**
     * constructor method.
     * @param {*} width a number, the width of the board.
     * @param {*} height a number, the height of the board.
     */
    constructor(width = 51, height = 18) {
        this.startGameButton = document.querySelector("#startGameButton");
        this.numPlayersSelect = document.querySelector('#numPlayersSelect');
        this.howToPlayButton = document.querySelector('#howToPlayButton');
        this.howToPlayText = document.querySelector('#howToPlayText');
        this.aboutButton = document.querySelector('#aboutButton');
        this.aboutText = document.querySelector('#aboutText');
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
    /**
     * creates the event listener for this.startGameButton.
     * draws the header animation.
     */
    initiate() {
        this.#buildStartGameButton();
        this.#buildhowToPlayButton();
        this.#buildAboutButton();
        this.#startHeaderAnimation();
    }
    /**
     * draws the header animation.
     * each time tick, toggles the listed pixels in this.headerAnimation.
     */
    #startHeaderAnimation() {
        this.intervalId = setInterval(() => {
            this.timeTickCounter++;
            if (this.timeTickCounter <= Object.keys(this.headerAnimation.frames).length) {
                this.pixels.togglePixels(this.headerAnimation.frames[this.timeTickCounter], 'snake1');
            }
        }, this.timeTick);
    }
    /**
     * creates the event listener for this.startGameButton.
     * when the user clicks the button, the selected number of players is saved in window.localStorage
     * and the user is transfered to snake.html.
     */
    #buildStartGameButton() {
        this.startGameButton.addEventListener('click', () => {
            window.localStorage.setItem('numPlayers', this.numPlayersSelect.value);
        });
    }
    /**
     * creates the event listener for this.howToPlayButton.
     * when the user clicks the button, the relevent information appears.
     */
    #buildhowToPlayButton() {
        this.howToPlayButton.addEventListener('click', () => {
            this.howToPlayText.style.display = 'block';
            this.aboutText.style.display = 'none';
        });
    }
    /**
     * creates the event listener for this.aboutButton.
     * when the user clicks the button, the relevent information appears.
     */
    #buildAboutButton() {
        this.aboutButton.addEventListener('click', () => {
            this.howToPlayText.style.display = 'none';
            this.aboutText.style.display = 'block';
        });
    }
}

// main
window.onload = () => {
    const display = new Display();
    display.initiate();
};


