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

// Initiaing game
function onInit(boardSize = 4, mineAmount = 2) {
  restartGame(boardSize, mineAmount);
  gBoard = buildBoard();
  renderBoard(gBoard);
}

// Restarting game state
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
  gGame.megaHintsLeft = 1;
  gGame.megaHintClicks = 2;
  gGame.isOn = true;
}

// Restarting specific boards
function onRestart() {
  if (gLevel.MINES === 2) onInit(4, 2);
  else if (gLevel.MINES === 14) onInit(8, 14);
  else onInit(12, 32);
}

// Getting and rendering the highscore from localStorage
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

// Making mines & setting them on the board
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

// Builds the initial board
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

// Rendering the lives left
function renderLives() {
  document.querySelector(".lives").innerText = "💖".repeat(gGame.lives);
}

// Rendering the hints left
function renderHints() {
  let hintsSTR = "";
  for (let i = 0; i < gGame.hints; i++) {
    hintsSTR += `<span onclick="onGetHint(this)" title="Hint">💡</span>`;
  }
  document.querySelector(".hints").innerHTML = hintsSTR;
}

// Handle asking for hints
function onGetHint(elSpan) {
  elSpan.classList.add("highlight-hint");
  gGame.prevHints = gGame.hints;
  gGame.hints--;
  gGame.isHintClick = true;
}

//Render the SafeClick button
function renderSafeClick() {
  document.querySelector(".safe-click button span").innerText =
    gGame.safeClicks;
}

// Handle request for safe clicks
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

// Handle finding a safe cell
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

// Handle num colors for renderBoard func
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

