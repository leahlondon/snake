/**
 * snake.js conatains the logic of snake.html which is the game page.
 * there are 3 important classes in this file:
 * 1) Game - gets the user input and updates the Display every time tick.
 * 2) Board - holds the main logic of the game - moves the Snakes, checks for collisions and updates Display accordingly. 
 * 3) Display - controls the different html elements in snake.html like buttons, headers and the game's board.
 */

// constants
const events = { move: 'move', add: 'add', collsion: 'collision', eaten: 'eaten', newFood: 'newFood' };
const status = { end: 'end', ok: 'ok' };

/**
 * Location represents a pair of x,y coordinates on the Board.
 */
class Location {
    /**
     * constructor method.
     * @param {*} x a number, x coordinate.
     * @param {*} y a number, y coordinate.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * checkes of this Location equals other Location object.
     * @param {*} other Location object.
     * @returns true if equal, otherwise false.
     */
    equal(other) {
        return (this.x === other.x && this.y === other.y);
    }
    /**
     * checks if this Location is equal to other Location object in a given list of Location(s).
     * @param {*} lst list of Location objects.
     * @returns true if in list, otherwise false.
     */
    isInList(lst) {
        for (let other of lst) {
            if (this.equal(other)) {
                return true;
            }
        }
        return false;
    }
    /**
     * creates a new Location object that represents the next location.
     * the next location depends this Location and the given action.
     * @param {*} action String that represents an action of some game player.
     * @returns Location object.
     */
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

/**
 * Snake is represented by a list of Location objects of where the Snake (head and body) currently is on the Board.
 * this.place is the list of Location objects. 
 * in addition, we keep track of this.lastTail which is the last Location that was removed from this.place (in other words,
 * the last place the Snake has been on Board BEFORE the method move).
 */
class Snake {
    /**
     * constructor method.
     * @param {*} headLoc Location object that represents the initial location of the Snake's head.
     */
    constructor(headLoc) {
        this.place = [headLoc];
        this.lastTail = this.getTail();
    }
    /**
     * returns a list that represents the location of the Snake's body.
     * @returns a list of Location objects.
     */
    getPlaceNoHead() {
        return this.place.slice(1);
    }
    /**
     * returns the last Location that was added to this.place, meaning, the Snake's tail.
     * @returns Location object.
     */
    getTail() {
        return this.place[this.place.length - 1];
    }
    /**
     * returns the first Location in this.place, meaning, the Snake's head.
     * @returns Location object.
     */
    getHead() {
        return this.place[0];
    }
    /**
     * removes the tail (this.getTail()) from this.place.
     */
    removeTail() {
        this.lastTail = this.place.pop();
    }
    /**
     * removes the head (this.head()) from this.place.
     */
    removeHead() {
        this.place.shift();
    }
    /**
     * adds new Location object to the first index of this.place, meaning, updating the head's location.
     * @param {*} action String that represents an action of some game player.
     */

    moveHead(action) {
        this.place.unshift(this.getHead().nextLoc(action));
    }
}

/**
 * Player represents a player in the game. 
 * Partically, a player is a Snake with a score and an action:
 * - score: the player's point count in the current game.
 * - action: the direction which the Snake is currently moving.
 * Furthermore, a Player has an id used by Display and Game to decide the Snake's color, Player's action keys etc.
 * A player can be disabled which means he was disqualified.
 */
class Player {
    /**
     * constructor method.
     * @param {*} id String id that is given by the Board.
     * @param {*} snakeLoc Location object that represents the initial location of the Snake's head.
     */
    constructor(id, snakeLoc) {
        this.id = id;
        this.score = 0;
        this.snake = new Snake(snakeLoc);
        this.action = 'up';
        this.disabled = false;
    }
    /**
     * disqualify a Player.
     */
    disable() {
        this.disabled = true;
    }

