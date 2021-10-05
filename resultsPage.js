/**
 * resultsPage.js conatains the logic of resultsPage.html which allows the user to save his result and to see other users' results. 
 */

/**
 * Results loads and writes users' results to window.localStorage.
 * a single result is represented by an object that holds the player name, his score and the saving time.
 * for example: { 'playerName': 'leah', 'score': 10000, 'time': '02/10/2021, 11:18:56' }
 */
class Results {
    /**
     * constructor method.
     */
    constructor() {
        this.data = this.parseResults(); // represents by a list of results (as explained above)
        this.currentScore = this.getCurrentScore();
        this.currentResult = null; // pointer to the current result.
        this.headers = { 'playerNameTh': 'Player Name', 'scoreTh': 'Score', 'timeTh': 'Time' }; // results table headers.
    }
    /**
     * loads all results from window.localStorage.
     * @returns list of Results
     */
    parseResults() {
        let res = JSON.parse(window.localStorage.getItem('scores'));
        return res ? res : [];
    }
    /**
     * writes all results to window.localStorage.
     */
    saveResults() {
        window.localStorage.setItem('scores', JSON.stringify(this.data));
    }
    /**
     * gets the current score from window.localStorage.
     * @returns String represents the score.
     */
    getCurrentScore() {
        return window.localStorage.getItem('lastScore');
    }
    /**
     * Saves the current result with a given player name and the current time.
     * @param {*} playerName String, the player name from the user input.
     */
    saveCurrentResult(playerName) {
        let date = new Date();
        this.currentResult = { 'playerName': playerName, 'score': this.currentScore, 'time': date.toLocaleString('en-GB') };
        this.data.push(this.currentResult);
        this.sortResultsByScore();
        this.saveResults();
    }
    /**
     * sorts this.data by score from high to low.
     */
    sortResultsByScore() {
        this.data.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    }
}

/**
 * Display is responsible for creating the event listners of buttons on the page and creating the results table.
 */
class Display {
    /**
     * constructor method.
     */
    constructor() {
        this.saveResultButton = document.querySelector('#saveResult');
        this.resultDisplay = document.querySelector('#resultDisplay');
        this.playerNameInput = document.querySelector('#playerName');
        this.resultsTable = document.querySelector('#resultsTable');
        this.allResultsHeader = document.querySelector('#allResultsHeader');
        this.results = new Results();
    }
    /**
     * sets the user's score, creates the event listner of this.saveResultButton.
     * this method is called right after resultsPage.html loads.
     */
    initiate() {
        this.#setResultDisplay(this.results.currentScore);
        this.#buildSaveButton();
    }
    /**
     * sets the current result display with a given text.
     * @param {*} text String, the new text.
     */
    #setResultDisplay(text) {
        this.resultDisplay.innerText = text;
    }
    /**
     * creates the event listner of this.saveResultButton.
     * when the user clicks the button, the current result is saved to this.results
     * and the results table will appear.
     */
    #buildSaveButton() {
        this.saveResultButton.addEventListener('click', () => {
            if (this.playerNameInput.value.length > 0) {
                this.results.saveCurrentResult(this.playerNameInput.value);
                this.saveResultButton.disabled = true;
                this.#buildResultsTable();
            }
        });
    }
    /**
     * builds a table with the data from this.results.
     * the table is built with html elements.
     */
    #buildResultsTable() {
        // unhide table text header
        this.allResultsHeader.style.display = 'block';

        // table header
        let tr = document.createElement('tr');
        for (let header of Object.keys(this.results.headers)) {
            let th = document.createElement('th');
            th.id = `${header}`;
            th.innerText = this.results.headers[header];
            tr.appendChild(th);
        }
        this.resultsTable.appendChild(tr);

        // table data
        for (let line of this.results.data) {
            let tr = document.createElement('tr');
            for (let k of Object.keys(line)) {
                let td = document.createElement('td');
                td.innerText = line[k];
                tr.appendChild(td);
            }
            // color the current result diffrently
            if (line == this.results.currentResult) {
                tr.classList.add('currentResult');
            }
            this.resultsTable.appendChild(tr);
        }
    }
}

// main
const display = new Display();
display.initiate();