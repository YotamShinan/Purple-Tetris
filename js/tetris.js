'use strict';
console.log('TETRISSSSSS')

var gBoard = [];
var fullCells = [];
var gStartTime = null;
var gGameTime = null;
var gScore = 0;
var gShowScore = null
var startingCubeCorner = [0, 6];
var currentCubeCorner = startingCubeCorner;
var gameIsOn = false;

document.onkeydown = function (e) {
    if (gStartTime) {
        switch (e.keyCode) {
            case 37:
                moveLeft();
                break;
            case 39:
                moveRight();
                break;
            case 40:
                moveDown();
                break;
        }
    }
};

init();

function init() {
    gameIsOn = true;
    gScore = 0;
    currentCubeCorner = startingCubeCorner;
    buildBoard();
    renderBoard();
    startGame();
    gStartTime = Date.now();
    gGameTime = setInterval(runClock, 100);
    gShowScore = setInterval(showScore, 100);
}

function startGame() {
    setInterval(function () {
        moveDown();
    }, 1000);
}

function buildBoard() {
    // debugger
    // initial board state (all cells are in 'isFull: false' state).
    for (var i = 0; i < 30; i++) {
        gBoard[i] = [];
        for (var j = 0; j < 14; j++) {
            var cell = {
                isFull: false,
                negsCount: 0,
                negsPos: [],
                // isMovingShape: false
            }
            gBoard[i].push(cell);
        }
    }
};

function renderBoard() {
    // debugger
    // displaying updated state of board at UI
    var strHtml = ''
    for (var i = 2; i < gBoard.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < gBoard[i].length; j++) {
            strHtml += `<td class="cell cell-${i}-${j} ${gBoard[i][j].isFull ? "isFull" : ""}" 
            data-i-"${i}" data-j-"${j}" onclick="relocateByClick(${i} ,${j})"></td>`
        }
        strHtml += '</tr>'
    }
    var elTableBody = document.querySelector('tbody');
    elTableBody.innerHTML = strHtml;

}

function drawCube(leftTopCubeCorner) {
    // according to upper left cell of the "cube"
    if (gameIsOn) {
        gBoard[leftTopCubeCorner[0]][leftTopCubeCorner[1]].isFull = true;
        gBoard[leftTopCubeCorner[0]][leftTopCubeCorner[1] + 1].isFull = true;
        gBoard[leftTopCubeCorner[0] + 1][leftTopCubeCorner[1]].isFull = true;
        gBoard[leftTopCubeCorner[0] + 1][leftTopCubeCorner[1] + 1].isFull = true;
    }
};

function moveDown() {
    // **THE HEART OF THE GAME**. Unless moved by user - takes the shape down the board one row with every beat.
    //can i move down
    if (isMovable("down")) {
        //delete old row
        gBoard[currentCubeCorner[0]][currentCubeCorner[1]].isFull = false;
        gBoard[currentCubeCorner[0]][currentCubeCorner[1] + 1].isFull = false;

        // set new current cube corner
        currentCubeCorner = [currentCubeCorner[0] + 1, currentCubeCorner[1]];

        //draw new cube
        drawCube(currentCubeCorner)
        renderBoard();

    } else {
        if (currentCubeCorner[0] < 2) {
            gameOver();
        }
        deleteFullRows();
        currentCubeCorner = startingCubeCorner;
        //if not - check why (lose / new cube)    
    }

}

function moveLeft() {
    if (isMovable("left")) {
        //delete old row
        gBoard[currentCubeCorner[0]][currentCubeCorner[1] + 1].isFull = false;
        gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1] + 1].isFull = false;

        // set new current cube corner
        currentCubeCorner = [currentCubeCorner[0], currentCubeCorner[1] - 1];

        //draw new cube
        drawCube(currentCubeCorner)
        renderBoard();
    }
}

function moveRight() {
    if (isMovable("right")) {
        //delete old row
        gBoard[currentCubeCorner[0]][currentCubeCorner[1]].isFull = false;
        gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1]].isFull = false;

        // set new current cube corner
        currentCubeCorner = [currentCubeCorner[0], currentCubeCorner[1] + 1];

        //draw new cube
        drawCube(currentCubeCorner)
        renderBoard();
    }
}