    /**
     * checks if the the player got any food, meaning, 
     * the location of the Snake's head is the same as the location of the food.
     * @param {*} foods Foods object, represents current foods on the Board.
     * @returns Food object that the player got, else null. 
     */
    checkIfGotFood(foods) {
        for (let food of foods.foodList) {
            if (this.snake.getHead().equal(food.location)) {
                this.score += food.foodType.score;
                return food;
            }
        }
        return null;
    }
    /**
     * checks if the Snake's head is out of the Board's dimentions.
     * @param {*} width a number, board's width
     * @param {*} height a number, board's height
     * @returns true if the Snake's head is out of bounds, else false.
     */
    checkIfSnakeHitWall(width, height) {
        return (this.snake.getHead().x < 0 || this.snake.getHead().x >= width ||
            this.snake.getHead().y < 0 || this.snake.getHead().y >= height);
    }
    /**
     * checkes if the Snake's head is the same location as the other Player's Snake.
     * @param {*} otherPlayer Player object, other player on the Board.
     * @returns true if the Snake's head hit another Snake, else false.
     */
    checkIfSnakeHitOtherPlayer(otherPlayer) {
        return (this.snake.getHead().isInList([...otherPlayer.snake.place]));
    }
    /**
     * checks if the Snake's head is the same location as the boay of the Snake (self loop).
     * @returns true if the Snake hit itself, else false.
     */
    checkIfSnakeHitItself() {
        return this.snake.getHead().isInList([...this.snake.getPlaceNoHead()]);
    }
    /**
     * moves the Snake according to the Player's action.
     */
    play() {
        this.snake.moveHead(this.action);
    }
}

/**
 * FoodType consists of a class and the a score and represents a certain food type in the game.
 */
class FoodType {
    /**
     * constructor method.
     * @param {*} foodClass String represents the css class (defineds the color) of the food.
     * @param {*} score a number represents the score the player gets by eating this food.
     */
    constructor(foodClass, score) {
        this.foodClass = foodClass;
        this.score = score;
    }
}

/**
 * FoodItem represents Snake's food in the game.
 * The players in the game "eat" the food in order to get points and win the game.
 * FoodItem consisnts of FoodType and Location.
 */
class FoodItem {
    /**
     * constructor method.
     * @param {*} foodType FoodType object, represents the food type (apple, blueberry, etc.)
     * @param {*} location Location object, represents the location of the food on the Board.
     */
    constructor(foodType, location) {
        this.foodType = foodType;
        this.location = location;
    }
}

/**
 * Foods holds a list of the current FoodItem(s) on the Board.
 * Foods also has a list of all possible FoodType(s) in the game.
 */
class Foods {
    /**
     * constructor method.
     */
    constructor() {
        this.foodList = [];
        let apple = new FoodType('apple', 1);
        let blueberry = new FoodType('blueberry', 2);
        this.options = [apple, apple, apple, blueberry];
    }

    /**
     * creates a new FoodItem at a given location. 
     * the created FoodItem is added to this.foodList.
     * @param {*} foodLoc Location object, represents the location of the new FoodItem.
     * @returns FoodItem object that was created.
     */
    createNewFood(foodLoc) {
        let rand = Math.floor(Math.random() * this.options.length);
        let newFood = new FoodItem(this.options[rand], foodLoc);
        this.foodList.push(newFood);
        return newFood;
    }
    /**
     * returns the locatoins of all the current FoodItem(s) on the Board.
     * @returns list of Location objects.
     */
    getFoodCurrentLocations() {
        return this.foodList.map((e) => e.location);
    }
    /**
     * removes a given FoodItem object from this.foodList.
     * @param {*} food FoodItem object.
     */
    removeFood(food) {
        for (let i = 0; i < this.foodList.length; i++) {
            if (this.foodList[i].location.equal(food.location)) {
                this.foodList.splice(i, 1);
                break;
            }
        }
    }
}

/**
 * an Event conations information about a "change" that happened in a game tick.
 * For example - Player (object) moved, Food (object) was eaten, etc. 
 */
class Event {
    /**
     * constructor method.
     * @param type what has happened to obj (see const events) 
     * @param obj the relevent object (Player or Food)
     */
    constructor(type, obj) {
        this.type = type;
        this.obj = obj;
    }
}

/**
 * Board consists of the Player(s), the Foods and the dimemntions of the game's board.
 * Board is responsible on updating the Player(s) and the Food(s) on each game time tick.  
 */
class Board {
    /**
     * constructor method.
     * @param {*} width a number, the width of the game's board.
     * @param {*} height a number, the height of the game's board.
     * @param {*} numPlayers a number, the number of players in the game.
     */
    constructor(width = 50, height = 50, numPlayers = 1) {
        // dimentions
        this.width = width;
        this.height = height;
        // players
        this.numPlayers = numPlayers;
        this.allPlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            this.allPlayers.push(new Player(i + 1, this.createRandomLocation(0.1, 0.8)));
        }
        this.enabledPlayers = this.allPlayers;
        // foods
        this.foods = new Foods();
        this.createFoodsOnBoard(this.numPlayers);
    }

