// Tic Tac Toe Game - Zero to Hero Edition

// Game State Management
const GameState = {
  currentPlayer: 'X',
  board: Array(9).fill(''),
  gameActive: true,
  scores: { X: 0, O: 0, draw: 0 },
  gameHistory: [],
  moveHistory: [],
  gameMode: 'singleplayer', // singleplayer, multiplayer, local
  playerTypes: { X: 'human', O: 'human' },
  aiDifficulty: { X: 'medium', O: 'medium' },
  soundEnabled: true,
  musicEnabled: false
};

// Win Combinations
const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM Elements
const boardElement = document.getElementById('game-board');
const messageElement = document.getElementById('game-message');
const subMessageElement = document.getElementById('game-submessage');
const currentPlayerElement = document.getElementById('current-player');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreDrawElement = document.getElementById('score-draw');
const resetButton = document.getElementById('reset-btn');
const undoButton = document.getElementById('undo-btn');
const hintButton = document.getElementById('hint-btn');
const multiplayerButton = document.getElementById('multiplayer-btn');
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
const player1Mode = document.getElementById('player1-mode');
const player2Mode = document.getElementById('player2-mode');
const multiplayerModal = document.getElementById('multiplayer-modal');
const closeModalButton = document.getElementById('close-modal');
const onlinePlayButton = document.getElementById('online-play');
const localPlayButton = document.getElementById('local-play');
const joinGameButton = document.getElementById('join-game');

// Audio Elements
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');
const backgroundMusic = document.getElementById('background-music');

// Initialize Game
function initGame() {
  createBoard();
  updateDisplay();
  setupEventListeners();
  playSound('click');
  
  // Start AI move if AI goes first
  if (GameState.playerTypes[GameState.currentPlayer] !== 'human') {
    setTimeout(makeAIMove, 500);
  }
}

// Create Game Board
function createBoard() {
  boardElement.innerHTML = '';
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('board-cell');
    cell.dataset.index = i;
    
    cell.addEventListener('click', () => handleCellClick(i));
    
    boardElement.appendChild(cell);
  }
}

// Update Game Display
function updateDisplay() {
  // Update board cells
  document.querySelectorAll('.board-cell').forEach((cell, index) => {
    cell.textContent = GameState.board[index];
    cell.className = 'board-cell';
    
    if (GameState.board[index] === 'X') {
      cell.classList.add('x');
    } else if (GameState.board[index] === 'O') {
      cell.classList.add('o');
    }
  });
  
  // Update current player indicator
  currentPlayerElement.textContent = GameState.currentPlayer;
  currentPlayerElement.className = `player-indicator ${GameState.currentPlayer === 'X' ? 'player-x' : 'player-o'}`;
  
  // Update scores
  scoreXElement.textContent = GameState.scores.X;
  scoreOElement.textContent = GameState.scores.O;
  scoreDrawElement.textContent = GameState.scores.draw;
  
  // Update player mode selections
  player1Mode.value = GameState.playerTypes.X;
  player2Mode.value = GameState.playerTypes.O;
}

// Handle Cell Click
function handleCellClick(index) {
  if (!GameState.gameActive || GameState.board[index] !== '') return;
  
  // Check if it's human's turn
  if (GameState.playerTypes[GameState.currentPlayer] !== 'human') return;
  
  makeMove(index);
}

// Make a Move
function makeMove(index) {
  // Save move to history for undo functionality
  GameState.moveHistory.push({
    board: [...GameState.board],
    currentPlayer: GameState.currentPlayer,
    index: index
  });
  
  // Update board
  GameState.board[index] = GameState.currentPlayer;
  
  // Play sound
  playSound('click');
  
  // Update display
  updateDisplay();
  
  // Check for win or draw
  if (checkWin()) {
    handleWin();
  } else if (checkDraw()) {
    handleDraw();
  } else {
    // Switch player
    GameState.currentPlayer = GameState.currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
    
    // If next player is AI, make AI move
    if (GameState.gameActive && GameState.playerTypes[GameState.currentPlayer] !== 'human') {
      setTimeout(makeAIMove, 500);
    }
  }
}

// AI Move Logic
function makeAIMove() {
  if (!GameState.gameActive || GameState.playerTypes[GameState.currentPlayer] === 'human') return;
  
  let index;
  const difficulty = GameState.aiDifficulty[GameState.currentPlayer];
  
  switch (difficulty) {
    case 'easy':
      index = getRandomMove();
      break;
    case 'medium':
      index = Math.random() > 0.5 ? getWinningOrBlockingMove() : getRandomMove();
      break;
    case 'hard':
      index = getBestMove();
      break;
    default:
      index = getWinningOrBlockingMove() || getRandomMove();
  }
  
  if (index !== -1) {
    makeMove(index);
  }
}

