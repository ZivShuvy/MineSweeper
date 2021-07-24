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

var gIsFirstClick = true;
var gTimerInterval;

// Bonus tasks variables
var gHints = {
    count: 3,
    isOn: false,
    elCurrHint: null
}

var gSafeClicks = 3;

var gCustomizeMode = {
    isOn: false,
    minesPlaced: 0,
    isDone: false
}

var gGameMoves = [];

// Sound
var gIsSoundOn = true;
var gBgSound = document.querySelector('audio');
gBgSound.volume = 0.3;

function initGame() {
    document.body.style.backgroundImage = 'url(img/gamepage.png)';
    if (gTimerInterval) clearInterval(gTimerInterval);
    var elGameOverModal = document.querySelector('.game-over-modal');
    elGameOverModal.style.display = 'none';
    buildBoard();
    renderBoard();
    resetGameData();
    renderLives();
    renderHints();
    gGame.isOn = true;
}

function resetGameData() {
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    var elFlagsLeft = document.querySelector('.flags');
    elFlagsLeft.innerText = gLevel.MINES - gGame.markedCount;
    gLevel.LIVES = gLevel.TOTAL_LIVES;
    gIsFirstClick = true;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;
    var elSmileyBtn = document.querySelector('.game-status button');
    elSmileyBtn.innerText = '😃';

    //Bonus - Hints
    gHints.count = 3;
    gHints.isOn = false;
    gHints.elCurrHint = null;
    //Bonus - Best scores
    if (localStorage.getItem('beginner') !== null) {
        var elBestScore = document.querySelector('.beginner-score');
        elBestScore.innerText = localStorage.getItem('beginner') + ' seconds';
    }
    if (localStorage.getItem('medium') !== null) {
        var elBestScore = document.querySelector('.medium-score');
        elBestScore.innerText = localStorage.getItem('medium') + ' seconds';
    }
    if (localStorage.getItem('expert') !== null) {
        var elBestScore = document.querySelector('.expert-score');
        elBestScore.innerText = localStorage.getItem('expert') + ' seconds';
    }
    //Bonus - Safe clicks
    gSafeClicks = 3;
    var elAvailableSafeClicks = document.querySelector('.safe-clicks-count');
    elAvailableSafeClicks.innerText = gSafeClicks + ' clicks available';
    //Bonus - Manually positioned mines
    gCustomizeMode.isOn = false;
    gCustomizeMode.minesPlaced = 0;
    gCustomizeMode.isDone = false;
    var elSpan = document.querySelector('.customize span');
    elSpan.innerText = 'Place ' + (gLevel.MINES - gCustomizeMode.minesPlaced) + ' more mines';
    elSpan.style.opacity = 0;
    var elBtn = document.querySelector('.customize button');
    elBtn.innerText = 'Customize';
    //Bonus - Undo
    gGameMoves = [];
}

function endGame(isVictory) {
    gGame.isOn = false;
    var elGameOverModal = document.querySelector('.game-over-modal');
    var elH2 = document.querySelector('.game-over-modal h2');
    var elSmileyBtn = document.querySelector('.game-status button');
    if (isVictory) {
        updateBestScore();
        elH2.innerText = 'Can\'t believe I see you again! \n You\'re a real champion. \n Well Done.';
        elSmileyBtn.innerText = '😎';
    } else {
        elH2.innerText = 'Did you hear this sound? \n I knew it...I just knew it. \n R.I.P';
        elSmileyBtn.innerText = '🤯';
    }
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
    if (gIsSoundOn) {
        var winSound = new Audio('sound/win.mp3');
        winSound.volume = 0.2;
        winSound.play();
    }
    return true;
}

function expandShown(board, elCell, pos) { //Bonus - Full expand
    var currCell = board[pos.i][pos.j];

    if (currCell.isMine) return;

    markCell(board, elCell, pos);

    if (!hasMinesNegs(currCell.minesAroundCount))
        for (var neighborLocation of getNeighborsLocations(board, pos))
            expandShown(board, getElementByPosition(neighborLocation.i, neighborLocation.j), neighborLocation);
}

function getElementByPosition(i, j) {
    return document.querySelector(`#cell-${i}-${j}`);
}

function getNeighborsLocations(board, pos) {
    var neighborsLocations = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            var currCell = board[i][j];
            if (j < 0 || j >= board[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (currCell.isMarked) continue;
            if (currCell.isShown) continue;
            neighborsLocations.push({ i, j });
        }
    }
    return neighborsLocations;
}

function markCell(board, elCell, pos) {
    board[pos.i][pos.j].isShown = true;
    elCell.innerHTML = getElCellContent(board, pos);
    elCell.style.backgroundColor = 'rgb(215, 151, 113)';
}