    /**
     * adds multiple new foods to this.foods according to a given value.
     * @param {*} n a number, the number of new foods to create.
     */
    createFoodsOnBoard(n) {
        for (let i = 0; i < n; i++) {
            this.foods.createNewFood(this.createRandomLocation());
        }
    }
    /**
     * returns a list of Location objects that represents the locations on the Board that has Player's Snake/FoodItem on them.
     * @returns a list of Location objects.
     */
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

    /**
     * creates a new Location object represents some random free location on the Board (not in this.getUnavailableLocations()).
     * @param {*} from a number from 0 to 1, the relative part ov the board from which the Location we be created.
     * @param {*} over a number from 0 to 1, the relative part of the board in which the Location we be created.
     * example: assume this is the Board (6X6):
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     * createRandomLocation(from = 0, over = 0.5) - will create a location at the left top 1/4 of the board:
     *  $   $   $   #   #   #
     *  $   $   $   #   #   #
     *  $   $   $   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  createRandomLocation(from = 0.5, over = 0.3333333):
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   #   #   #
     *  #   #   #   $   $   #
     *  #   #   #   $   $   #
     *  #   #   #   #   #   #
     * @returns Location object.
     */
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
    /**
     * help method. removes disabled Players from this.enabledPlayers.
     * @param {*} updates a list of numbers that represents the indexies of Players in this.enabledPlayers
     * that no are longer enabled, meaning, these Players have been disqualified.
     */
    updateEnabledPlayers(updates) {
        let newEnabled = [];
        for (let i = 0; i < this.enabledPlayers.length; i++) {
            if (!updates.includes(i)) {
                newEnabled.push(this.enabledPlayers[i]);
            }
        }
        this.enabledPlayers = newEnabled;
    }
    /**
     * updates the Players and the Foods on the Board according to the current actions of the Players.
     * @returns a list of Event objects represents the events that have happened this update.
     */
    update() {
        // make a move with all the enabled players in the game
        for (let player of this.enabledPlayers) {
            player.play();
        }

        let eventsList = [];
        let updates = [];
        // check if there are players that got disqualified
        for (let i = 0; i < this.enabledPlayers.length; i++) {
            let player = this.enabledPlayers[i];
            if (this.checkCollision(player)) {
                player.snake.removeHead();
                player.disable();
                updates.push(i);
                eventsList.push(new Event(events.collsion, player));
            }
        }
        this.updateEnabledPlayers(updates);

        // check if any of the enabled players got food
        for (let player of this.enabledPlayers) {
            let food = player.checkIfGotFood(this.foods);
            if (food) {
                this.foods.removeFood(food);
                let newFood = this.foods.createNewFood(this.createRandomLocation());
                eventsList.push(new Event(events.eaten, food), new Event(events.newFood, newFood));
                eventsList.push(new Event(events.add, player));
            }
            // the player didn't got any food
            else {
                player.snake.removeTail();
                eventsList.push(new Event(events.move, player));
            }
        }
        return eventsList;
    }
    /**
     * check if a given Player got disqualified.
     * @param {*} player Player object.
     * @returns true if got disqualified, else false.
     */
    checkCollision(player) {
        let flag = false;
        for (let other of this.allPlayers) {
            if (player == other) {
                flag = flag || player.checkIfSnakeHitWall(this.width, this.height) || player.checkIfSnakeHitItself();
            }
            else {
                flag = flag || player.checkIfSnakeHitOtherPlayer(other);
            }
        }
        return flag;
    }
}

/**
 * Display is responsible for controlling and managing the .html (snake.html) and .css (snake.css) documents that displays the game to the user.
 */
