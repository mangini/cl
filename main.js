document.addEventListener('DOMContentLoaded', function() {
  var gameEl = document.getElementById('game');
  var boardEl = game.querySelector('.board');
  var controlsEl = game.querySelector('.controls');
  var cells = boardEl.querySelectorAll('.cell');
  var messageEl = controlsEl.querySelector('.message');

  window.board = new Board();

  window.board.setCallback('onTurnChanged', redrawBoard);
  window.board.setCallback('onFinished', handleFinished);
  window.board.init()

  // set click listeners
  Array.prototype.forEach.call(cells, function(e, i) {
    e.setAttribute("board_cell", i );
    e.addEventListener('click', function() {
      window.board.play(i);
    });
  });

  var restartBt = document.createElement('button');

  controlsEl.querySelector('.restart').addEventListener('click', function() {
    game.classList.remove('finished');
    window.board.init();
    redrawBoard(window.board);
  });


  function onTurnChanged(board) {
    redrawBoard(board);
  }

  function getPlayerLabel(board, player) {
    switch (player) {
      case board.PLAYER_1: return '1';
      case board.PLAYER_2: return '2';
      default: return '';
    }
  }

  function redrawBoard(board) {
    // redraw cell states:
    Array.prototype.forEach.call(cells, function(e, i) {
      e.classList.remove('solution');
      var state = board.getCellState(i);
      if (!state) {
        e.classList.remove('tic');
        e.classList.remove('tac');
      } else {
        e.classList.add(state == board.PLAYER_1 ? 'tic' : 'tac');
      }
    });

    // redraw "next player" status message:
    var message = '';
    switch (board.getBoardState()) {
      case board.STATE_PLAYING:
        message = 'Player '+getPlayerLabel(board, board.getNextPlayer());
        break;
      case board.STATE_FINISHED:
        if (board.getWinner()) {
          message = 'Winner: player '+getPlayerLabel(board, board.getWinner());
        } else {
          message = 'Draw!';
        }
        break;
    }
    messageEl.innerText = message;
  }


  function handleFinished(board) {
    redrawBoard(board);
    game.classList.add('finished');
    // if (board.getWinner() == board.PLAYER_1) {
    //   controlsEl.classList.add('win');
    // } else if (board.getWinner() == board.PLAYER_2) {
    //   controlsEl.classList.add('lost');
    // } else {
    //   controlsEl.classList.add('draw');
    // }
    if (board.getWinningCells()) {
      for (var c=0; c < board.getWinningCells().length ; c++) {
        if (board.getWinningCells()[c]) {
          cells.item(c).classList.add('solution');
        } else {
          cells.item(c).classList.remove('solution');
        }
      }
    }
  }

});