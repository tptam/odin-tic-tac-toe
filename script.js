const game = function(){
  
    let board = null;
    const players = [];
    let winner = null;
  
    const init = () => {
        if (board) {
            board.reset();
        } else {
            createBoard();
        }
        winner = null;
        initPlayerOrder();
    };

    const deletePlayers = () => {
        players.splice(0, players.length);
    }
  
    const placeMarker = (player, cell) => {
        board.placeMarker(player.getMarker(), cell);
        updateWinner();
    }

    const switchTurn = () => {
        const lastPlayer = players.shift();
        players.push(lastPlayer);
    }
  
    const isStarted = () => players.length > 0;
    const isOver = () => isDraw() || winner !== null;
    const hasWinner = () => winner !== null;
    const getBoard = () => board.getBoard();
    const getCurrentPlayer = () => players.at(0);
    const getWinner = () => winner;
  
    return {
        init,
        deletePlayers,
        createPlayer,
        switchTurn,
        placeMarker,
        isStarted, 
        isOver,
        hasWinner,
        getBoard,
        getCurrentPlayer,
        getWinner,
    }
  
    function updateWinner() {
        const lines = board.getLines();
        for (let line of lines) {
            const lineWinner = getLineWinner(line);
            if (lineWinner !== null) {
                winner = lineWinner;
                return;
            }
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

    function isDraw(){
        return board.isFull();
    }

    function getPlayerByMarker(marker) {
      return players.find(
        player => player.getMarker() === marker
      );
    }

    function initPlayerOrder(){
        players.sort((a, b) => a.getOrder() > b.getOrder() ? 1 : -1);
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
        const getLines = () => [
            getRow(0), getRow(1), getRow(2),
            getColumn(0), getColumn(1), getColumn(2),
            getMainDiagonal(), getAntiDiagonal()
        ]
        board = {isFull, getBoard, reset, placeMarker, getLines};
    }
  
    function createPlayer(playerName, playerMarker){
        const name = playerName;
        const marker = playerMarker;
        const order = players.length;
        const getName = () => name;
        const getMarker= () => marker;
        const getOrder= () => order;
        
        players.push({getName, getMarker, getOrder});
    }
}();


const displayController = function(doc, game){
    const [IN_PROGRESS, GAME_OVER] = [0, 1];
    let state;

    const cells = doc.querySelectorAll(".board button");
    const message = doc.querySelector(".message");
    const nameDialog = doc.querySelector(".name-dialog");
    const startNewButton = doc.querySelector("#start-new");
    const continueButton = doc.querySelector("#continue");

    cells.forEach((cell) => {
        cell.addEventListener(
            "click",
            (e) => {
                game.placeMarker(
                    game.getCurrentPlayer(), 
                    e.target.getAttribute("data-index")
                );
                game.switchTurn();
                updateBoardView();
                updateState();
                updateStateRelatedView();
            }
        )
    });


    startNewButton.addEventListener(
        "click", askPlayerNames
    );
    continueButton.addEventListener(
        "click", continueGame
    );

    doc.querySelector("dialog button.cancel").addEventListener(
        "click",
        (e) => {
            nameDialog.close(null);
            e.preventDefault();
        }
    );

    doc.querySelector("dialog button.start-turn").addEventListener(
        "click",
        (e) => {
            nameDialog.close(null);
            startNewGame();
            e.preventDefault();        
        }
    );

    function updateState(newState){
        if (!newState===undefined) {
            state = newState;
        }
        if (game.isOver()) {
            state = GAME_OVER;
        } else {
            state = IN_PROGRESS;
        }
    }

    function askPlayerNames(){
        nameDialog.showModal();
    }

    function startNewGame(){
        game.init();
        game.deletePlayers();
        game.createPlayer(
            document.querySelector("#player1").value,
            "O"
        );
        game.createPlayer(
            document.querySelector("#player2").value,
            "X"
        );
        updateState();
        updateStateRelatedView();
        updateBoardView();
    }

    function continueGame(){
        console.log('continue');
        game.init();
        updateState();
        updateStateRelatedView();
        updateBoardView();
    }

    function updateBoardView(){
        const boardData = game.getBoard();
        for (let i = 0; i < 9; i++) {
            if (boardData[i] !== null) {
                cells[i].textContent = boardData[i];
                cells[i].disabled = true;
            } else {
                cells[i].textContent = "";
                cells[i].disabled = false;
            }
        }
    }

    function updateStateRelatedView(){
        console.log(state);
        switch (state) {
            case GAME_OVER:
                disableBoard();
                updateControlButtonsView();
                if (game.hasWinner()) {
                    displayMessage(`Game Over: ${game.getWinner().getName()} wins!`);
                } else {
                    displayMessage("Game Over: Draw");
                }
                return;
            case IN_PROGRESS:
                enableBoard();
                updateControlButtonsView();
                displayMessage(`${game.getCurrentPlayer().getName()}'s turn`);
                return;
        }
    }

    function updateControlButtonsView(){
        switch(state){
            case IN_PROGRESS:
                startNewButton.hidden = false;
                continueButton.hidden = false;
                startNewButton.textContent = "Reset Player";
                continueButton.textContent = "Restart";
                return;
            case GAME_OVER:
                startNewButton.hidden = false;
                continueButton.hidden = false;
                startNewButton.textContent = "Reset Player";
                continueButton.textContent = "Play Again";
                return;
        }
    }

    function disableBoard(){
        cells.forEach(cell => cell.disabled = true);
    }

    function enableBoard(){
        cells.forEach(cell => cell.disabled = false);
    }

    function displayMessage(text) {
        message.textContent = text;
    }

}(document, game);

  // Game Flow
// game.init();
// game.createPlayer("Player 1", "O");
// game.createPlayer("Player 2", "X");

// game.populateBoard([
//     "O",  "X",  "O",
//     "X",  null, null,
//     null, null, "O",
// ]);

// document.querySelector(".name-dialog").showModal();

//   while(!game.isOver()) {
//     const currentPlayer = game.getCurrentPlayer();
//     const cell = prompt(`${currentPlayer.getName()}: Pick where to place marker:\n ${showAs3x3(game.getBoard())}`);
//     game.placeMarker(currentPlayer, cell);
//     game.switchTurn();
//   }
  
//   if (game.hasWinner()) {
//     console.log(`${game.getWinner().getName()} Wins`);
//   } else {
//     console.log(`Game ended with a draw`)
//   }
  
//   function showAs3x3(array) {
//     const newArray = array.map(val => val===null ? '#' : val);
//     return `${newArray.slice(0, 3).join(" ")}
//   ${newArray.slice(3, 6).join(" ")}
//   ${newArray.slice(6, 9).join(" ")}`.trim();
//   }