class Display {
    /**
     * constructor method.
     * @param {*} board Board object.
     * @param {*} newGame function of Game (class) that restarts the game.
     */
    constructor(board, newGame) {
        this.board = board;
        this.pixels = []; // two dimentional array of div html elemnts that represent the display of this.board.
        this.pixelSize = 25;
        this.gameHeader = document.querySelector('#header');
        this.boardDisplay = document.querySelector('.board');
        this.newGameButton = document.querySelector('#newGame');
        this.newGameFunction = newGame;
        this.saveResultsButton = document.querySelector('#saveResults');
        this.manchAudio = new Audio('sounds\\munch.mp3');
        this.backgroundMusic = new Audio('sounds\\Bit_Menu_-_David_Renda_-_FesliyanStudios.mp3');
        this.backgroundMusic.loop = true;
        // dictionaries whose keys are the this.board.allPlayers id's. 
        this.scoreDisplay = {};
        this.cssClasses = {};
        for (let player of this.board.allPlayers) {
            this.cssClasses[player.id] = `snake${player.id}`;
            this.scoreDisplay[player.id] = document.querySelector('#scoreDisplay' + (player.id));
        }
    }
    /**
     * builds the basis of the display.
     * this function runs only once when the page loads, as opposed to this.reset that runs every time the user askes for new Game.
     */
    initiate() {
        // creates the board's pixels (this.pixels)
        this.buildBoard();
        // creates event listener for this.newGameButton
        this.buildNewGameButton();
        // creates event listener for this.saveResultsButton
        this.buildSaveResultsButton();
        // draws current elements (Players' Snakes/Foods on this.board)
        this.toggleObjs();
    }
    /**
     * creates this.pixels two dimentional array. 
     * each pixel is a div html element with the css classes of 'pixel' and 'backgroundPixel'.
     * the pixels are added as children to this.boardDisplay html element.
     */
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
    /**
     * creates event listener for this.newGameButton.
     * when the user clicks on this button the current game stops and a new game loads.
     */
    buildNewGameButton() {
        this.newGameButton.addEventListener('click', () => {
            this.gameStopped();
            this.newGameFunction();
            this.reset();
        });
    }
    /**
     * creates event listener for this.saveResultsButton.
     * when the user clicks on this button, the user is being transfered to resultsPage.html.
     */
    buildSaveResultsButton() {
        this.saveResultsButton.disabled = true;
        this.saveResultsButton.addEventListener('click', () => {
            location.href = "resultsPage.html";
            return false;
        })
    }
    /**
     * turns on/off the display of the Players and the Foods on the board.
     */
    toggleObjs() {
        for (let player of this.board.allPlayers) {
            player.snake.place.forEach((e) => { this.toggleClass(e, this.cssClasses[player.id]) });
        }
        this.board.foods.foodList.forEach((f) => { this.toggleClass(f.location, f.foodType.foodClass) });
    }
    /**
     * gets a location on the board and toggles the given class of the pixel at that location.
     * @param {*} location Location object.
     * @param {*} cls String, represents a css class.
     */
    toggleClass(location, cls) {
        this.pixels[location.y][location.x].classList.toggle(cls);
    }
    /**
     * updates this.board and gets a list of Event objects.
     * for each Event the Display will update diffrently.
     * @returns String, a status from const status.
     */
    update() {
        let eventsList = this.board.update();
        for (let e of eventsList) {
            if (e.type === events.collsion) {
                console.log("collision!"); // in the future we will inform the user that his Snake got disqualified.
            }

            else if (e.type === events.move) {
                this.toggleClass(e.obj.snake.getHead(), this.cssClasses[e.obj.id]);
                this.toggleClass(e.obj.snake.lastTail, this.cssClasses[e.obj.id]);
            }

            else if (e.type === events.add) {
                this.toggleClass(e.obj.snake.getHead(), this.cssClasses[e.obj.id]);
                this.updateScoreDisplay(e.obj);
                this.manchAudio.play();
            }

            else if (e.type === events.eaten || e.type === events.newFood) {
                this.toggleClass(e.obj.location, e.obj.foodType.foodClass);
            }
        }
        // if the game has ended the display will return status.end to the Game object that will result by stopping the main loop.
        // in addition, this.gameOver is called so the buttons and headers are updates accordingly.
        if (this.board.enabledPlayers.length == 0) {
            this.gameOver();
            return status.end;
        }

        return status.ok;
    }

