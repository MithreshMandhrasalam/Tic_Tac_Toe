/**
 * TIC-TAC-TOE - GAME ENGINE
 * A clean, human-written, easy-to-understand codebase.
 */

// ----------------------------------------------------
// 1. STATE VARIABLES
// ----------------------------------------------------
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let difficulty = 'medium'; // 'easy', 'medium', 'hard'

let scores = {
  pvp: { x: 0, o: 0, draws: 0 },
  ai: { player: 0, ai: 0, draws: 0 }
};

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// ----------------------------------------------------
// 2. DOM SELECTORS
// ----------------------------------------------------
const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.current-turn');
const modeButtons = document.querySelectorAll('#mode-select .toggle-btn');
const diffButtons = document.querySelectorAll('#diff-select .toggle-btn');
const difficultyGroup = document.getElementById('difficulty-group');
const resultOverlay = document.getElementById('result-overlay');
const resultMessage = document.getElementById('result-message');

const scoreLblX = document.getElementById('score-lbl-x');
const scoreLblO = document.getElementById('score-lbl-o');
const scoreValX = document.getElementById('score-val-x');
const scoreValDraws = document.getElementById('score-val-draws');
const scoreValO = document.getElementById('score-val-o');

const playAgainBtn = document.getElementById('play-again-btn');
const resetBoardBtn = document.getElementById('reset-board-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');

// ----------------------------------------------------
// 3. INITIALIZATION & STORAGE
// ----------------------------------------------------
function init() {
  loadScores();
  setupEventListeners();
  updateScoreboardUI();
}

function loadScores() {
  const saved = localStorage.getItem('tictactoe_scores');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.pvp && parsed.ai) {
        scores = parsed;
      }
    } catch (e) {
      console.warn('Error loading scores:', e);
    }
  }
}

function saveScores() {
  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
}

// ----------------------------------------------------
// 4. EVENT LISTENERS
// ----------------------------------------------------
function setupEventListeners() {
  // Cell clicks
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = parseInt(cell.dataset.index);
      handleMove(index);
    });
  });

  // Game Mode Selection
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameMode = btn.dataset.mode;

      if (gameMode === 'ai') {
        difficultyGroup.classList.remove('hidden');
      } else {
        difficultyGroup.classList.add('hidden');
      }

      resetBoard();
      updateScoreboardUI();
    });
  });

  // Difficulty Selection
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.dataset.diff;
      resetBoard();
    });
  });

  // Replay actions
  playAgainBtn.addEventListener('click', () => {
    resultOverlay.classList.remove('active');
    resetBoard();
  });

  resetBoardBtn.addEventListener('click', resetBoard);

  // Score reset
  resetScoresBtn.addEventListener('click', () => {
    if (confirm('Reset scoreboard?')) {
      if (gameMode === 'pvp') {
        scores.pvp = { x: 0, o: 0, draws: 0 };
      } else {
        scores.ai = { player: 0, ai: 0, draws: 0 };
      }
      saveScores();
      updateScoreboardUI();
    }
  });
}

// ----------------------------------------------------
// 5. GAME ACTIONS & LOOP
// ----------------------------------------------------
function handleMove(index) {
  if (!gameActive || board[index] !== null) return;

  // Make Human Move
  makeMove(index, currentPlayer);

  if (!gameActive) return;

  // Change Turn
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.innerText = currentPlayer;

  // If computer turn, handle AI move
  if (gameMode === 'ai' && currentPlayer === 'O') {
    disableBoard();
    setTimeout(() => {
      const aiMove = getComputerMove();
      if (aiMove !== null) {
        makeMove(aiMove, 'O');
        if (gameActive) {
          currentPlayer = 'X';
          statusText.innerText = currentPlayer;
          enableBoard();
        }
      }
    }, 400); // 400ms delay to feel natural
  }
}

function makeMove(index, player) {
  board[index] = player;
  
  const cell = cells[index];
  cell.innerText = player;
  cell.classList.add(`${player.toLowerCase()}-mark`);
  cell.setAttribute('disabled', 'true');

  checkGameStatus();
}