function hasMinesNegs(negsAmout) {
    return (negsAmout > 0);
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gIsFirstClick) return;
    if (gCustomizeMode.isOn) return;
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
    saveGameState();
    if (checkGameOver(gBoard)) endGame(true);
}


function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    var currCell = gBoard[i][j];

    if (gCustomizeMode.isOn) { //Bonus
        if (gCustomizeMode.minesPlaced === gLevel.MINES) return;
        if (currCell.isMine) return;
        currCell.isMine = true;
        elCell.innerHTML = MINE_IMG;
        gCustomizeMode.minesPlaced++;
        var elSpan = document.querySelector('.customize span');
        elSpan.innerText = 'Place ' + (gLevel.MINES - gCustomizeMode.minesPlaced) + ' more mines';
        return;
    }

    if (gIsFirstClick) {
        if (gIsSoundOn) gBgSound.play();

        startTimer();
        gIsFirstClick = false;
        if (!gCustomizeMode.isDone) {
            placeRandomMines(gBoard, gLevel.MINES, { i, j });
        }
        setMinesNegsCount(gBoard);
        renderBoard();
        saveGameState();
        elCell = document.querySelector(`#cell-${i}-${j}`);
    }

    if (gHints.isOn) {
        openHint(currCell, i, j);
        return;
    }

    if (currCell.isMarked) return;

    if (currCell.isMine) {
        var elLives = document.querySelector('.lives');
        if (gLevel.LIVES === 0) {
            showMines(gBoard);
            elCell.style.backgroundColor = 'rgb(158, 63, 63)';
            elLives.innerHTML = '';
            if (gIsSoundOn) {
                var loseSound = new Audio('sound/lose.mp3');
                loseSound.play();
            }
            endGame(false);
        }
        else {
            var elLife = elLives.querySelector(`.life${gLevel.LIVES - 1}`);
            elLife.style.display = 'none';
            var elSmileyBtn = document.querySelector('.game-status button')
            elSmileyBtn.innerText = '🤯';
            //showing the bomb place + changing smiley for a sec:
            elCell.innerHTML = MINE_IMG;
            elCell.style.background = 'rgb(163, 0, 0)';
            setTimeout(function () {
                elCell.innerHTML = '';
                elCell.style.backgroundColor = 'transparent';
                elSmileyBtn.innerText = '😃';
            }, 1000)
            if (gIsSoundOn) {
                var bombSound = new Audio('sound/boom.mp3');
                bombSound.play();
            }
        }
        gLevel.LIVES--;
    } else {
        expandShown(gBoard, elCell, { i, j });
    }
    saveGameState();
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
            var bgColor = currCell.isShown ? 'rgb(215, 151, 113)' : 'transaprent';
            var cellContent;
            if (currCell.isShown) {
                cellContent = getElCellContent(gBoard, { i, j });
            } else if (currCell.isMarked) {
                cellContent = FLAG_IMG;
            } else {
                cellContent = '';
            }
            strHTML += `<td id="${tdId}"class="${className}"; 
            style="background-color:${bgColor}"
            onclick="onCellClicked(this,${i},${j})" 
            oncontextmenu="onCellMarked(this,${i},${j})">${cellContent}</td>`;
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

// Bonus tasks - Hints

function showNegsFromHint(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var elCurrCell = document.querySelector(`#cell-${i}-${j}`);
            elCurrCell.innerHTML = getElCellContent(board, { i, j });
            elCurrCell.style.backgroundColor = 'rgb(215, 151, 113)';
        }
    }
}

function closeNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var currCell = board[i][j];
            if (currCell.isShown) continue;
            var elCurrCell = document.querySelector(`#cell-${i}-${j}`);
            elCurrCell.innerHTML = currCell.isMarked ? FLAG_IMG : '';
            elCurrCell.style.backgroundColor = 'transparent';
        }
    }
}

function openHint(currCell, i, j) {
    if (currCell.isShown) return;
    gHints.elCurrHint.style.display = 'none';
    showNegsFromHint(gBoard, { i, j });
    setTimeout(function () {
        closeNegs(gBoard, { i, j });
    }, 1000);
    gHints.count--;
    gHints.isOn = false;
    saveGameState();
}

function onHintClicked(elHint) {
    if (gIsFirstClick) return;

    if (gHints.count === 0) return;

    if (gHints.isOn && !elHint.classList.contains('active-hint')) return;

    elHint.classList.toggle('active-hint');
    gHints.isOn = !gHints.isOn;
    if (gIsSoundOn) {
        var hintSound = gHints.isOn ? new Audio('sound/light-on.mp3') : new Audio('sound/light-on.mp3');
        hintSound.play();
    }
    gHints.elCurrHint = elHint;
}

function renderHints() {
    var strHTML = '';
    for (var i = 0; i < gHints.count; i++) {
        strHTML += `<img class = "hint${i}" onclick="onHintClicked(this)" src = "img/hint.png">`;
    }
    var elHints = document.querySelector('.hints');
    elHints.innerHTML = strHTML;
}


