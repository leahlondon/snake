class Results {
    constructor() {
        this.results = this.parseResults();
        this.currentResult = this.getCurrentResult();
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
        this.results.push({ 'playerName': playerName, 'result': this.currentResult, 'time': new Date() })
        window.localStorage.setItem('results', JSON.stringify(this.results));
    }
}

class Display {
    constructor() {
        this.saveResultButton = document.querySelector('#saveResult');
        this.resultDisplay = document.querySelector('#resultDisplay');
        this.playerNameInput = document.querySelector('#playerName');
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
        });
    }
    setResultDisplay() {
        this.resultDisplay.innerText = this.results.currentResult;
    }
}
const display = new Display();
display.initiate();