function checkGameStatus() {
  // Check Win Combinations
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      handleWin(board[a], combo);
      return;
    }
  }

  // Check Draw
  if (board.every(cell => cell !== null)) {
    handleDraw();
  }
}

function handleWin(winner, combo) {
  gameActive = false;
  disableBoard();

  // Highlight winning cells
  combo.forEach(idx => cells[idx].classList.add('win-highlight'));

  // Update Score State
  if (gameMode === 'pvp') {
    if (winner === 'X') scores.pvp.x++;
    else scores.pvp.o++;
  } else {
    if (winner === 'X') scores.ai.player++;
    else scores.ai.ai++;
  }
  
  saveScores();
  updateScoreboardUI();

  // Show Winner overlay
  setTimeout(() => {
    let msg = `Player ${winner} Wins!`;
    if (gameMode === 'ai') {
      msg = winner === 'X' ? 'You Win!' : 'AI Wins!';
    }
    resultMessage.innerText = msg;
    resultOverlay.classList.add('active');
  }, 600);
}

function handleDraw() {
  gameActive = false;
  disableBoard();

  // Update Score State
  if (gameMode === 'pvp') {
    scores.pvp.draws++;
  } else {
    scores.ai.draws++;
  }

  saveScores();
  updateScoreboardUI();

  // Show Draw overlay
  setTimeout(() => {
    resultMessage.innerText = "It's a Draw!";
    resultOverlay.classList.add('active');
  }, 600);
}

function resetBoard() {
  board.fill(null);
  currentPlayer = 'X';
  gameActive = true;

  cells.forEach(cell => {
    cell.innerText = '';
    cell.className = 'cell';
    cell.removeAttribute('disabled');
  });

  statusText.innerText = currentPlayer;
  resultOverlay.classList.remove('active');
}

function disableBoard() {
  cells.forEach(cell => cell.setAttribute('disabled', 'true'));
}

function enableBoard() {
  cells.forEach((cell, idx) => {
    if (board[idx] === null) {
      cell.removeAttribute('disabled');
    }
  });
}

function updateScoreboardUI() {
  if (gameMode === 'pvp') {
    scoreLblX.innerText = 'Player X';
    scoreLblO.innerText = 'Player O';
    scoreValX.innerText = scores.pvp.x;
    scoreValDraws.innerText = scores.pvp.draws;
    scoreValO.innerText = scores.pvp.o;
  } else {
    scoreLblX.innerText = 'Player (X)';
    scoreLblO.innerText = 'AI (O)';
    scoreValX.innerText = scores.ai.player;
    scoreValDraws.innerText = scores.ai.draws;
    scoreValO.innerText = scores.ai.ai;
  }
}

// ----------------------------------------------------
// 6. AI ALGORITHMS
// ----------------------------------------------------
function getWinner(tempBoard) {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
      return tempBoard[a];
    }
  }
  if (tempBoard.every(cell => cell !== null)) return 'draw';
  return null;
}

function getComputerMove() {
  if (difficulty === 'easy') {
    return getRandomMove();
  } else if (difficulty === 'medium') {
    return getMediumMove();
  } else {
    return getHardMove(); // Unbeatable Minimax
  }
}

function getRandomMove() {
  const emptyIndices = [];
  board.forEach((val, idx) => {
    if (val === null) emptyIndices.push(idx);
  });
  if (emptyIndices.length === 0) return null;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function getMediumMove() {
  // 1. Can AI win immediately?
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const winner = getWinner(board);
      board[i] = null;
      if (winner === 'O') return i;
    }
  }

  // 2. Can Player win immediately? Block it.
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      const winner = getWinner(board);
      board[i] = null;
      if (winner === 'X') return i;
    }
  }

  // 3. Take center cell with 50% probability
  if (board[4] === null && Math.random() < 0.5) {
    return 4;
  }

  // 4. Default to random
  return getRandomMove();
}

function getHardMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(tempBoard, depth, isMaximizing) {
  const winner = getWinner(tempBoard);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = 'O';
        const score = minimax(tempBoard, depth + 1, false);
        tempBoard[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = 'X';
        const score = minimax(tempBoard, depth + 1, true);
        tempBoard[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Start Game
window.addEventListener('DOMContentLoaded', init);