// AI Helper Functions
function getRandomMove() {
  const emptyCells = GameState.board
    .map((cell, index) => cell === '' ? index : -1)
    .filter(index => index !== -1);
  
  return emptyCells.length > 0 
    ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
    : -1;
}

function getWinningOrBlockingMove() {
  const player = GameState.currentPlayer;
  const opponent = player === 'X' ? 'O' : 'X';
  
  // Check for winning move
  for (let combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    const cells = [GameState.board[a], GameState.board[b], GameState.board[c]];
    
    if (cells.filter(cell => cell === player).length === 2 && cells.includes('')) {
      return combo[cells.indexOf('')];
    }
  }
  
  // Check for blocking move
  for (let combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    const cells = [GameState.board[a], GameState.board[b], GameState.board[c]];
    
    if (cells.filter(cell => cell === opponent).length === 2 && cells.includes('')) {
      return combo[cells.indexOf('')];
    }
  }
  
  return null;
}

function getBestMove() {
  // Simple minimax implementation for hard AI
  const player = GameState.currentPlayer;
  
  // Check for immediate win
  const winningMove = getWinningOrBlockingMove();
  if (winningMove !== null) return winningMove;
  
  // Try to take center
  if (GameState.board[4] === '') return 4;
  
  // Try to take corners
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter(corner => GameState.board[corner] === '');
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }
  
  // Take any available edge
  const edges = [1, 3, 5, 7];
  const emptyEdges = edges.filter(edge => GameState.board[edge] === '');
  if (emptyEdges.length > 0) {
    return emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
  }
  
  return getRandomMove();
}

// Check for Win
function checkWin() {
  const player = GameState.currentPlayer;
  
  for (let combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (GameState.board[a] === player && 
        GameState.board[b] === player && 
        GameState.board[c] === player) {
      
      // Highlight winning cells
      combo.forEach(index => {
        document.querySelector(`.board-cell[data-index="${index}"]`).classList.add('win');
      });
      
      return true;
    }
  }
  
  return false;
}

// Check for Draw
function checkDraw() {
  return GameState.board.every(cell => cell !== '');
}

// Handle Win
function handleWin() {
  GameState.gameActive = false;
  GameState.scores[GameState.currentPlayer]++;
  
  messageElement.textContent = `${GameState.currentPlayer} Wins!`;
  subMessageElement.textContent = 'Congratulations!';
  
  playSound('win');
  updateDisplay();
}

// Handle Draw
function handleDraw() {
  GameState.gameActive = false;
  GameState.scores.draw++;
  
  messageElement.textContent = "It's a Draw!";
  subMessageElement.textContent = 'Try again!';
  
  playSound('draw');
  updateDisplay();
}

// Reset Game
function resetGame() {
  GameState.board = Array(9).fill('');
  GameState.gameActive = true;
  GameState.moveHistory = [];
  GameState.currentPlayer = 'X';
  
  messageElement.textContent = '';
  subMessageElement.textContent = '';
  
  playSound('click');
  updateDisplay();
  
  // If AI goes first, make AI move
  if (GameState.playerTypes[GameState.currentPlayer] !== 'human') {
    setTimeout(makeAIMove, 500);
  }
}

// Undo Last Move
function undoMove() {
  if (GameState.moveHistory.length === 0 || !GameState.gameActive) return;
  
  const lastMove = GameState.moveHistory.pop();
  GameState.board = lastMove.board;
  GameState.currentPlayer = lastMove.currentPlayer;
  GameState.gameActive = true;
  
  messageElement.textContent = '';
  subMessageElement.textContent = 'Move undone';
  
  playSound('click');
  updateDisplay();
}

// Get Hint
function giveHint() {
  if (!GameState.gameActive || GameState.playerTypes[GameState.currentPlayer] !== 'human') return;
  
  const hintIndex = getWinningOrBlockingMove() || getBestMove();
  
  if (hintIndex !== -1 && hintIndex !== null) {
    const cell = document.querySelector(`.board-cell[data-index="${hintIndex}"]`);
    cell.style.boxShadow = '0 0 20px gold';
    
    setTimeout(() => {
      cell.style.boxShadow = '';
    }, 1000);
    
    subMessageElement.textContent = `Try position ${hintIndex + 1}`;
    playSound('click');
  }
}

// Play Sound
function playSound(type) {
  if (!GameState.soundEnabled) return;
  
  try {
    switch(type) {
      case 'click':
        clickSound.currentTime = 0;
        clickSound.play();
        break;
      case 'win':
        winSound.currentTime = 0;
        winSound.play();
        break;
      case 'draw':
        drawSound.currentTime = 0;
        drawSound.play();
        break;
    }
  } catch (e) {
    console.log("Sound error:", e);
  }
}

