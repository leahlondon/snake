// constants and vars
const actions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const events = { add: 'add', move: 'move' };
const status = { collision: 'collision', ok: 'ok' };
const classes = { pixel: 'pixel', backgroundPixel: 'backgroundPixel', snake: 'snake', apple: 'apple' }
const timeTik = 200;
const pixelSize = 25;
const eventScores = { apple: 1 };

class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equal(other) {
        return (this.x === other.x && this.y === other.y);
    }

    isInList(lst) {
        for (let other of lst) {
            if (this.equal(other)) {
                return true;
            }
        }
        return false;
    }
    nextLoc(action) {
        let x = this.x;
        let y = this.y;
        switch (action) {
            case ('ArrowLeft'):
                x--;
                break;
            case ('ArrowRight'):
                x++;
                break;
            case ('ArrowUp'):
                y--;
                break;
            case ('ArrowDown'):
                y++;
                break;
        }
        return new Location(x, y);
    }
}

class Board {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        let x = Math.floor(Math.random() * width * 0.8 + width * 0.1);
        let y = Math.floor(Math.random() * height * 0.8 + height * 0.1);
        this.snake = new Snake(x, y);
        this.apple = this.createApple();
        this.lastApple;
        this.score = 0;
    }

    createApple() {
        let location;
        do {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            location = new Location(x, y);
        }

        while (location.isInList(this.snake.place));

        return location;
    }

    update(action) {
        let e;
        if (this.checkApple()) {
            this.snake.add(action);
            this.score += eventScores.apple;
            e = events.add;
        }
        else {
            this.snake.move(action);
            e = events.move;
        }
        return { 'event': e, 'add': this.snake.getHead(), 'del': this.snake.lastTail };
    }

    checkApple() {
        if (this.snake.getHead().equal(this.apple)) {
            this.lastApple = this.apple;
            this.apple = this.createApple();
            return true;
        }
        return false;
    }

    checkCollision() {
        if (this.snake.getHead().x < 0 || this.snake.getHead().x > this.width ||
            this.snake.getHead().y < 0 || this.snake.getHead().y > this.height) {
            return true;
        }
        if (this.snake.getHead().isInList(this.snake.getPlaceNoHead())) {
            return true;
        }
        return false;
    }

}

class Snake {
    constructor(x, y) {
        this.place = [new Location(x, y)];
        this.lastTail = this.getTail();
    }

    getPlaceNoHead() {
        return this.place.slice(1);
    }

    getTail() {
        return this.place[this.place.length - 1];
    }

    getHead() {
        return this.place[0];
    }

    move(action) {
        this.add(action);
        this.lastTail = this.place.pop();
    }

    add(action) {
        this.place.unshift(this.getHead().nextLoc(action));
    }
}

class Display {
    constructor(width = 50, height = 50) {
        this.action = 'ArrowUp';
        this.board = new Board(width, height);
        this.pixels = [];
        this.scoreDisplay = document.querySelector('#scoreDisplay');
    }

    draw() {
        this.buildBoard();
        this.toggleBoardObj(this.board.snake.getHead(), classes.snake);
        this.toggleBoardObj(this.board.apple, classes.apple);
        this.buildNewGameButton();
    }

    buildBoard() {
        let boardDisplay = document.querySelector('#board');
        boardDisplay.style.width = `${this.board.width * pixelSize}px`;

        for (let i = 0; i < this.board.height; i++) {
            let col = [];
            for (let j = 0; j < this.board.width; j++) {
                let d = document.createElement('div');
                d.classList.add(classes.pixel);
                d.classList.toggle(classes.backgroundPixel);
                d.style.width = `${pixelSize}px`;
                d.style.height = `${pixelSize}px`;
                boardDisplay.appendChild(d);
                col.push(d);
            }
            this.pixels.push(col);
        }
    }

    buildNewGameButton() {
        document.querySelector('#newGame').addEventListener('click', () => {
            location.reload();
        });
    }

    toggleBoardObj(obj, cls) {
        this.toggleClass(obj, classes.backgroundPixel);
        this.toggleClass(obj, cls);
    }

    toggleClass(location, cls) {
        this.pixels[location.y][location.x].classList.toggle(cls);
    }

    update() {
        let { event, add, del } = this.board.update(this.action);

        if (this.board.checkCollision()) {
            return status.collision;
        }

        if (event === 'add') {
            this.toggleBoardObj(add, classes.snake);
            scoreDisplay.innerText = this.board.score;
            this.toggleBoardObj(this.board.lastApple, classes.apple);
            this.toggleBoardObj(this.board.apple, classes.apple);
        }
        else {
            this.toggleBoardObj(add, classes.snake);
            this.toggleBoardObj(del, classes.snake);
        }
        return status.ok;
    }

    gameOver() {
        document.querySelector('#header').innerText = 'Game Over';
    }
}
const display = new Display(25, 25);
display.draw();

// main loop
const id = setInterval(() => {
    let stat = display.update();
    if (stat === status.collision) {
        display.gameOver();
        clearInterval(id);
    }
}, timeTik);

window.addEventListener('keydown', (e) => {
    if (actions.includes(e.key)) {
        display.action = e.key;
    }
});








