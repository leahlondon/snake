// constants and vars
const actions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const events = { add: 'add', move: 'move', collision: 'collision' };
const status = { end: 'end', ok: 'ok' };
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
        this.snake.moveHead(action);
        if (this.checkApple()) {
            this.score += eventScores.apple;
            return { 'event': events.add, 'add': this.snake.getHead(), 'del': null };
        }
        this.snake.removeTail();
        if (this.checkCollision()) {
            return { 'event': events.collision, 'add': null, 'del': null }
        }
        return { 'event': events.move, 'add': this.snake.getHead(), 'del': this.snake.lastTail };
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
        if (this.snake.getHead().x < 0 || this.snake.getHead().x >= this.width ||
            this.snake.getHead().y < 0 || this.snake.getHead().y >= this.height) {
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

    removeTail() {
        this.lastTail = this.place.pop();
    }

    moveHead(action) {
        this.place.unshift(this.getHead().nextLoc(action));
    }
}

class Display {
    constructor(width = 50, height = 50) {
        this.action = 'ArrowUp';
        this.board = new Board(width, height);
        this.pixels = [];
        this.scoreDisplay = document.querySelector('#scoreDisplay');
        this.gameHeader = document.querySelector('#header');
        this.intervalId = null;
    }
    initiate() {
        this.buildBoard();
        this.buildNewGameButton();
        this.draw();
    }

    startGame() {
        this.intervalId = setInterval(() => {
            let stat = this.update();
            if (stat === status.end) {
                this.updateGameHeader('Game Over');
                clearInterval(this.intervalId);
            }
        }, timeTik);
    }

    draw() {
        this.toggleClass(this.board.snake.getHead(), classes.snake);
        this.toggleClass(this.board.apple, classes.apple);
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
            // delete snake
            let del = [...this.board.snake.getPlaceNoHead(), this.board.snake.lastTail];
            del.forEach((e) => { this.toggleClass(e, classes.snake); });
            // delete apple
            this.toggleClass(this.board.apple, classes.apple);
            // new board
            this.board = new Board(this.board.width, this.board.height);
            this.updateScoreDisplay();
            this.updateGameHeader('Snake');
            // draw
            this.draw();
            // start game
            this.startGame();
        });
    }

    toggleClass(location, cls) {
        this.pixels[location.y][location.x].classList.toggle(cls);
    }

    updateScoreDisplay() {
        this.scoreDisplay.innerText = this.board.score;
    }

    update() {
        let { event, add, del } = this.board.update(this.action);
        if (event === events.collision) {
            return status.end;
        }

        if (event === events.add) {
            this.toggleClass(this.board.lastApple, classes.apple);
            this.toggleClass(add, classes.snake);
            this.updateScoreDisplay();
            this.toggleClass(this.board.apple, classes.apple);
        }

        else {
            this.toggleClass(add, classes.snake);
            this.toggleClass(del, classes.snake);
        }
        return status.ok;
    }

    updateGameHeader(text) {
        this.gameHeader.innerText = text;
    }
}
const display = new Display(25, 25);
display.initiate();
display.startGame();

window.addEventListener('keydown', (e) => {
    if (actions.includes(e.key)) {
        display.action = e.key;
    }
});








