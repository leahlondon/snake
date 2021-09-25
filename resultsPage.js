class Results {
    constructor() {
        this.data = this.parseResults();
        this.currentResult = this.getCurrentResult();
        this.headers = { 'playerNameTh': 'Player Name', 'scoreTh': 'Score', 'timeTh': 'Time' };
    }

    parseResults() {
        let res = JSON.parse(window.localStorage.getItem('scores'));
        if (!res)
            return [];
        return res;
    }

    getCurrentResult() {
        return window.localStorage.getItem('lastScore');
    }

    saveCurrentResult(playerName) {
        let date = new Date();
        this.data.push({ 'playerName': playerName, 'score': this.currentResult, 'time': date.toLocaleString('en-GB') })
        this.sortResultsByScore();
        window.localStorage.setItem('scores', JSON.stringify(this.data));
    }

    sortResultsByScore() {
        this.data.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    }

    getRecentResult() {

    }
}

class Display {
    constructor() {
        this.saveResultButton = document.querySelector('#saveResult');
        this.resultDisplay = document.querySelector('#resultDisplay');
        this.playerNameInput = document.querySelector('#playerName');
        this.resultsTable = document.querySelector('#resultsTable');
        this.allResultsHeader = document.querySelector('#allResultsHeader');
        this.results = new Results();
    }
    initiate() {
        this.setResultDisplay();
        this.buildSaveButton();
    }

    buildSaveButton() {
        this.saveResultButton.addEventListener('click', () => {
            this.results.saveCurrentResult(this.playerNameInput.value);
            this.saveResultButton.disabled = true;
            this.buildResultsTable();
        });
    }
    setResultDisplay() {
        this.resultDisplay.innerText = this.results.currentResult;
    }

    buildResultsTable() {
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

        // data
        for (let line of this.results.data) {
            let tr = document.createElement('tr');
            for (let k of Object.keys(line)) {
                let td = document.createElement('td');
                td.innerText = line[k];
                tr.appendChild(td);
            }
            this.resultsTable.appendChild(tr);
        }
    }
}

const display = new Display();
display.initiate();