// Toggle Sound
function toggleSound() {
  GameState.soundEnabled = !GameState.soundEnabled;
  soundToggle.classList.toggle('active', GameState.soundEnabled);
  soundToggle.innerHTML = GameState.soundEnabled 
    ? '<i class="fas fa-volume-up"></i> Sound On'
    : '<i class="fas fa-volume-mute"></i> Sound Off';
}

// Setup Event Listeners
function setupEventListeners() {
  // Reset button
  resetButton.addEventListener('click', resetGame);
  
  // Undo button
  undoButton.addEventListener('click', undoMove);
  
  // Hint button
  hintButton.addEventListener('click', giveHint);
  
  // Multiplayer button
  multiplayerButton.addEventListener('click', () => {
    multiplayerModal.classList.add('active');
  });
  
  // Close modal button
  closeModalButton.addEventListener('click', () => {
    multiplayerModal.classList.remove('active');
  });
  
  // Sound toggle
  soundToggle.addEventListener('click', () => {
    GameState.soundEnabled = !GameState.soundEnabled;
    soundToggle.classList.toggle('active', GameState.soundEnabled);
    soundToggle.innerHTML = GameState.soundEnabled 
      ? '<i class="fas fa-volume-up"></i> Sound On'
      : '<i class="fas fa-volume-mute"></i> Sound Off';
    
    playSound('click');
  });
  
  // Music toggle
  musicToggle.addEventListener('click', () => {
    GameState.musicEnabled = !GameState.musicEnabled;
    musicToggle.classList.toggle('active', GameState.musicEnabled);
    musicToggle.innerHTML = GameState.musicEnabled 
      ? '<i class="fas fa-music"></i> Music On'
      : '<i class="fas fa-music"></i> Music Off';
    
    if (GameState.musicEnabled) {
      backgroundMusic.play().catch(e => console.log("Music play failed:", e));
    } else {
      backgroundMusic.pause();
    }
    
    playSound('click');
  });
  
  // Player mode changes
  player1Mode.addEventListener('change', (e) => {
    GameState.playerTypes.X = e.target.value;
    if (e.target.value.startsWith('ai')) {
      GameState.aiDifficulty.X = e.target.value.split('-')[1] || 'medium';
    }
    
    // If it's AI's turn and game is active, make AI move
    if (GameState.gameActive && GameState.currentPlayer === 'X' && 
        GameState.playerTypes.X !== 'human') {
      setTimeout(makeAIMove, 500);
    }
  });
  
  player2Mode.addEventListener('change', (e) => {
    GameState.playerTypes.O = e.target.value;
    if (e.target.value.startsWith('ai')) {
      GameState.aiDifficulty.O = e.target.value.split('-')[1] || 'medium';
    }
    
    // If it's AI's turn and game is active, make AI move
    if (GameState.gameActive && GameState.currentPlayer === 'O' && 
        GameState.playerTypes.O !== 'human') {
      setTimeout(makeAIMove, 500);
    }
  });
  
  // Multiplayer modal buttons
  onlinePlayButton.addEventListener('click', () => {
    alert('Online multiplayer feature would connect to a server in a real implementation.');
    multiplayerModal.classList.remove('active');
  });
  
  localPlayButton.addEventListener('click', () => {
    GameState.gameMode = 'local';
    GameState.playerTypes.X = 'human';
    GameState.playerTypes.O = 'human';
    player1Mode.value = 'human';
    player2Mode.value = 'human';
    resetGame();
    multiplayerModal.classList.remove('active');
    messageElement.textContent = 'Local Multiplayer Mode';
    subMessageElement.textContent = 'Pass the device between players';
  });
  
  joinGameButton.addEventListener('click', () => {
    const code = document.getElementById('game-code').value;
    if (code) {
      alert(`Would join game with code: ${code} in a real implementation.`);
      multiplayerModal.classList.remove('active');
    }
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === multiplayerModal) {
      multiplayerModal.classList.remove('active');
    }
  });
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the game
  initGame();
  
  // Set initial button states
  soundToggle.classList.toggle('active', GameState.soundEnabled);
  musicToggle.classList.toggle('active', GameState.musicEnabled);
  
  // Display welcome message
  messageElement.textContent = 'Welcome to Tic Tac Toe!';
  subMessageElement.textContent = 'Select player modes and start playing';
  
  console.log('Game initialized successfully!');
});

// Make sure initGame is accessible globally
window.initGame = initGame;
window.resetGame = resetGame;