function isMovable(direction) {
    switch (direction) {
        case "down": {
            var isFloor = currentCubeCorner[0] + 2 === gBoard.length;
            if (isFloor) {
                return false;
            }

            return !gBoard[currentCubeCorner[0] + 2][currentCubeCorner[1]].isFull && !gBoard[currentCubeCorner[0] + 2][currentCubeCorner[1] + 1].isFull;
            break;
        }
        case "left": {
            var isLeftWall = currentCubeCorner[1] - 1 < 0;
            if (isLeftWall)
                return false;
            return !gBoard[currentCubeCorner[0]][currentCubeCorner[1] - 1].isFull && !gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1] - 1].isFull;
            break;

        }
        case "right": {
            var isRightWall = currentCubeCorner[1] + 2 === gBoard[0].length;
            if (isRightWall)
                return false;
            var isntRightNeg = !gBoard[currentCubeCorner[0]][currentCubeCorner[1] + 2].isFull && !gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1] + 2].isFull;
            return isntRightNeg
            break;
        }
    }
}

function deleteFullRows() {
    // loops through all rows of board with every touchdown of cube 
    var completedRows = 0;
    for (var i = 0; i < gBoard.length; i++) {
        var count = 0
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isFull) count++;
        }
        if (count === 14) {
            completedRows++;
            for (var j = 0; j < gBoard[i].length; j++) {
                gBoard[i][j].isFull = false;
            }
            moveBoardDown();
        }
    }
    if (completedRows) {
        gScore += completedRows * 100;
    }

}

function copyBoard(mat) {
    var copiedBoard = [];
    for (var i = 0; i < mat.length; i++) {
        copiedBoard[i] = [];
        for (var j = 0; j < mat[i].length; j++) {
            copiedBoard[i][j] = mat[i][j];
        }
    }
    return copiedBoard;
}

function gameOver() {
    // for now happens when when a colum reaches it's full capacity (maybe rows 0 and 1 should never be visible? if so, they should also not be counted for full row hit) 
    gameIsOn = false;
    clearInterval(gGameTime);
    clearInterval(moveDown);
    // alert('Game over');
    // setTimeout(init(), 2000);
}

function runClock() {
    var elClock = document.querySelector('.clock');
    var currTS = Date.now();
    var TSdifference = currTS - gStartTime;
    var minutes = Math.floor((TSdifference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((TSdifference % (1000 * 60)) / 1000);
    if (minutes < 10) { minutes = "0" + minutes } else { minutes = minutes };
    if (seconds < 10) { seconds = "0" + seconds } else { seconds = seconds };
    elClock.innerHTML = minutes + ':' + seconds;

}

function showScore() {
    var elScore = document.querySelector('.score');
    elScore.innerHTML = gScore;
}

function locateNegs(cellIdxI, cellIdxJ) { // Didn't use it eventually
    // locating positions of current 'isFull' immidaiate neighbors
    // debugger
    var rowSatrt = cellIdxI - 1;
    var rowEnd = cellIdxI + 1;
    var colStart = cellIdxJ - 1;
    var colEnd = cellIdxJ + 1;
    for (var i = rowSatrt; i <= rowEnd; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colStart; j <= colEnd; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === cellIdxI && j === cellIdxJ) continue;
            if (gBoard[i][j].isFull) {
                gBoard[cellIdxI][cellIdxJ].negsPos.push([i, j])
            }
        }
    }
}

function updateNegsPositions(board) { // // Didn't use it eventually, too.
    // itarate through board - runs negsCount for each cell and updates it's negs count value 
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            locateNegs(i, j);
        }
    }
}

function moveBoardDown() {
    for (var i = gBoard.length - 1; i > 1; i--) {
        for (var j = 0; j < gBoard[15].length; j++) {
            if ((!gBoard[i][j].isFull) && (gBoard[i - 1][j].isFull)) {
                gBoard[i][j].isFull = true;
                gBoard[i - 1][j].isFull = false;
            }
        }
    }
}

function moveToSide(i, j) {
    // debugger
    if (j < (gBoard[i].length / 2)) {
        moveLeft();
    } else {
        moveRight();
    }
}

function relocateByClick(i, j) {
    //delete old cube
    if (j >= 0 && j < gBoard[i].length - 1){

        gBoard[currentCubeCorner[0]][currentCubeCorner[1]].isFull = false;
        gBoard[currentCubeCorner[0]][currentCubeCorner[1] + 1].isFull = false;
        gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1]].isFull = false;
        gBoard[currentCubeCorner[0] + 1][currentCubeCorner[1] + 1].isFull = false;
    
        currentCubeCorner = [i, j];
    }
}