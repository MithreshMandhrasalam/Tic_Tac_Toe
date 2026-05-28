let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

let scores = { x: 0, o: 0, draws: 0 };

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.current-turn');
const resultOverlay = document.getElementById('result-overlay');
const resultMessage = document.getElementById('result-message');
const strikeLine = document.getElementById('strike-line');

const scoreLblX = document.getElementById('score-lbl-x');
const scoreLblO = document.getElementById('score-lbl-o');
const scoreValX = document.getElementById('score-val-x');
const scoreValDraws = document.getElementById('score-val-draws');
const scoreValO = document.getElementById('score-val-o');

const playAgainBtn = document.getElementById('play-again-btn');
const resetBoardBtn = document.getElementById('reset-board-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');

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
      if (parsed.x !== undefined && parsed.o !== undefined && parsed.draws !== undefined) {
        scores = parsed;
      } else if (parsed.pvp) {
        scores = {
          x: parsed.pvp.x || 0,
          o: parsed.pvp.o || 0,
          draws: parsed.pvp.draws || 0
        };
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

function saveScores() {
  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
}

function setupEventListeners() {
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = parseInt(cell.dataset.index);
      handleMove(index);
    });
  });

  playAgainBtn.addEventListener('click', () => {
    resultOverlay.classList.remove('active');
    resetBoard();
  });

  resetBoardBtn.addEventListener('click', resetBoard);

  resetScoresBtn.addEventListener('click', () => {
    if (confirm('Reset scoreboard?')) {
      scores = { x: 0, o: 0, draws: 0 };
      saveScores();
      updateScoreboardUI();
    }
  });
}

function handleMove(index) {
  if (!gameActive || board[index] !== null) return;

  makeMove(index, currentPlayer);

  if (!gameActive) return;

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.innerText = currentPlayer;
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
  for (let i = 0; i < WIN_COMBOS.length; i++) {
    const combo = WIN_COMBOS[i];
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      handleWin(board[a], combo, i);
      return;
    }
  }

  if (board.every(cell => cell !== null)) {
    handleDraw();
  }
}

function handleWin(winner, combo, comboIndex) {
  gameActive = false;
  disableBoard();

  combo.forEach(idx => cells[idx].classList.add('win-highlight'));

  strikeLine.className = `strike-line strike-comb-${comboIndex} ${winner.toLowerCase()}-win`;
  void strikeLine.offsetWidth;
  strikeLine.classList.add('active');

  if (winner === 'X') scores.x++;
  else scores.o++;
  
  saveScores();
  updateScoreboardUI();

  setTimeout(() => {
    resultMessage.innerText = `Player ${winner} Wins!`;
    resultOverlay.classList.add('active');
  }, 600);
}

function handleDraw() {
  gameActive = false;
  disableBoard();

  scores.draws++;

  saveScores();
  updateScoreboardUI();

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

  strikeLine.className = 'strike-line';
  statusText.innerText = currentPlayer;
  resultOverlay.classList.remove('active');
}

function disableBoard() {
  cells.forEach(cell => cell.setAttribute('disabled', 'true'));
}

function updateScoreboardUI() {
  scoreLblX.innerText = 'Player X';
  scoreLblO.innerText = 'Player O';
  scoreValX.innerText = scores.x;
  scoreValDraws.innerText = scores.draws;
  scoreValO.innerText = scores.o;
}

window.addEventListener('DOMContentLoaded', init);
