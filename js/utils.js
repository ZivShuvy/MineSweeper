// function renderMat(mat, selector) {
//     var strHTML = '<table border="0"><tbody>';
//     for (var i = 0; i < mat.length; i++) {
//         strHTML += '<tr>';
//         for (var j = 0; j < mat[0].length; j++) {
//             var cell = mat[i][j];
//             var className = 'cell cell' + i + '-' + j;
//             strHTML += '<td ' + strId + 'class="' + className + '"> ' + cell + ' </td>'
//         }
//         strHTML += '</tr>'
//     }
//     strHTML += '</tbody></table>';
//     var elContainer = document.querySelector(selector);
//     elContainer.innerHTML = strHTML;
// }

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// function createMat(ROWS, COLS) {
//     var mat = []
//     for (var i = 0; i < ROWS; i++) {
//         var row = []
//         for (var j = 0; j < COLS; j++) {
//             row.push('')
//         }
//         mat.push(row)
//     }
//     return mat
// }

function countNegs(board, pos) {
    var count = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var currCell = board[i][j];
            if(currCell.isMine) count++;
        }
    }
    return count;
}

function sumPrimaryDiag(mat) {
    var sum = 0;
    for (var i = 0; i < mat.length; i++) {
        var cell = mat[i][i]
        sum += cell;
    }
    return sum;
}

function sumSecondaryDiag(mat) {
    var sum = 0;
    for (var i = 0; i < mat.length; i++) {
        var cell = mat[i][mat.length - 1 - i]
        sum += cell;
    }
    return sum;
}

function sumRow(mat, rowIdx) {
    var sum = 0;
    for (var i = 0; i < mat[0].length; i++) {
        sum += mat[rowIdx][i];
    }
    return sum;
}

function sumCol(mat, colIdx) {
    var sum = 0;
    for (var i = 0; i < mat.length; i++) {
        sum += mat[i][colIdx];
    }
    return sum;
}

function getRandomEmptyCell(mat) {
    var emptyCellsCoords = [];
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            if (mat[i][j] === EMPTY) {
                emptyCellsCoords.push({ i, j });
            }
        }
    }
    var randIdx = getRandomInt(0, emptyCellsCoords.length);
    return emptyCellsCoords.splice(randIdx, 1)[0];
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function countTime(startTime, elTimer) {
        var currTime = new Date().getTime();
        var msTimeDiff = startTime - currTime;
        var timeDiffStr = new Date(msTimeDiff).toISOString.slice(17,-1);
        elTimer.innerText = timeDiffStr;
}