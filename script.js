const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.current-turn');
const resultOverlay = document.getElementById('result-overlay');
const strikeLine = document.getElementById('strike-line');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let scores = { x: 0, o: 0, draws: 0 };

function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem('tictactoe_scores'));
    if (saved) {
      scores.x = saved.x ?? saved.pvp?.x ?? 0;
      scores.o = saved.o ?? saved.pvp?.o ?? 0;
      scores.draws = saved.draws ?? saved.pvp?.draws ?? 0;
    }
  } catch {}
}

const saveScores = () => localStorage.setItem('tictactoe_scores', JSON.stringify(scores));

function updateScoreboardUI() {
  document.getElementById('score-val-x').innerText = scores.x;
  document.getElementById('score-val-draws').innerText = scores.draws;
  document.getElementById('score-val-o').innerText = scores.o;
}

function handleMove(index) {
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  cells[index].innerText = currentPlayer;
  cells[index].classList.add(`${currentPlayer.toLowerCase()}-mark`);
  cells[index].disabled = true;

  const winComboIndex = WIN_COMBOS.findIndex(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  
  if (winComboIndex !== -1) {
    gameActive = false;
    cells.forEach(c => c.disabled = true);
    WIN_COMBOS[winComboIndex].forEach(idx => cells[idx].classList.add('win-highlight'));
    strikeLine.className = `strike-line strike-comb-${winComboIndex} ${currentPlayer.toLowerCase()}-win active`;
    
    scores[currentPlayer.toLowerCase()]++;
    saveScores();
    updateScoreboardUI();

    setTimeout(() => {
      document.getElementById('result-message').innerText = `Player ${currentPlayer} Wins!`;
      resultOverlay.classList.add('active');
    }, 600);
  } else if (board.every(Boolean)) {
    gameActive = false;
    cells.forEach(c => c.disabled = true);
    scores.draws++;
    saveScores();
    updateScoreboardUI();

    setTimeout(() => {
      document.getElementById('result-message').innerText = "It's a Draw!";
      resultOverlay.classList.add('active');
    }, 600);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.innerText = currentPlayer;
  }
}

function resetBoard() {
  board.fill(null);
  currentPlayer = 'X';
  gameActive = true;
  statusText.innerText = currentPlayer;
  strikeLine.className = 'strike-line';
  resultOverlay.classList.remove('active');
  cells.forEach(c => {
    c.innerText = '';
    c.className = 'cell';
    c.disabled = false;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadScores();
  
  cells.forEach((cell, idx) => cell.addEventListener('click', () => handleMove(idx)));
  
  document.getElementById('play-again-btn').addEventListener('click', () => {
    resultOverlay.classList.remove('active');
    resetBoard();
  });
  
  document.getElementById('reset-board-btn').addEventListener('click', resetBoard);
  
  document.getElementById('reset-scores-btn').addEventListener('click', () => {
    if (confirm('Reset scoreboard?')) {
      scores = { x: 0, o: 0, draws: 0 };
      saveScores();
      updateScoreboardUI();
    }
  });

  updateScoreboardUI();
});