    /**
     * updates the score display (the corresponding html element) of a given Player with the current score. 
     * @param {*} player Player object.
     */
    updateScoreDisplay(player) {
        this.scoreDisplay[player.id].innerText = player.score;
    }
    /**
     * stops the game because all players has been disabled.
     */
    gameOver() {
        // stops background music
        this.gameStopped();
        // updates game header
        this.updateGameHeader('Game Over');
        // allows the user to save his results
        this.saveResultsButton.disabled = false;
        // saves the winner's results in window.localStorage
        window.localStorage.setItem('lastScore', Math.max(...this.board.allPlayers.map(p => p.score)));
    }
    /**
     * stops and resets the background music.
     */
    gameStopped() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
    /**
     * updates the game header and starts the background music.
     */
    gameStarted() {
        this.updateGameHeader('Snake');
        this.backgroundMusic.play();
    }
    /**
     * creates new Board object and resets the display accordingly.
     */
    reset() {
        // "delete" the display of all elements on board (Players' Snakes/Foods)
        this.toggleObjs();
        // creates a new Board object
        this.createNewBoard();
        // updates game header
        this.updateGameHeader('Press any key to start...');
        // by default, this button is disabled
        this.saveResultsButton.disabled = true
        // "draw" all the of all elements on the new board (Players' Snakes/Foods)
        this.toggleObjs();
    }
    /**
     * creates new Board object and updates this.board, this.cssClasses and this.scoreDisplay accordingly.
     */
    createNewBoard() {
        this.board = new Board(this.board.width, this.board.height, this.board.numPlayers);
        for (let player of this.board.allPlayers) {
            this.cssClasses[player.id] = `snake${player.id}`;
            this.scoreDisplay[player.id] = document.querySelector('#scoreDisplay' + (player.id));
            this.updateScoreDisplay(player);
        }
    }
    /**
     * updates the game header (the corresponding html element) with a given text.
     * @param {*} text String, new header
     */
    updateGameHeader(text) {
        this.gameHeader.innerText = text;
    }
}

/**
 * Game is the class that run and menage the actual game.
 * Game holds the game's settings (numPlayers, timeTick and actions) and updates the Display object every time tick.
 * furthermore, Game creates the event listener that updates the Players' actions.
 */
class Game {
    /**
     * constructor method.
     * @param {*} width a number, board's width
     * @param {*} height a number, board's height
     */
    constructor(width = 50, height = 50) {
        this.numPlayers = this.getNumPlayers();
        this.timeTick = 150;
        this.actions = {
            1: { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down' },
            2: { 'KeyA': 'left', 'KeyD': 'right', 'KeyW': 'up', 'KeyS': 'down' }
        };
        // creates the Display object
        this.display = new Display(new Board(width, height, this.numPlayers), this.newGame.bind(this));
        // the intervalId the id of the "main loop" of the game
        this.intervalId = null;
        // if this.waitingForKey == true then the actual game has not yet started and Game waits for user key input.
        this.waitingForKey = true;
    }
    /**
     * creates the foundation for actual game to start.
     */
    initiate() {
        // draws the board and the Players' Snakes/Foods on it.
        this.display.initiate();
        // creates the event listener for getting Players' actions from user.
        this.getAction();
        // creates the event listener for starting the game.
        this.pressToStart();
    }
    /**
     * creates the event listener for getting Players' actions from user.
     */
    getAction() {
        window.addEventListener('keydown', (e) => {
            for (let player of this.display.board.allPlayers) {
                if (Object.keys(this.actions[player.id]).includes(e.code)) {
                    player.action = this.actions[player.id][e.code];
                }
            }
        });
    }
    /**
     * creates the event listener for starting the game: 
     * the actual game will start when the user presses any key on the keyboard.
     */
    pressToStart() {
        window.addEventListener('keydown', () => {
            if (this.waitingForKey) {
                this.waitingForKey = false;
                this.display.gameStarted();
                this.startTick();
            }
        });
    }
    /**
     * gets the number of players which was chosen by the user in openingPage.html.
     * @returns a number, the number of players.
     */
    getNumPlayers() {
        return parseInt(window.localStorage.getItem('numPlayers'));
    }
    /**
     * starts the main loop that calls the method this.display.update every time tick.
     */
    startTick() {
        this.intervalId = setInterval(() => {
            let stat = this.display.update();
            if (stat === status.end) {
                this.endTick();
            }
        }, this.timeTick);
    }
    /**
     * ends the main loop. 
     */
    endTick() {
        clearInterval(this.intervalId);
    }
    /**
     * ends the current main loop, meaning - 
     * everything is ready for a new game that will begin when the user presses any key.
     */
    newGame() {
        this.endTick();
        this.waitingForKey = true;
    }
}

// main
const game = new Game(25, 25);
game.initiate();









