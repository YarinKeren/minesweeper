var gBoard;
var gLevel = {
  SIZE: 4,
  MINES: 2,
};
const gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  isFirstClick: true,
  lives: 3,
  hints: 3,
  isHintClick: false,
};

function onInit(boardSize = 4, mineAmount = 2) {
  restartGame(boardSize, mineAmount);
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function restartGame(boardSize, mineAmount) {
  gGame.isFirstClick = true;
  document.querySelector(".game-state").innerText = "😊";
  gLevel.SIZE = boardSize;
  gLevel.MINES = mineAmount;
  gGame.lives = gLevel.MINES === 2 ? 2 : 3;
  gGame.hints = 3;
  gGame.isOn = true;
}

function makeMines(board, clickI, clickJ) {
  for (let i = 0; i < gLevel.MINES; i++) {
    let row = getRandomInt(0, gLevel.SIZE);
    let col = getRandomInt(0, gLevel.SIZE);

    while ((row == clickI && col == clickJ) || board[row][col].isMine) {
      row = getRandomInt(0, gLevel.SIZE);
      col = getRandomInt(0, gLevel.SIZE);
    }
    board[row][col].isMine = true;
  }
}

function buildBoard() {
  const board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        wasAlreadyShown: false,
      };
      board[i][j] = cell;
    }
  }
  return board;
}

function renderLives() {
  let livesSTR = "";
  let livesAmount = gLevel.MINES === 2 ? gGame.lives : gGame.lives;
  for (let i = 0; i < livesAmount; i++) {
    livesSTR += "💖";
  }
  document.querySelector(".lives").innerText = livesSTR;
}

function renderHints() {
  let hintsSTR = "";
  for (let i = 0; i < gGame.hints; i++) {
    hintsSTR += `<span onclick="getHint(this)">💡</span>`;
  }
  document.querySelector(".hints").innerHTML = hintsSTR;
}

function getHint(elSpan) {
  elSpan.classList.add("highlight-hint");
  gGame.hints--;
  gGame.isHintClick = true;
}

function renderBoard(board) {
  var strHTML = "";
  let cellContent = "";
  let isClicked = "";

  renderLives();
  renderHints();

  for (let i = 0; i < gLevel.SIZE; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = board[i][j];
      if (cell.isMine && cell.isShown) cellContent = "💣";
      else if (cell.isMarked) cellContent = "🚩";
      else if (cell.isShown) {
        cellContent = cell.minesAroundCount;
        // isClicked = "clicked";
      } else cellContent = "";
      strHTML += `\t<td data-i="${i}" data-j="${j}"
                                 class="cell ${isClicked}"
                                onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, event)"> ${cellContent}
                             </td>\n`;
    }
    strHTML += `</tr>\n`;
  }
  const elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

function revealMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j].isMine) board[i][j].isShown = true;
    }
  }
  gGame.isOn = false;
  document.querySelector(".game-state").innerText = "😵";
  renderBoard(board);
}

function checkGameOver() {
  if (
    gLevel.MINES === gGame.markedCount &&
    gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES
  ) {
    document.querySelector(".game-state").innerText = "😎";
    return true;
  }
  return false;
}

function onCellMarked(elCell, ev) {
  ev.preventDefault();
  if (!gGame.isOn) return;
  const cell = gBoard[elCell.dataset.i][elCell.dataset.j];
  if (cell.isShown) return;
  if (!cell.isMarked) {
    gGame.markedCount++;
    cell.isMarked = true;
  } else {
    gGame.markedCount--;
    cell.isMarked = false;
  }
  if (checkGameOver()) gGame.isOn = false;
  renderBoard(gBoard);
}

function onCellClicked(elCell, i, j) {
  const cell = gBoard[i][j];
  // ignore flagged cells
  if (gGame.isFirstClick) {
    gGame.isFirstClick = false;
    makeMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
  }
  if (!gGame.isOn) return;
  if (cell.isShown) return;
  if (cell.isMarked) return;
  if (gGame.isHintClick) {
    gGame.isHintClick = false;
    highlightNeighbors(gBoard, i, j);
    renderBoard(gBoard);
    setTimeout(() => {
      hideNeighbors(gBoard, i, j);
      renderBoard(gBoard);
    }, 1000);
    return;
  }
  if (cell.isMine) {
    gGame.lives--;
    if (gGame.lives === 0) {
      revealMines(gBoard, i, j);
      return;
    }
    gBoard[elCell.dataset.i][elCell.dataset.j].isShown = true;
    renderBoard(gBoard);
    return;
  }

  if (cell.minesAroundCount === 0) {
    expandShown(gBoard, i, j);
    cell.isShown = true;
  } else {
    cell.isShown = true;
    gGame.shownCount++;
  }

  if (checkGameOver()) gGame.isOn = false;
  renderBoard(gBoard);
}

function expandShown(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (!currCell.isShown && !currCell.isMine && !currCell.isMarked) {
        // Reveal the cell and increment the shown count
        currCell.isShown = true;
        gGame.shownCount++;
        // If the cell has no adjacent mines, recursively expand its neighbors
        if (currCell.minesAroundCount === 0) {
          expandShown(board, i, j);
        }
      } else if (currCell.isShown) {
        currCell.wasAlreadyShown = true;
      }
    }
  }
}

function setMinesNegsCount(board) {
  for (let rowIdx = 0; rowIdx < board.length; rowIdx++) {
    for (let colIdx = 0; colIdx < board[rowIdx].length; colIdx++) {
      let count = 0;
      for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
          if (j < 0 || j >= board[0].length) continue;
          if (i === rowIdx && j === colIdx) continue;
          if (board[i][j].isMine) {
            count++;
          }
        }
      }
      board[rowIdx][colIdx].minesAroundCount = count;
    }
  }
}

function highlightNeighbors(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (!currCell.wasAlreadyShown) {
        currCell.isShown = true;
      }
    }
  }
}

function hideNeighbors(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (!currCell.wasAlreadyShown && !currCell.isMarked) {
        currCell.isShown = false;
      }
    }
  }
}
