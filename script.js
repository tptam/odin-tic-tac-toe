function createGame(){
  
    let board = null;
    const players = [];
    let winner = null;
  
    const init = () => {
      if (board) {
        board.reset();
      } else {
        createBoard();
      }
      players.splice(0, players.length);
      winner = null;
    };
  
    const changeTurn = () => {
      const lastPlayer = players.shift();
      players.push(lastPlayer);
    }
  
    const placeMarker = (player, cell) => {
      board.placeMarker(player.getMarker(), cell);
      updateWinner();
    }
  
    const isOver = () => board.isFull() || winner !== null;
  
    const hasWinner = () => winner !== null;
  
    const getBoard = () => board.getBoard();
  
    const getCurrentPlayer = () => players.at(0);
  
    const getWinner = () => winner;
  
    return {
      init,
      createPlayer,
      changeTurn,
      placeMarker, 
      isOver,
      hasWinner,
      getBoard,
      getCurrentPlayer,
      getWinner,
    }
  
    function updateWinner() {
      let lineWinner;
      for (let i = 0; i < 3; i++) {
        lineWinner = getLineWinner(board.getRow(i));
        if (lineWinner !== null) {
          winner = lineWinner;
          return;
        }
        lineWinner = getLineWinner(board.getColumn(i));
        if (lineWinner !== null) {
          winner = lineWinner;
          return;
        }
      }
      lineWinner = getLineWinner(board.getMainDiagonal());
      if (lineWinner !== null) {
        winner = lineWinner;
        return;
      }
      lineWinner = getLineWinner(board.getAntiDiagonal());
      if (lineWinner !== null) {
        winner = lineWinner;
        return;
      }
    }
  
    function getLineWinner(line){
      const winnerMarker = line.reduce(
        (acc, val) => acc === val ? acc : null
      )
      return winnerMarker === null 
        ? null 
        : getPlayerByMarker(winnerMarker);
    }
  
    function getPlayerByMarker(marker) {
      return players.find(
        player => player.getMarker() === marker
      );
    }
  
    function createBoard() {
      const boardArray = Array(9).fill(null);
      const isFull = () => boardArray.filter(val=>val===null).length === 0;
      const getBoard = () => boardArray;
      const reset = () => boardArray.fill(null);
      const placeMarker = (marker, cell) => boardArray[cell] = marker;
      const getRow = (row) => boardArray.slice(row * 3, row * 3 + 3);
      const getColumn = (col) => [col, col+3, col+6].map(n => boardArray[n]);
      const getMainDiagonal = () => [0, 4, 8].map(n => boardArray[n]);
      const getAntiDiagonal = () => [2, 4, 6].map(n => boardArray[n]);
      board = {isFull, getBoard, reset, placeMarker, getRow, getColumn, getMainDiagonal, getAntiDiagonal};
    }
  
    function createPlayer(playerName, playerMarker){
      const name = playerName;
      const marker = playerMarker;
      const getName = () => name;
      const getMarker= () => marker;
      players.push({getName, getMarker});
    }
  }
  
  
  // Game outline
  const game = createGame();
  game.init();
  game.createPlayer("Player 1", "O");
  game.createPlayer("Player 2", "X");
  
  while(!game.isOver()) {
    const currentPlayer = game.getCurrentPlayer();
    const cell = prompt(`${currentPlayer.getName()}: Pick where to place marker:\n ${showAs3x3(game.getBoard())}`);
    game.placeMarker(currentPlayer, cell);
    game.changeTurn();
  }
  
  if (game.hasWinner()) {
    console.log(`${game.getWinner().getName()} Wins`);
  } else {
    console.log(`Game ended with a draw`)
  }
  
  function showAs3x3(array) {
    const newArray = array.map(val => val===null ? '#' : val);
    return `${newArray.slice(0, 3).join(" ")}
  ${newArray.slice(3, 6).join(" ")}
  ${newArray.slice(6, 9).join(" ")}`.trim();
  }