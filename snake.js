// constants and vars
const actions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const events = { add: 'add', move: 'move', collision: 'collision' };
const status = { end: 'end', ok: 'ok' };
const classes = { pixel: 'pixel', backgroundPixel: 'backgroundPixel', snake: 'snake', apple: 'apple' }
const timeTick = 200;
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
        this.lastApple = null;
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
            return { 'event': events.add, 'toggle': { [classes.snake]: [this.snake.getHead()], [classes.apple]: [this.apple, this.lastApple] } };
        }
        else if (this.checkCollision()) {
            this.snake.removeHead();
            return { 'event': events.collision, 'toggle': {} };
        }
        else {
            this.snake.removeTail();
            return { 'event': events.move, 'toggle': { [classes.snake]: [this.snake.getHead(), this.snake.lastTail] } };
        }
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

    removeHead() {
        this.place.shift();
    }

    moveHead(action) {
        this.place.unshift(this.getHead().nextLoc(action));
    }
}

class Game {
    constructor(width = 50, height = 50) {
        this.action = 'ArrowUp';
        this.intervalId = null;
        this.display = new Display(new Board(width, height), this.newGame.bind(this));
    }

    initiate() {
        this.display.initiate();
        this.startTick();
        this.getAction();
    }

    startTick() {
        this.intervalId = setInterval(() => {
            let stat = this.display.update(this.action);
            if (stat === status.end) {
                this.endTick();
            }
        }, timeTick);
    }

    getAction() {
        window.addEventListener('keydown', (e) => {
            if (actions.includes(e.key)) {
                this.action = e.key;
            }
        });
    }

    endTick() {
        clearInterval(this.intervalId);
    }

    newGame() {
        this.endTick();
        this.action = 'ArrowUp';
        this.display.reset();
        this.startTick();
    }
}

class Display {
    constructor(board, newGame) {
        this.board = board;
        this.pixels = [];
        this.scoreDisplay = document.querySelector('#scoreDisplay');
        this.gameHeader = document.querySelector('#header');
        this.boardDisplay = document.querySelector('#board');
        this.newGameButton = document.querySelector('#newGame');
        this.newGameFunction = newGame;
        this.saveResultsButton = document.querySelector('#saveResults');
    }

    initiate() {
        this.buildBoard();
        this.buildNewGameButton();
        this.toggleObjs();
    }

    toggleObjs() {
        this.board.snake.place.forEach((e) => { this.toggleClass(e, classes.snake) });
        this.toggleClass(this.board.apple, classes.apple);
    }

    buildBoard() {
        this.boardDisplay.style.width = `${this.board.width * pixelSize}px`;

        for (let i = 0; i < this.board.height; i++) {
            let col = [];
            for (let j = 0; j < this.board.width; j++) {
                let d = document.createElement('div');
                d.classList.add(classes.pixel);
                d.classList.toggle(classes.backgroundPixel);
                d.style.width = `${pixelSize}px`;
                d.style.height = `${pixelSize}px`;
                this.boardDisplay.appendChild(d);
                col.push(d);
            }
            this.pixels.push(col);
        }
    }

    buildNewGameButton() {
        this.newGameButton.addEventListener('click', this.newGameFunction);
    }

    buildSaveResultsButton() {

    }

    toggleClass(location, cls) {
        this.pixels[location.y][location.x].classList.toggle(cls);
    }

    updateScoreDisplay() {
        this.scoreDisplay.innerText = this.board.score;
    }

    update(action) {
        let { event, toggle } = this.board.update(action);

        Object.keys(toggle).forEach((c) => toggle[c].forEach((e) => this.toggleClass(e, c)));

        if (event === events.collision) {
            this.gameOver();
            return status.end;
        }

        if (event === events.add) {
            this.updateScoreDisplay();
        }
        return status.ok;
    }

    updateGameHeader(text) {
        this.gameHeader.innerText = text;
    }

    gameOver() {
        this.updateGameHeader('Game Over');
        this.saveResultsButton.disabled = false;
    }

    reset() {
        this.toggleObjs();
        this.board = new Board(this.board.width, this.board.height);
        this.updateScoreDisplay();
        this.updateGameHeader('Snake');
        this.saveResultsButton.disabled = true;
        this.toggleObjs();
    }
}

// main
const game = new Game(25, 25);
game.initiate();









