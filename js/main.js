'use strict';
const MINE_IMG = '<img src ="img/mine.png">';
const FLAG_IMG = '<img src = "img/flag.png">';
const noRightClick = document.querySelector('.board');
noRightClick.addEventListener("contextmenu", e => e.preventDefault());

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
    TOTAL_LIVES: 1
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var isFirstClick = true;
var gTimerInterval;
// Cell object: 
// minesAroundCount: 0,
// isShown: false,
// isMine: false,
// isMarked: false


function initGame() {
    if(gTimerInterval) clearInterval(gTimerInterval);
    var elGameOverModal = document.querySelector('.game-over-modal');
    elGameOverModal.style.display = 'none';
    buildBoard();
    renderBoard();
    resetGameData();
    renderLives();
    gGame.isOn = true;
}

function resetGameData() {
    var elFlagsLeft = document.querySelector('.flags');
    elFlagsLeft.innerText = gLevel.MINES - gGame.markedCount;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gLevel.LIVES = gLevel.TOTAL_LIVES;
    isFirstClick = true;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;
    var elSmileyBtn = document.querySelector('.game-status button');
    elSmileyBtn.innerText = '😃';
}

function endGame(isVictory) {
    gGame.isOn = false;
    var elGameOverModal = document.querySelector('.game-over-modal');
    var elH2 = document.querySelector('.game-over-modal h2');
    var elSmileyBtn = document.querySelector('.game-status button');
    elH2.innerHTML = isVictory ? 'Victory! Good Job' : 'You Lost! Try again';
    elSmileyBtn.innerText = isVictory ? '😎' : '🤯'; 
    elGameOverModal.style.display = 'block';
    clearInterval(gTimerInterval);
}

function checkGameOver(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine && !currCell.isMarked) {
                return false;
            }
            else if (!currCell.isMine && !currCell.isShown) {
                return false;
            }
        }
    }
    return true;
}

function showNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            //model
            var currCell = board[i][j];
            currCell.isShown = true;
            //dom
            var elCurrCell = document.querySelector(`#cell-${i}-${j}`);
            elCurrCell.innerHTML = getElCellContent(board, { i, j });
            elCurrCell.style.backgroundColor = 'lightgray';
        }
    }
}

function expandShown(board, elCell, pos) {
    var currCell = board[pos.i][pos.j];
    var negsAmout = currCell.minesAroundCount;
    currCell.isShown = true;
    elCell.innerHTML = getElCellContent(board, pos);
    elCell.style.backgroundColor = 'lightgray';
    if (negsAmout) {
        return;
    }
    showNegs(board, pos);
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    currCell.isMarked = !currCell.isMarked;
    if (currCell.isMarked) {
        elCell.innerHTML = FLAG_IMG;
        gGame.markedCount++;
    } else {
        elCell.innerHTML = '';
        gGame.markedCount--;
    }
    var elFlagsLeft = document.querySelector('.flags');
    elFlagsLeft.innerText = gLevel.MINES - gGame.markedCount;
    if (checkGameOver(gBoard)) endGame(true);
}


function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return;

    if (isFirstClick) {
        startTimer();
        isFirstClick = false;
        placeRandomMines(gBoard, gLevel.MINES, { i, j });
        setMinesNegsCount(gBoard);
        renderBoard();
        elCell = document.querySelector(`#cell-${i}-${j}`);
    }

    var currCell = gBoard[i][j];

    if (currCell.isMarked) return;

    if (currCell.isMine) {
        var elLives = document.querySelector('.lives');
        if (gLevel.LIVES === 0) {
            showMines(gBoard);
            elCell.style.backgroundColor = 'red';
            elLives.innerHTML = '';
            endGame(false);
        }
        else {
            var elLife = elLives.querySelector(`.life${gLevel.LIVES-1}`);
            elLife.style.display = 'none';
            var elSmileyBtn = document.querySelector('.game-status button')
            elSmileyBtn.innerText = '🤯';
            //showing the bomb place + changing smiley for a sec:
            elCell.innerHTML = MINE_IMG;
            elCell.style.background = 'red';
            setTimeout(function () {
                elCell.innerHTML = '';
                elCell.style.backgroundColor = 'transparent';
                elSmileyBtn.innerText = '😃';
            }, 1000)
        }
        gLevel.LIVES--;
    } else {
        expandShown(gBoard, elCell, { i, j });
    }

    if (checkGameOver(gBoard)) endGame(true);
}

function startTimer() {
    var startTime = new Date();
    gTimerInterval = setInterval(function () {
        var currTime = new Date().getTime();
        var msTimeDiff = currTime - startTime;
        gGame.secsPassed = parseInt(msTimeDiff / 1000);
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = gGame.secsPassed;
    }, 1000)
}

function showMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true;
                var elCurrCell = document.querySelector(`#cell-${i}-${j}`);
                elCurrCell.innerHTML = MINE_IMG;
            }
        }
    }
}

function renderLives() {
    var strHTML = '';
    for (var i = 0; i < gLevel.LIVES; i++) {
        strHTML += `<img class = "life${i}" src = "img/life.png">`;
    }
    var elLives = document.querySelector('.lives');
    elLives.innerHTML = strHTML;
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var negsCount = currCell.minesAroundCount;
            var className = currCell.isMine ? 'mine' : `number${negsCount}`;
            var tdId = `cell-${i}-${j}`;
            strHTML += `<td id="${tdId}"class="${className}"; 
            onclick="onCellClicked(this,${i},${j})" 
            oncontextmenu="onCellMarked(this,${i},${j})">${currCell.isShown ? getElCellContent(gBoard, { i, j }) : ''}</td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getElCellContent(board, pos) {
    var currCell = board[pos.i][pos.j];
    if (currCell.isMine) {
        return MINE_IMG;
    } else {
        if (currCell.minesAroundCount !== 0) {
            return currCell.minesAroundCount;
        } else {
            return '';
        }
    }
}

function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = createCell();
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var negsCount = countNegs(board, { i, j });
            board[i][j].minesAroundCount = negsCount;
        }
    }
}

function placeRandomMines(board, minesAmount, pos) {
    for (var idx = 0; idx < minesAmount; idx++) {
        var randI = getRandomInt(0, board.length);
        var randJ = getRandomInt(0, board[0].length);
        var currCell = board[randI][randJ];
        while (currCell.isMine || (randI === pos.i && randJ === pos.j)) {
            randI = getRandomInt(0, board.length);
            randJ = getRandomInt(0, board[0].length);
            currCell = board[randI][randJ];
        }
        currCell.isMine = true;
    }
}

function setGameLevel(elBtn) {
    if (!gGame.isOn) return;

    var level = elBtn.className;
    if (level === 'beginner') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLevel.LIVES = 1;
        gLevel.TOTAL_LIVES = 1;
    } else if (level === 'medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gLevel.LIVES = 2;
        gLevel.TOTAL_LIVES = 2;
    } else {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gLevel.LIVES = 3;
        gLevel.TOTAL_LIVES = 3;
    }
    clearInterval(gTimerInterval);
    initGame();
}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}