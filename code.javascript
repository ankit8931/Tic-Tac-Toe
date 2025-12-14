<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multiplayer Tic-Tac-Toe</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom Styles for the Grid */
        #board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            width: 100%;
            max-width: 300px; /* Max size for the board */
            aspect-ratio: 1 / 1;
            margin: 0 auto;
        }
        .cell {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #1f2937; /* Dark gray background */
            font-size: 3rem;
            font-weight: bold;
            cursor: pointer;
            border-radius: 0.5rem;
            transition: background-color 0.1s ease;
            color: #f9f9f9; /* Light text color */
        }
        .cell:hover {
            background-color: #374151; /* Slightly lighter gray on hover */
        }
        /* Style for 'X' and 'O' */
        .cell:not(:empty) {
            cursor: default;
        }
        /* Center the application vertically and horizontally */
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #0d1117; /* Very dark background */
        }
        
    </style>
    <!-- Socket.io Client Library -->
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
</head>
<body>

    <div class="p-6 sm:p-10 w-full max-w-md bg-gray-800 rounded-xl shadow-2xl text-white">
        
        <h1 class="text-3xl font-extrabold text-center mb-6 text-indigo-400">Tic-Tac-Toe (Socket.io)</h1>

        <!-- Room Setup Screen -->
        <div id="room-setup" class="space-y-4">
            <p class="text-center text-gray-300">Enter a Room ID to join or create a game.</p>
            <input type="text" id="roomId" placeholder="Enter Room ID (e.g., 'game123')"
                   class="w-full px-4 py-2 text-lg text-gray-900 bg-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                   maxlength="20">
            <button id="joinBtn"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition duration-150 transform hover:scale-[1.01]">
                Join/Create Room
            </button>
        </div>

        <!-- Game Screen (Hidden until join) -->
        <div id="game" class="hidden space-y-6">
            <p id="status" class="text-xl font-semibold text-center h-8"></p>
            
            <div id="board" class="shadow-xl">
                <!-- Cells will be rendered here by JavaScript -->
            </div>
            
            <div class="text-center text-sm text-gray-400 pt-4">
                You are playing in room: <span id="currentRoomId" class="font-mono text-indigo-300"></span>
            </div>
        </div>

    </div>

    <script>
        // Check for the Socket.io client
        if (typeof io === 'undefined') {
            console.error('Socket.io client library is not loaded. Please ensure the CDN link is correct.');
        }

        const socket = io();
        let roomId;
        let currentPlayer;

        // Utility to handle display logic
        const roomSetupEl = document.getElementById('room-setup');
        const gameEl = document.getElementById('game');
        const statusEl = document.getElementById('status');
        const roomIdInput = document.getElementById('roomId');
        const joinBtn = document.getElementById('joinBtn');
        const currentRoomIdEl = document.getElementById('currentRoomId');
        const boardEl = document.getElementById('board');


        joinBtn.addEventListener('click', () => {
            roomId = roomIdInput.value.trim();
            if (roomId) {
                socket.emit('joinRoom', roomId);
                roomSetupEl.style.display = 'none';
                gameEl.classList.remove('hidden');
                currentRoomIdEl.textContent = roomId;
                statusEl.textContent = 'Waiting for another player...';
            } else {
                statusEl.textContent = 'Please enter a valid Room ID.';
            }
        });

        // Event Listeners from the user's snippet
        socket.on('startGame', (room) => {
            renderBoard(room.board);
            statusEl.textContent = `Aapki turn: ${room.currentPlayer}`;
            currentPlayer = room.currentPlayer;
        });

        socket.on('updateBoard', (room) => {
            renderBoard(room.board);
            // Only update status if the game is still active (not winner/draw)
            if (!room.winner) {
                statusEl.textContent = `Aapki turn: ${room.currentPlayer}`;
            }
            currentPlayer = room.currentPlayer;
        });

        socket.on('gameOver', (data) => {
            statusEl.textContent = data.winner === 'Draw' ? 'Draw ho gaya!' : `${data.winner} jeeta!`;
            // Disable board interaction
            boardEl.querySelectorAll('.cell').forEach(cell => cell.style.pointerEvents = 'none');
        });
        
        socket.on('error', (message) => {
             statusEl.textContent = `Error: ${message}`;
             // Revert to join screen if a critical error occurs (e.g., room full)
             roomSetupEl.style.display = 'block';
             gameEl.classList.add('hidden');
        });

        function renderBoard(board) {
            boardEl.innerHTML = '';
            board.forEach((cell, index) => {
                const cellEl = document.createElement('div');
                cellEl.className = 'cell';
                cellEl.textContent = cell || '';
                cellEl.addEventListener('click', () => {
                    // Check if the cell is empty AND it is this player's turn (currentPlayer is X or O)
                    if (!cell && currentPlayer && socket.id) { 
                        socket.emit('makeMove', { roomId, index });
                    }
                });
                boardEl.appendChild(cellEl);
            });
        }
    </script>
</body>
</html>
