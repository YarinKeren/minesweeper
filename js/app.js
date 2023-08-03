"use strict";

var gBoard;
var prevBoards = [];
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
  safeClicks: 3,
  isBuildMode: false,
  minesToBuild: gLevel.MINES,
  minesLeft: gLevel.MINES,
  isLost: false,
  prevLives: 3,
  prevHints: 3,
  isMegaHint: false,
  megaHintsLeft: 1,
  megaHintClicks: 2,
  megaHintCoords: { firstClick: { i: 0, j: 0 }, secondClick: { i: 0, j: 0 } },
};
const gTimer = {
  timerInterval: 0,
  seconds: 0,
};

function onInit(boardSize = 4, mineAmount = 2) {
  restartGame(boardSize, mineAmount);
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function getHighscore() {
  const elHighscore = document.querySelector(".highscore span");
  if (localStorage.getItem("beginnerBest") && gLevel.MINES === 2) {
    elHighscore.innerText = localStorage.getItem("beginnerBest") + " sec";
  } else if (localStorage.getItem("intermediateBest") && gLevel.MINES === 14) {
    elHighscore.innerText = localStorage.getItem("intermediateBest") + " sec";
  } else {
    if (localStorage.getItem("expertBest"))
      elHighscore.innerText = localStorage.getItem("expertBest") + " sec";
  }
}

function restartGame(boardSize, mineAmount) {
  gTimer.seconds = 0;
  gGame.safeClicks = 3;
  renderSafeClick();
  document.querySelector(".timer").innerText = "000";
  clearInterval(gTimer.timerInterval);
  gGame.isFirstClick = true;
  document.querySelector(".game-state").innerText = "🤪";
  setTimeout(() => {
    document.querySelector(".game-state").innerText = "😊";
  }, 400);
  gLevel.SIZE = boardSize;
  gLevel.MINES = mineAmount;
  gGame.minesToBuild = gLevel.MINES;
  gGame.minesLeft = gLevel.MINES;
  document.querySelector(".bombs-left").innerText = gGame.minesLeft;
  getHighscore();
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
  for (let i = 0; i < gGame.lives; i++) {
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
  gGame.prevHints = gGame.hints;
  gGame.hints--;
  gGame.isHintClick = true;
}

function renderSafeClick() {
  document.querySelector(".safe-click button span").innerText =
    gGame.safeClicks;
}

function onSafeClick() {
  if (gGame.safeClicks === 0) return;
  gGame.safeClicks--;
  let safeCell = getSafeCell(gBoard);
  const cell = document.querySelector(
    `[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`
  );
  cell.style.backgroundColor = "rgb(76, 233, 76)";
  cell.style.backgroundImage = "none";
  setTimeout(() => {
    cell.style.backgroundImage = 'url("../img/tile.png")';
  }, 1500);

  renderSafeClick();
}

function getSafeCell(board) {
  let safeCells = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!board[i][j].isMine && !board[i][j].isShown) safeCells.push({ i, j });
    }
  }
  if (!safeCells.length) return null;
  return safeCells[getRandomInt(0, safeCells.length)];
}

function handleNumColors(num) {
  switch (num) {
    case 1:
      return "blue";
    case 2:
      return "green";
    case 3:
      return "red";
    case 4:
      return "darkblue";
    case 5:
      return "crimson";
    case 6:
      return "cadetblue";
    case 7:
      return "black";
    case 8:
      return "grey";
  }
}

