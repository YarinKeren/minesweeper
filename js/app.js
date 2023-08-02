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
};

function onInit() {
  gGame.isOn = true;
  gBoard = buildBoard();
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
}

function buildBoard() {
  const board = [];
  let countMines = 0;
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = {
        minesAroundCount: 0,
        isShown: false,
        // isMine: countMines === gLevel.MINES ? false : Math.random() < 0.5,
        isMine: false,
        isMarked: false,
      };
      if (cell.isMine) countMines++;
      board[i][j] = cell;
    }
  }

  board[0][0].isMine = true;
  board[3][3].isMine = true;
  return board;
}

function renderBoard(board) {
  var strHTML = "";
  let cellContent = "";
  for (let i = 0; i < gLevel.SIZE; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = board[i][j];
      if (cell.isMine && cell.isShown) cellContent = "💣";
      else if (cell.isMarked) cellContent = "🚩";
      else if (cell.isShown) cellContent = cell.minesAroundCount;
      else cellContent = "";
      var className = "";
      strHTML += `\t<td data-i="${i}" data-j="${j}"
                                 class="cell ${className}"
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
      renderBoard(board);
    }
  }
  gGame.isOn = false;
}

function checkGameOver() {
  return (
    gLevel.MINES === gGame.markedCount &&
    gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES
  );
}

function onCellMarked(elCell, ev) {
  ev.preventDefault();
  const cell = gBoard[elCell.dataset.i][elCell.dataset.j];
  if (cell.isShown) return;
  if (!cell.isMarked) {
    gGame.markedCount++;
    cell.isMarked = true;
  } else {
    gGame.markedCount--;
    cell.isMarked = false;
  }
  renderBoard(gBoard);
  if (checkGameOver()) {
    gGame.isOn = false;
    console.log("won");
  }
}

function onCellClicked(elCell, i, j) {
  const cell = gBoard[i][j];
  // ignore flagged cells
  if (!gGame.isOn) return;
  if (cell.isShown) return;
  if (cell.isMarked) return;
  if (cell.isMine) {
    revealMines(gBoard);
    return;
  }

  if (cell.minesAroundCount === 0) {
    expandShown(gBoard, i, j);
    cell.isShown = true;
    // gGame.shownCount++;
  } else {
    cell.isShown = true;
    gGame.shownCount++;
  }

  //   elCell.innerText = cell.minesAroundCount;
  renderBoard(gBoard);
  if (checkGameOver()) {
    gGame.isOn = false;
    console.log("won");
  }

  //   // Support selecting a seat
  //   elCell.classList.add("selected");

  //   if (gElSelectedSeat) {
  //     gElSelectedSeat.classList.remove("selected");
  //   }

  //   // Only a single seat should be selected
  //   gElSelectedSeat = gElSelectedSeat !== elCell ? elCell : null;

  //   // When seat is selected a popup is shown
  //   if (gElSelectedSeat) {
  //     showSeatDetails({ i, j });
  //   } else {
  //     hideSeatDetails();
  //   }
}

function expandShown(board, rowIdx, colIdx) {
  gGame.shownCount++;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (!currCell.isShown) gGame.shownCount++;
      currCell.isShown = true;
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
