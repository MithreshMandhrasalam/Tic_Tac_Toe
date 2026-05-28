const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.current-turn');
const resultOverlay = document.getElementById('result-overlay');
const strikeLine = document.getElementById('strike-line');

let board = Array(9).fill(null), currentPlayer = 'X', gameActive = true;
let scores = { x: 0, o: 0, draws: 0 };

const updateScoreboard = () => {
  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
  ['x', 'draws', 'o'].forEach(k => document.getElementById(`score-val-${k}`).innerText = scores[k]);
};

function handleMove(index) {
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  cells[index].innerText = currentPlayer;
  cells[index].classList.add(`${currentPlayer.toLowerCase()}-mark`);
  cells[index].disabled = true;

  const winIdx = WIN_COMBOS.findIndex(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  
  if (winIdx !== -1 || board.every(Boolean)) {
    gameActive = false;
    cells.forEach(c => c.disabled = true);
    const won = winIdx !== -1;
    if (won) {
      strikeLine.className = `strike-line strike-comb-${winIdx} ${currentPlayer.toLowerCase()}-win active`;
      scores[currentPlayer.toLowerCase()]++;
    } else scores.draws++;
    
    updateScoreboard();
    setTimeout(() => {
      document.getElementById('result-message').innerText = won ? `Player ${currentPlayer} Wins!` : "It's a Draw!";
      resultOverlay.classList.add('active');
    }, 600);
  } else {
    statusText.innerText = currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

function resetBoard() {
  board.fill(null);
  gameActive = true;
  statusText.innerText = currentPlayer = 'X';
  strikeLine.className = 'strike-line';
  resultOverlay.classList.remove('active');
  cells.forEach(c => { c.innerText = ''; c.className = 'cell'; c.disabled = false; });
}

window.addEventListener('DOMContentLoaded', () => {
  try { scores = JSON.parse(localStorage.getItem('tictactoe_scores')) || scores; } catch {}
  cells.forEach((cell, idx) => cell.onclick = () => handleMove(idx));
  document.getElementById('play-again-btn').onclick = () => { resultOverlay.classList.remove('active'); resetBoard(); };
  document.getElementById('reset-board-btn').onclick = resetBoard;
  document.getElementById('reset-scores-btn').onclick = () => {
    if (confirm('Reset scoreboard?')) {
      scores = { x: 0, o: 0, draws: 0 };
      updateScoreboard();
    }
  };
  updateScoreboard();
});
