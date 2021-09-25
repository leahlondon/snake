class Results {
    constructor() {
        this.data = this.parseResults();
        this.currentResult = this.getCurrentResult();
        this.headers = ['Plater Name', 'Score', 'Time'];
    }

    parseResults() {
        let res = JSON.parse(window.localStorage.getItem('results'));
        if (!res)
            return [];
        return res;
    }

    getCurrentResult() {
        return window.localStorage.getItem('lastResult');
    }

    saveCurrentResult(playerName) {
        this.data.push({ 'playerName': playerName, 'result': this.currentResult, 'time': new Date() })
        window.localStorage.setItem('results', JSON.stringify(this.data));
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
        for (let header of this.results.headers) {
            let th = document.createElement('th');
            th.innerText = header;
            tr.appendChild(th);
        }
        this.resultsTable.appendChild(tr);

        // data
        for (let line of this.results.data) {
            let tr = document.createElement('tr');
            for (let e of Object.values(line)) {
                let td = document.createElement('td');
                td.innerText = e;
                tr.appendChild(td);
            }
            this.resultsTable.appendChild(tr);
        }
    }
}

const display = new Display();
display.initiate();