// constants and vars
const actions = [{ 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down' },
{ 'a': 'left', 'd': 'right', 'w': 'up', 's': 'down' }];
const events = { move: 'move', add: 'add', collsion: 'collision', eaten: 'eaten', newFood: 'newFood' };
const status = { end: 'end', ok: 'ok' };

class Event {
    constructor(type, obj) {
        this.type = type;
        this.obj = obj;
    }
}

class Player {
    constructor(id, snakeLoc, actions, disabled = false) {
        this.id = id;
        this.score = 0;
        this.snake = new Snake(snakeLoc);
        this.action = 'up';
        this.actions = actions;
        this.disabled = disabled;
    }

    disable() {
        this.disabled = true;
    }

    checkIfGotFood(foods) {
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

    removeFood(food) {
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
    constructor(width = 50, height = 50, numPlayers = 1) {
        this.width = width;
        this.height = height;
        this.numPlayers = numPlayers;
        // players
        this.allPlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            this.allPlayers.push(new Player(i + 1, this.createRandomLocation(0.1, 0.8), actions[i]));
        }
        this.enabledPlayers = this.allPlayers;
        // foods
        this.foods = new Foods();
        this.createFoodsOnBoard(2);
    }

    createFoodsOnBoard(n) {
        for (let i = 0; i < n; i++) {
            this.foods.createNewFood(this.createRandomLocation());
        }
    }

    updateEnabledPlayers(updates) {
        let newEnabled = [];
        for (let i = 0; i < this.enabledPlayers.length; i++) {
            if (!updates.includes(i)) {
                newEnabled.push(this.enabledPlayers[i]);
            }
        }
        this.enabledPlayers = newEnabled;
    }

    getUnavailableLocations() {
        let res = [];
        for (let player of this.allPlayers) {
            res.push(...player.snake.place);
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
        for (let player of this.enabledPlayers) {
            player.play();
        }

        let eventsList = [];
        let updates = [];
        for (let i = 0; i < this.enabledPlayers.length; i++) {
            let player = this.enabledPlayers[i];
            let e = this.checkCollision(player);
            if (e) {
                player.snake.removeHead();
                player.disable();
                updates.push(i);
                eventsList.push(e);
            }
        }
        this.updateEnabledPlayers(updates);

        for (let player of this.enabledPlayers) {
            let food = player.checkIfGotFood(this.foods);
            if (food) {
                this.foods.removeFood(food);
                let newFood = this.foods.createNewFood(this.createRandomLocation());
                eventsList.push(new Event(events.eaten, food), new Event(events.newFood, newFood));
                eventsList.push(new Event(events.add, player));
            }
            else {
                player.snake.removeTail();
                eventsList.push(new Event(events.move, player));
            }
        }
        return eventsList;
    }

    checkCollision(player) {
        let flag = false;
        for (let other of this.allPlayers) {
            if (player == other) { // maybe wont work
                flag = flag || player.checkIfSnakeHitWall(this.width, this.height) || player.checkIfSnakeHitItself();
            }
            else {
                flag = flag || player.checkIfSnakeHitOtherPlayer(other);
            }
        }
        if (flag) {
            return new Event(events.collsion, player);
        }
        return null;
    }
}

class Snake {
    constructor(headLoc) {
        this.place = [headLoc];
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
    constructor(width = 50, height = 50, numPlayers = 1) {
        this.numPlayers = numPlayers;
        this.display = new Display(new Board(width, height, numPlayers), this.newGame.bind(this));
        this.intervalId = null;
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
            for (let player of this.display.board.allPlayers) {
                if (Object.keys(player.actions).includes(e.key)) {
                    player.action = player.actions[e.key];
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
        this.pixelSize = 25;
        this.gameHeader = document.querySelector('#header');
        this.boardDisplay = document.querySelector('#board');
        this.newGameButton = document.querySelector('#newGame');
        this.newGameFunction = newGame;
        this.saveResultsButton = document.querySelector('#saveResults');
        this.scoreDisplay = {};
        this.cssClasses = {};
        for (let player of this.board.allPlayers) {
            this.cssClasses[player.id] = `snake${player.id}`;
            this.scoreDisplay[player.id] = document.querySelector('#scoreDisplay' + (player.id));
        }
    }

    initiate() {
        this.buildBoard();
        this.buildNewGameButton();
        this.buildSaveResultsButton();
        this.toggleObjs();
    }

    toggleObjs() {
        for (let player of this.board.allPlayers) {
            player.snake.place.forEach((e) => { this.toggleClass(e, this.cssClasses[player.id]) });
        }
        this.board.foods.foodList.forEach((f) => { this.toggleClass(f.location, f.foodType.class) });
    }

    buildBoard() {
        this.boardDisplay.style.width = `${this.board.width * this.pixelSize}px`;

        for (let i = 0; i < this.board.height; i++) {
            let col = [];
            for (let j = 0; j < this.board.width; j++) {
                let d = document.createElement('div');
                d.classList.add('pixel');
                d.classList.toggle('backgroundPixel');
                d.style.width = `${this.pixelSize}px`;
                d.style.height = `${this.pixelSize}px`;
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

    updateScoreDisplay(player) {
        this.scoreDisplay[player.id].innerText = player.score;
    }

    update() {
        let eventsList = this.board.update();
        for (let e of eventsList) {
            if (e.type === events.collsion) {
                console.log("collision!");
            }

            if (e.type === events.move) {
                this.toggleClass(e.obj.snake.getHead(), this.cssClasses[e.obj.id]);
                this.toggleClass(e.obj.snake.lastTail, this.cssClasses[e.obj.id]);
            }

            if (e.type === events.add) {
                this.toggleClass(e.obj.snake.getHead(), this.cssClasses[e.obj.id]);
                this.updateScoreDisplay(e.obj);
            }

            if (e.type === events.eaten || e.type === events.newFood) {
                this.toggleClass(e.obj.location, e.obj.foodType.class);
            }
        }

        if (this.board.enabledPlayers.length == 0) {
            this.gameOver();
            return status.end;
        }

        return status.ok;
    }

    updateGameHeader(text) {
        this.gameHeader.innerText = text;
    }

    gameOver() {
        this.updateGameHeader('Game Over');
        this.saveResultsButton.disabled = false;
        window.localStorage.setItem('lastScore', Math.max(...this.board.allPlayers.map(p => p.score)));
    }

    createNewBoard() {
        this.board = new Board(this.board.width, this.board.height, this.board.numPlayers);
        for (let player of this.board.allPlayers) {
            this.cssClasses[player.id] = `snake${player.id}`;
            this.scoreDisplay[player.id] = document.querySelector('#scoreDisplay' + (player.id));
            this.updateScoreDisplay(player);
        }
    }

    reset() {
        this.toggleObjs();
        this.createNewBoard();
        this.updateGameHeader('Snake');
        this.saveResultsButton.disabled = true;
        this.toggleObjs();
    }
}

// main
const game = new Game(25, 25, 2);
game.initiate();









