// constants and vars
const actions = {
    1: { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down' },
    2: { 'a': 'left', 'd': 'right', 'w': 'up', 's': 'down' }
};
const events = {
    add: { 1: 'add1', 2: 'add2' }, move: { 1: 'move1', 2: 'move2' }, collsion: {
        1: 'collision1', 2: 'collision2'
    }
};
const status = { end: 'end', ok: 'ok' };
const classes = { pixel: 'pixel', backgroundPixel: 'backgroundPixel', snake1: 'snake1', snake2: 'snake2', apple: 'apple' }
const pixelSize = 25;

class Player {
    constructor(snake, disabled = false) {
        this.disabled = disabled;
        this.score = 0;
        this.snake = snake;
        this.action = 'up';
        this.disabled = disabled;

    }

    disable() {
        this.disabled = true;
    }

    checkIfGotFood(foods) {
        if (this.disabled) {
            return null;
        }
        for (let food of foods.foodList) {
            if (this.snake.getHead().equal(food.location)) {
                this.score += food.foodType.score;
                return food;
            }
        }
        return null;
    }

    checkIfSnakeHitWall(width, height) {
        return (this.snake.getHead().x < 0 || this.snake.getHead().x >= width ||
            this.snake.getHead().y < 0 || this.snake.getHead().y >= height);
    }

    checkIfSnakeHitOtherPlayer(otherPlayer) {
        return (this.snake.getHead().isInList([...otherPlayer.snake.place]));
    }

    checkIfSnakeHitItself() {
        return this.snake.getHead().isInList([...this.snake.getPlaceNoHead()]);
    }

    play() {
        this.snake.moveHead(this.action);
    }
}

class Foods {
    constructor() {
        this.foodList = [];
        this.options = [{ 'class': 'apple', 'score': 1 }]
    }

    createNewFood(foodLoc) {
        let rand = Math.floor(Math.random() * this.options.length);
        let newFood = { 'foodType': this.options[rand], 'location': foodLoc };
        this.foodList.push(newFood);
        return newFood;
    }

    getFoodCurrentLocations() {
        return this.foodList.map((e) => e.location);
    }

    getFoodsByClass() {
        let res = {};
        for (let f of this.foodList) {
            if (!res.hasOwnProperty(f.foodType.class)) {
                res[f.foodType.class] = [f.location];
            }
            else {
                res[f.foodType.class].push(f.location);
            }
        }
        return res;
    }

    eat(food) {
        for (let i = 0; i < this.foodList.length; i++) {
            if (this.foodList[i].location.equal(food.location)) {
                this.foodList.splice(i, 1);
                return
            }
        }
    }
}

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
            case ('left'):
                x--;
                break;
            case ('right'):
                x++;
                break;
            case ('up'):
                y--;
                break;
            case ('down'):
                y++;
                break;
        }
        return new Location(x, y);
    }
}

class Board {
    constructor(width = 50, height = 50, multiplayer = false) {
        this.width = width;
        this.height = height;
        // players
        this.players = {};
        this.disabledPlayers = {};
        this.players[1] = new Player(new Snake(this.createRandomLocation(0.1, 0.8), classes.snake1), false);
        this.players[2] = new Player(new Snake(this.createRandomLocation(0.1, 0.8), classes.snake2), !multiplayer);
        this.updateEnabledPlayers();
        this.multiplayer = multiplayer;
        // foods
        this.foods = new Foods();
        this.createFoodsOnBoard(2);
    }

    createFoodsOnBoard(n) {
        for (let i = 0; i < n; i++) {
            this.foods.createNewFood(this.createRandomLocation());
        }
    }

    updateEnabledPlayers() {
        let enabled = {};
        for (let [n, player] of Object.entries(this.players)) {
            if (!player.disabled) {
                enabled[n] = player;
            }
            else {
                this.disabledPlayers[n] = player;
            }
        }
        this.players = enabled;
    }

    getAllPlayers() {
        let res = { ...this.players, ...this.disabledPlayers };
        if (this.multiplayer) {
            return res;
        }
        return { 1: res[1] };
    }

    getUnavailableLocations() {
        let res = [];
        for (let player of Object.values(this.players)) {
            if (player) {
                res.push(...player.snake.place);
            }
        }
        if (this.foods) {
            res.push(...this.foods.getFoodCurrentLocations());
        }
        return res;
    }

    createRandomLocation(from = 0, over = 1) {
        let unavailableLocs = this.getUnavailableLocations();
        let location;
        do {
            let x = Math.floor(Math.random() * this.width * over + this.width * from);
            let y = Math.floor(Math.random() * this.height * over + this.height * from);
            location = new Location(x, y);
        }

        while (location.isInList(unavailableLocs));

        return location;

    }

