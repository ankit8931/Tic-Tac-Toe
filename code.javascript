const socket = io();
let roomId;
let currentPlayer;

document.getElementById('joinBtn').addEventListener('click', () => {
  roomId = document.getElementById('roomId').value;
  if (roomId) {
    socket.emit('joinRoom', roomId);
    document.getElementById('room-setup').style.display = 'none';
    document.getElementById('game').style.display = 'block';
  }
});

socket.on('startGame', (room) => {
  renderBoard(room.board);
  document.getElementById('status').textContent = `Aapki turn: ${room.currentPlayer}`;
  currentPlayer = room.currentPlayer;
});

socket.on('updateBoard', (room) => {
  renderBoard(room.board);
  document.getElementById('status').textContent = `Aapki turn: ${room.currentPlayer}`;
  currentPlayer = room.currentPlayer;
});

socket.on('gameOver', (data) => {
  document.getElementById('status').textContent = data.winner === 'Draw' ? 'Draw ho gaya!' : `${data.winner} jeeta!`;
  document.querySelectorAll('.cell').forEach(cell => cell.style.pointerEvents = 'none');
});

function renderBoard(board) {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board.forEach((cell, index) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.textContent = cell || '';
    cellEl.addEventListener('click', () => {
      if (!cell && currentPlayer) {
        socket.emit('makeMove', { roomId, index });
      }
    });
    boardEl.appendChild(cellEl);
  });
}
