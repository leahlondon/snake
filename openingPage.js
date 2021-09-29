class Display {
    constructor() {
        this.pixels = [];
        this.snakeHeader = []
        this.pixelSize = 25;
        this.width = 50;
        this.height = 50;
        this.openingDisplay = document.querySelector('#openingHeader');
    }

    build() {
        this.openingDisplay.style.width = `${this.width * this.pixelSize}px`;

        for (let i = 0; i < this.height; i++) {
            let col = [];
            for (let j = 0; j < this.width; j++) {
                let d = document.createElement('div');
                d.classList.add('pixel');
                d.style.width = `${this.pixelSize}px`;
                d.style.height = `${this.pixelSize}px`;
                this.openingDisplay.appendChild(d);
                col.push(d);
            }
            this.pixels.push(col);
        }
    }
}

const display = new Display();
display.build();