function renderBoard(board) {
  var strHTML = "";
  let cellContent = "";
  let numColor = "";
  let isClicked = "";

  const boardCopy = JSON.parse(JSON.stringify(board));
  prevBoards.push(boardCopy);

  renderLives();
  renderHints();

  for (let i = 0; i < gLevel.SIZE; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = board[i][j];
      if (cell.isMine && cell.isShown) cellContent = "💣";
      else if (cell.isMarked) cellContent = "🚩";
      else if (cell.isShown) {
        if (cell.minesAroundCount > 0) cellContent = cell.minesAroundCount;
        else cellContent = "";
        numColor = handleNumColors(+cellContent);
        isClicked = "clicked";
      } else {
        cellContent = "";
        isClicked = "";
      }
      strHTML += `\t<td data-i="${i}" data-j="${j}"
                    style="color:${numColor}"
                    class="cell ${isClicked}"
                    onclick="onCellClicked(this, ${i}, ${j})"
                    oncontextmenu="onCellMarked(this, event)"> ${cellContent}
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
  clearInterval(gTimer.timerInterval);
  document.querySelector(".game-state").innerText = "😵";
  gGame.isLost = true;
  renderBoard(board);
}

function checkGameOver() {
  if (
    gGame.markedCount === gLevel.MINES &&
    gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES
  ) {
    if (gLevel.MINES === 2)
      localStorage.setItem("beginnerBest", gTimer.seconds);
    else if (gLevel.MINES === 14)
      localStorage.setItem("intermediateBest", gTimer.seconds);
    else localStorage.setItem("expertBest", gTimer.seconds);

    clearInterval(gTimer.timerInterval);
    document.querySelector(".game-state").innerText = "😎";
    return true;
  }
  return false;
}

function onCellMarked(elCell, ev) {
  ev.preventDefault();
  if (!gGame.isOn) return;
  const cell = gBoard[elCell.dataset.i][elCell.dataset.j];
  if (cell.isMine)
    document.querySelector(".bombs-left").innerText = --gGame.minesLeft;
  if (cell.isShown) return;

  if (!cell.isMarked) {
    cell.isMarked = true;
    gGame.markedCount++;
  } else {
    cell.isMarked = false;
    gGame.markedCount--;
  }
  if (checkGameOver()) gGame.isOn = false;
  renderBoard(gBoard);
}

function onBuildMode() {
  if (gGame.isBuildMode && gGame.isFirstClick) {
    gGame.isBuildMode = false;
    document.querySelector(".board-container").classList.remove("active");
  } else if (gGame.isFirstClick) {
    gGame.isBuildMode = true;
    document.querySelector(".board-container").classList.add("active");
  } else {
    document.querySelector(".build-mode").disabled = true;
  }
}

function hideMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j].isMine && board[i][j].isShown)
        board[i][j].isShown = false;
    }
  }
}

function onCellClicked(elCell, i, j) {
  const cell = gBoard[i][j];

  //Handle Mega Hint
  if (gGame.isMegaHint && gGame.megaHintClicks === 2) {
    gGame.megaHintCoords.firstClick.i = i;
    gGame.megaHintCoords.firstClick.j = j;
    gGame.megaHintClicks--;
    return;
  } else if (gGame.isMegaHint && gGame.megaHintClicks === 1) {
    gGame.megaHintCoords.secondClick.i = i;
    gGame.megaHintCoords.secondClick.j = j;
    gGame.megaHintClicks--;
  }
  if (gGame.isMegaHint && gGame.megaHintClicks === 0) {
    gGame.isMegaHint = false;
    highlightArea(
      gBoard,
      gGame.megaHintCoords.firstClick.i,
      gGame.megaHintCoords.firstClick.j,
      gGame.megaHintCoords.secondClick.i,
      gGame.megaHintCoords.secondClick.j
    );
    renderBoard(gBoard);
    setTimeout(() => {
      unHighlightArea(
        gBoard,
        gGame.megaHintCoords.firstClick.i,
        gGame.megaHintCoords.firstClick.j,
        gGame.megaHintCoords.secondClick.i,
        gGame.megaHintCoords.secondClick.j
      );
      renderBoard(gBoard);
    }, 1000);
    return;
  }

  if (gGame.isFirstClick && gGame.isBuildMode && gGame.minesToBuild !== 0) {
    gGame.minesToBuild--;
    gBoard[i][j].isMine = true;
    gBoard[i][j].isShown = true;
    renderBoard(gBoard);
    if (gGame.minesToBuild === 0) {
      document.querySelector(".board-container").classList.remove("active");
      hideMines(gBoard);
    }
    return;
  }

  if (gGame.isFirstClick) {
    gGame.isFirstClick = false;
    startTimer();
    if (gGame.minesToBuild !== 0) makeMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
  }

  if (!gGame.isOn) return;
  if (cell.isMine && cell.isShown) return;
  if (cell.isMarked) return;

  if (cell.isMine) {
    document.querySelector(".bombs-left").innerText = --gGame.minesLeft;
    gGame.prevLives = gGame.lives;
    gGame.lives--;
    if (gGame.lives === 0) {
      revealMines(gBoard);
      return;
    }
    gBoard[i][j].isShown = true;
    renderBoard(gBoard);
    return;
  }

  if (cell.minesAroundCount === 0) {
    expandShown(gBoard, i, j);
    cell.isShown = true;
  } else {
    if (!gGame.isHintClick) cell.wasAlreadyShown = true;
    cell.isShown = true;
    gGame.shownCount++;
  }
  if (gGame.isHintClick) {
    gGame.isHintClick = false;
    highlightNeighbors(gBoard, i, j);
    renderBoard(gBoard);
    setTimeout(() => {
      hideNeighbors(gBoard, i, j);
      renderBoard(gBoard);
    }, 1000);
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
        currCell.isShown = true;
        // currCell.wasAlreadyShown = true;
        gGame.shownCount++;
        // If the cell has no adjacent mines, recursively expand its neighbors
        if (currCell.minesAroundCount === 0) {
          expandShown(board, i, j);
        }
      }
      if (currCell.isShown) {
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

function highlightArea(board, rowStart, colStart, rowEnd, colEnd) {
  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = colStart; j <= colEnd; j++) {
      var currCell = board[i][j];
      if (!currCell.wasAlreadyShown) {
        currCell.isShown = true;
      }
    }
  }
}

function unHighlightArea(board, rowStart, colStart, rowEnd, colEnd) {
  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = colStart; j <= colEnd; j++) {
      var currCell = board[i][j];
      if (!currCell.wasAlreadyShown) {
        currCell.isShown = false;
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
      if (!currCell.wasAlreadyShown) {
        currCell.isShown = false;
      }
    }
  }
}

function startTimer() {
  gTimer.timerInterval = setInterval(updateTimer, 1000); // Update every 1000ms (1 second)
}

function updateTimer() {
  gTimer.seconds++;
  if (gTimer.seconds > 999) {
    clearInterval(timerInterval); // Stop the timer when it reaches 999
    return;
  }

  // Pad the number with leading zeros to make it 3 digits
  const paddedSeconds = gTimer.seconds.toString().padStart(3, "0");

  // Update the timer display
  const timerElement = document.querySelector(".timer");
  timerElement.innerText = paddedSeconds;
}

function toggleDarkMode() {
  const elGameContainer = document.querySelector(".game");
  elGameContainer.classList.toggle("game-container");
  elGameContainer.classList.toggle("game-container-dark-mode");
}

function undoBoard() {
  prevBoards.pop();
  if (prevBoards.length === 0) {
    onInit(gLevel.SIZE, gLevel.MINES);
    return;
  }

  if (gGame.isLost) {
    console.log("Changing");
    gGame.isOn = true;
    document.querySelector(".game-state").innerText = "😊";
    gGame.isLost = false;
  }

  gGame.lives = gGame.prevLives;
  if (gLevel.SIZE === 4 && gGame.lives > 2) gGame.lives = 2;
  gGame.hints = gGame.prevHints;

  const previousBoard = prevBoards.pop();

  renderBoard(previousBoard);
}

function onMegaHint(elBtn) {
  if (gGame.megaHintsLeft > 0) gGame.isMegaHint = true;
  else elBtn.disabled = true;

  gGame.megaHintsLeft--;
}

function onHandleExterminator() {
  if (!gGame.isFirstClick) {
    removeRandomMines(gBoard);
  } else if (gGame.isFirstClick) {
    gGame.isFirstClick = false;
    startTimer();
    if (gGame.minesToBuild !== 0) makeMines(gBoard, 0, 0);
    removeRandomMines(gBoard);
    setMinesNegsCount(gBoard);
  }
}

function removeRandomMines(board) {
  let removeCount = 3;
  while (removeCount > 0) {
    let hasMinesLeft = false;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (removeCount === 0) return;
        if (board[i][j].isMine) {
          hasMinesLeft = true;
          if (Math.random() < 0.5) {
            board[i][j].isMine = false;
            document.querySelector(".bombs-left").innerText = --gGame.minesLeft;
            removeCount--;
          }
        }
      }
    }
    if (!hasMinesLeft) break;
  }
}