    update() {
        let returnVal = { 'eventsList': [], 'toggle': {} };

        for (let player of Object.values(this.players)) {
            returnVal.toggle[player.snake.cssClass] = [];
            player.play();
        }

        let col = this.checkCollision();
        for (let [n, player] of Object.entries(this.players)) {
            if (col.includes(events.collsion[n])) {
                player.snake.removeHead();
                player.disable();
                this.updateEnabledPlayers();
                returnVal.eventsList.push(events.collsion[n]);
            }
        }

        let changed = new Foods();
        for (let [n, player] of Object.entries(this.players)) {
            let food = player.checkIfGotFood(this.foods);
            if (food) {
                this.foods.eat(food);
                let newFood = this.foods.createNewFood(this.createRandomLocation());
                changed.foodList.push(food, newFood);
                returnVal.eventsList.push(events.add[n]);
                returnVal.toggle[player.snake.cssClass].push(player.snake.getHead());
            }
            else {
                player.snake.removeTail();
                returnVal.eventsList.push(events.move[n]);
                returnVal.toggle[player.snake.cssClass].push(player.snake.getHead(), player.snake.lastTail);
            }
        }
        returnVal.toggle = { ...returnVal.toggle, ...changed.getFoodsByClass() };
        return returnVal;
    }

    checkCollision() {
        let e = [];
        for (let [n, player] of Object.entries(this.players)) {
            let flag = false;
            for (let [m, other] of Object.entries(this.getAllPlayers())) {
                if (m === n) {
                    flag = flag || player.checkIfSnakeHitWall(this.width, this.height) || player.checkIfSnakeHitItself();
                }
                else {
                    flag = flag || player.checkIfSnakeHitOtherPlayer(other);
                }
            }
            if (flag) {
                e.push(events.collsion[n]);
            }
        }
        return e;
    }
}

class Snake {
    constructor(headLoc, cssClass) {
        this.place = [headLoc];
        this.lastTail = this.getTail();
        this.cssClass = cssClass;
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
    constructor(width = 50, height = 50, multiplayer = false) {
        this.intervalId = null;
        this.multiplayer = multiplayer;
        this.display = new Display(new Board(width, height, multiplayer), this.newGame.bind(this));
        this.timeTick = 150;
    }

    initiate() {
        this.display.initiate();
        this.startTick();
        this.getAction();
    }

    startTick() {
        this.intervalId = setInterval(() => {
            let stat = this.display.update();
            if (stat === status.end) {
                this.endTick();
            }
        }, this.timeTick);
    }

    getAction() {
        window.addEventListener('keydown', (e) => {
            for (let [n, player] of Object.entries(this.display.board.players)) {
                if (Object.keys(actions[n]).includes(e.key)) {
                    player.action = actions[n][e.key];
                }
            }
        });
    }

    endTick() {
        clearInterval(this.intervalId);
    }

    newGame() {
        this.endTick();
        this.display.reset();
        this.startTick();
    }
}

class Display {
    constructor(board, newGame) {
        this.board = board;
        this.pixels = [];
        this.scoreDisplay = { 1: document.querySelector('#scoreDisplay1'), 2: document.querySelector('#scoreDisplay2') };
        this.gameHeader = document.querySelector('#header');
        this.boardDisplay = document.querySelector('#board');
        this.newGameButton = document.querySelector('#newGame');
        this.newGameFunction = newGame;
        this.saveResultsButton = document.querySelector('#saveResults');
    }

    initiate() {
        this.buildBoard();
        this.buildNewGameButton();
        this.buildSaveResultsButton();
        this.toggleObjs();
    }

    toggleObjs() {
        for (let player of Object.values(this.board.getAllPlayers())) {
            player.snake.place.forEach((e) => { this.toggleClass(e, player.snake.cssClass) });
        }
        this.board.foods.foodList.forEach((f) => { this.toggleClass(f.location, f.foodType.class) });
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
        this.saveResultsButton.disabled = true;
        this.saveResultsButton.addEventListener('click', () => {
            location.href = "resultsPage.html";
            return false;
        })
    }

    toggleClass(location, cls) {
        this.pixels[location.y][location.x].classList.toggle(cls);
    }

    toggleClassList(lst) {
        Object.keys(lst).forEach((c) => lst[c].forEach((e) => this.toggleClass(e, c)));
    }

    updateScoreDisplay(n) {
        this.scoreDisplay[n].innerText = this.board.players[n].score;
    }

    update() {
        let { eventsList, toggle } = this.board.update();

        this.toggleClassList(toggle);

        if (Object.keys(this.board.players).length == 0) {
            this.gameOver();
            return status.end;
        }
        for (let [n, player] of Object.entries(this.board.players)) {
            if (eventsList.includes(events.add[n])) {
                this.updateScoreDisplay(n);
            }
        }

        for (let [n, player] of Object.entries(this.board.disabledPlayers)) {
            if (eventsList.includes(events.collsion[n])) {
                console.log("collision!");
            }
        }

        return status.ok;
    }

    updateGameHeader(text) {
        this.gameHeader.innerText = text;
    }

    gameOver() {
        this.updateGameHeader('Game Over');
        this.saveResultsButton.disabled = false;
        let allPlayers = this.board.getAllPlayers();
        window.localStorage.setItem('lastScore', Math.max(...Object.keys(allPlayers).map(n => allPlayers[n].score)));
    }

    reset() {
        this.toggleObjs();
        this.board = new Board(this.board.width, this.board.height, this.board.multiplayer);
        for (let n of Object.keys(this.board.players)) {
            this.updateScoreDisplay(n);
        }
        this.updateGameHeader('Snake');
        this.saveResultsButton.disabled = true;
        this.toggleObjs();
    }
}

// main
const game = new Game(25, 25, true);
game.initiate();