// Handles rendering the board
function renderBoard(board, saveToUndo = true) {
  var strHTML = "";
  let cellContent = "";
  let numColor = "";
  let isClicked = "";

  // Creating a deep copy of the board
  // Doesn't save a copy when unnecessary
  if (saveToUndo) {
    const boardCopy = JSON.parse(JSON.stringify(board));
    prevBoards.push(boardCopy);
  }
  // Rendering lives/hints
  renderLives();
  renderHints();

  for (let i = 0; i < gLevel.SIZE; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = board[i][j];
      if (cell.isMine && cell.isShown) {
        cellContent = "💣";
        isClicked = "clicked";
      } else if (cell.isMarked) cellContent = "🚩";
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
                    onclick="onCellClicked(${i}, ${j})"
                    oncontextmenu="onCellMarked(this, event)"> ${cellContent}
                    </td>\n`;
    }
    strHTML += `</tr>\n`;
  }
  const elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// When losing, shows all mines
function revealMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j].isMine) board[i][j].isShown = true;
    }
  }
  handleLost(board);
}

// Handling lost state
function handleLost(board) {
  console.log("handling");
  gGame.isOn = false;
  clearInterval(gTimer.timerInterval);
  document.querySelector(".game-state").innerText = "😵";
  gGame.isLost = true;
  renderBoard(board);
}

// Checks for win
function checkGameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j];
      if (cell.isMine && cell.isShown) continue;
      if (cell.isMine && cell.isMarked) continue;
      if (!cell.isMine && cell.isShown) continue;
      return false;
    }
  }

  handleScoreBoard();
  clearInterval(gTimer.timerInterval);
  document.querySelector(".game-state").innerText = "😎";
  return true;
}

// Handles the scoreboard
function handleScoreBoard() {
  const beg = parseInt(localStorage.getItem("beginnerBest"));
  const int = parseInt(localStorage.getItem("intermediateBest"));
  const exp = parseInt(localStorage.getItem("expertBest"));

  if (gLevel.MINES === 2 && gTimer.seconds < beg)
    localStorage.setItem("beginnerBest", gTimer.seconds);
  else if (gLevel.MINES === 14 && gTimer.seconds < int)
    localStorage.setItem("intermediateBest", gTimer.seconds);
  else if (gTimer.seconds < exp)
    localStorage.setItem("expertBest", gTimer.seconds);

  getHighscore();
}

// Handling marking a cell (flag)
function onCellMarked(elCell, ev) {
  ev.preventDefault();

  if (!gGame.isOn) return;

  const cell = gBoard[elCell.dataset.i][elCell.dataset.j];

  if (cell.isMine && !cell.isShown)
    document.querySelector(".bombs-left").innerText = --gGame.minesLeft;

  if (cell.isShown) return;

  // Handle cell marking
  handleCellMarking(cell);

  if (checkGameOver()) gGame.isOn = false;

  renderBoard(gBoard);
}

// Toggle cell marking
function handleCellMarking(cell) {
  if (!cell.isMarked) {
    cell.isMarked = true;
    gGame.markedCount++;
  } else {
    cell.isMarked = false;
    gGame.markedCount--;
    if (cell.isMine) {
      gGame.minesLeft++;
      document.querySelector(".bombs-left").innerText = ++gGame.minesLeft;
    }
  }
}

// Handle build mode clicked
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

// Hide mines after build mode finished
function hideMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j].isMine && board[i][j].isShown)
        board[i][j].isShown = false;
    }
  }
}

// Handle Mega Hint logic
function handleMegaHint(i, j) {
  const cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
  cell.style.backgroundColor = "rgb(185, 0, 0)";
  cell.style.backgroundImage = "none";
  //Handle Mega Hint
  if (gGame.isMegaHint && gGame.megaHintClicks === 2) {
    gGame.megaHintCoords.firstClick.i = i;
    gGame.megaHintCoords.firstClick.j = j;
    gGame.megaHintClicks--;
    return false;
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
    renderBoard(gBoard, false);
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
    return false;
  }
}

// Handle build mode (put mines)
function handleBuildMode(i, j) {
  if (gGame.isFirstClick && gGame.isBuildMode && gGame.minesToBuild !== 0) {
    gGame.minesToBuild--;
    gBoard[i][j].isMine = true;
    gBoard[i][j].isShown = true;
    renderBoard(gBoard);
    if (gGame.minesToBuild === 0) {
      document.querySelector(".board-container").classList.remove("active");
      hideMines(gBoard);
    }
    return false;
  }
  return true;
}

// Handle first click
function handleFirstClick(i, j) {
  if (gGame.isFirstClick) {
    gGame.isFirstClick = false;
    startTimer();
    if (gGame.minesToBuild !== 0) makeMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
  }
}

// Handle Hint request
function handleHintClick(i, j) {
  if (gGame.isHintClick) {
    gGame.isHintClick = false;
    highlightNeighbors(gBoard, i, j);
    renderBoard(gBoard);
    setTimeout(() => {
      hideNeighbors(gBoard, i, j);
      renderBoard(gBoard);
    }, 1000);
  }
}

// Handle hitting a mine
function handleMineHit(cell) {
  if (cell.isMine) {
    document.querySelector(".bombs-left").innerText = --gGame.minesLeft;
    gGame.prevLives = gGame.lives;
    gGame.lives--;
    if (gGame.lives === 0) {
      revealMines(gBoard);
      return false;
    }
    // gBoard[i][j].isShown = true;
    renderBoard(gBoard);
    return false;
  }
}

// Shows cells around (for hints)
function showCellsAround(i, j, cell) {
  if (cell.isMine) {
    cell.isShown = true;
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
}

// Handle cell clicked
function onCellClicked(i, j) {
  const cell = gBoard[i][j];

  // Handle Mega Hint Logic
  if (gGame.isMegaHint && !handleMegaHint(i, j)) return;

  // Handle Build Mode Logic
  if (!handleBuildMode(i, j)) return;

  // Handle First Click
  handleFirstClick(i, j);

  // Handle cell availability logic
  if (!gGame.isOn) return;
  if (cell.isMine && cell.isShown) return;
  if (cell.isMarked) return;

  // Handle hitting a mine
  if (cell.isMine) handleMineHit(cell);

  // Handle showing cells around
  showCellsAround(i, j, cell);

  // Handle Hint Click
  handleHintClick(i, j);

  if (checkGameOver()) gGame.isOn = false;
  renderBoard(gBoard);
}

// Shows all neighboring cells
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

// Counting mines around
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

// Highlighting neighbor cells
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

// Highlighting an area (Mega Hint)
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

// Unhighlighting an area (Mega Hint)
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

// Hiding all neighbors (hints)
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

// Handling timer
function startTimer() {
  gTimer.timerInterval = setInterval(updateTimer, 1000); // Update every 1000ms (1 second)
}

// Updating the timer (called from interval every 1s)
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

// Handle Dark Mode toggling
function toggleDarkMode() {
  const elGameContainer = document.querySelector(".game");
  elGameContainer.classList.toggle("game-container");
  elGameContainer.classList.toggle("game-container-dark-mode");
}

// Undo a move (still a bit buggy)
function undoBoard() {
  // Remove last board used
  prevBoards.pop();

  // If can't go back, restart the game
  if (prevBoards.length === 0) {
    onInit(gLevel.SIZE, gLevel.MINES);
    return;
  }

  // Handle game lost undo
  toggleGameLost();

  // Update current features state
  gGame.lives = gGame.prevLives;
  document.querySelector(".bombs-left").innerText = ++gGame.minesLeft;
  if (gLevel.SIZE === 4 && gGame.lives >= 2) {
    gGame.lives = 2;
    document.querySelector(".bombs-left").innerText = 2;
  }
  gGame.hints = gGame.prevHints;

  const previousBoard = prevBoards.pop();

  // Update the previous board state
  updatePrevState(previousBoard);

  renderBoard(previousBoard);
  prevBoards.pop();
}

// Toggle game lost (for undoBoard func)
function toggleGameLost() {
  if (gGame.isLost) {
    gGame.isOn = true;
    document.querySelector(".game-state").innerText = "😊";
    gGame.isLost = false;
  }
}

// Update prev featured state (for undoBoard func)
function updatePrevState(prevBoard) {
  for (let i = 0; i < gLevel.SIZE; i++) {
    for (let j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j]) {
        gBoard[i][j].isShown = prevBoard[i][j].isShown;
        gBoard[i][j].isMarked = prevBoard[i][j].isMarked;
      }
    }
  }
}

// Mega Hint button clicked
function onMegaHint(elBtn) {
  if (gGame.isFirstClick) return;
  if (gGame.megaHintsLeft > 0) gGame.isMegaHint = true;
  else elBtn.disabled = true;

  gGame.megaHintsLeft--;
}

// Handling exterminator clicked
function onHandleExterminator() {
  if (!gGame.isFirstClick) {
    removeRandomMines(gBoard);
    setMinesNegsCount(gBoard);
  } else if (gGame.isFirstClick) {
    if (gLevel.MINES === 2) return;
    gGame.isFirstClick = false;
    startTimer();
    if (gGame.minesToBuild !== 0) makeMines(gBoard, 0, 0);
    removeRandomMines(gBoard);
    setMinesNegsCount(gBoard);
  }
}

// Removing random mines (exterminator)
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