// Bonus tasks - Best scores 


function updateBestScore() {
    if (gLevel.SIZE === 4) {
        var beginnerBestScore = localStorage.getItem('beginner');
        if (!beginnerBestScore) {
            localStorage.setItem('beginner', gGame.secsPassed);
        } else {
            if (gGame.secsPassed < beginnerBestScore) {
                localStorage.setItem('beginner', gGame.secsPassed);
            }
        }
    } else if (gLevel.SIZE === 8) {
        var mediumBestScore = localStorage.getItem('medium');
        if (!mediumBestScore) {
            localStorage.setItem('medium', gGame.secsPassed);
        } else {
            if (gGame.secsPassed < mediumBestScore) {
                localStorage.setItem('medium', gGame.secsPassed);
            }
        }
    } else {
        var expertBestScore = localStorage.getItem('expert');
        if (!expertBestScore) {
            localStorage.setItem('expert', gGame.secsPassed);
        } else {
            if (gGame.secsPassed < expertBestScore) {
                localStorage.setItem('expert', gGame.secsPassed);
            }
        }
    }
}

// Bonus tasks - Safe clicks

function onSafeClicked() {
    if (!gGame.isOn) return;
    if (gSafeClicks == 0) return;
    if (gIsFirstClick) return;
    var randSafeCellIdx = getRandomSafeCellIdx(gBoard);
    if (!randSafeCellIdx) return;
    var currCell = gBoard[randSafeCellIdx.i][randSafeCellIdx.j];
    gSafeClicks--;
    var elAvailableSafeClicks = document.querySelector('.safe-clicks-count');
    elAvailableSafeClicks.innerText = gSafeClicks + ' clicks available';
    var elCell = getElementByPosition(randSafeCellIdx.i, randSafeCellIdx.j);
    elCell.style.backgroundColor = '#FFE194';
    setTimeout(function () {
        if (!currCell.isShown) {
            elCell.style.backgroundColor = 'transparent';
        }
    }, 3000);
    if (gIsSoundOn) {
        var safeClickSound = new Audio('sound/safe-click.mp3');
        safeClickSound.volume = 0.3;
        safeClickSound.play();
    }
    saveGameState();
}

function getRandomSafeCellIdx(board) {
    var emptyCellsCoords = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                emptyCellsCoords.push({ i, j });
            }
        }
    }
    var randIdx = getRandomInt(0, emptyCellsCoords.length);
    return emptyCellsCoords.splice(randIdx, 1)[0];
}

// Bonus tasks - Manually positioned mines

function setCustomizeMode(elBtn) {
    if (!gIsFirstClick) return;
    if (gCustomizeMode.isDone) return;
    var elSpan = document.querySelector('.customize span');
    if (gCustomizeMode.isOn && gCustomizeMode.minesPlaced === gLevel.MINES) {
        gCustomizeMode.isDone = true;
        gCustomizeMode.isOn = false;
        elBtn.innerText = 'Customize';
        elSpan.style.opacity = 0; //using opacity to not moving the board
        renderBoard();

    } else if (!gCustomizeMode.isOn) {
        gCustomizeMode.isOn = true;
        elBtn.innerText = 'Apply';
        elSpan.style.opacity = 1;
    }
}

//Bonus tasks - Undo

function saveGameState() {
    var gameState = {
        board: copyObjectMat(gBoard),
        level: copyObject(gLevel),
        game: copyObject(gGame),
        hints: copyObject(gHints),
        safeClicks: gSafeClicks,
    }
    gGameMoves.push(gameState);
}

function onUndoClicked() {
    if (!gGame.isOn) return;
    if (gGameMoves.length <= 1) return;
    gGameMoves.pop();
    var prevGameState = gGameMoves[gGameMoves.length - 1];
    gBoard = copyObjectMat(prevGameState.board);
    gLevel = copyObject(prevGameState.level);
    gGame = copyObject(prevGameState.game);
    gHints = copyObject(prevGameState.hints);
    gSafeClicks = prevGameState.safeClicks;
    // Undo if a cell clicked
    renderBoard();
    // Undo if a bomb cell clicked
    renderLives();
    // Undo if a safe clicked done
    var elAvailableSafeClicks = document.querySelector('.safe-clicks-count');
    elAvailableSafeClicks.innerText = gSafeClicks + ' clicks available';
    // Undo if a hint clicked
    renderHints();
}


// Sound

function onSoundClicked() {
    gIsSoundOn = !gIsSoundOn;
    if (gIsSoundOn) {
        gBgSound.play();
        var soundImg = document.querySelector('.sound');
        soundImg.src = 'img/sound-on.png';
    } else {
        gBgSound.pause();
        var soundImg = document.querySelector('.sound');
        soundImg.src = 'img/sound-off.png';
    }
}