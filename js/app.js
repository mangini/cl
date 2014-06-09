(function(context) {

  var STATE_INIT=0;
  var STATE_MY_MOVE=1;
  var STATE_OTHER_MOVE=2;
  var STATE_FINISHED=3;

  function Board(boardEl, controlsEl) {
    this.board = [0,0,0,0,0,0,0,0,0];
    this.boardEl = boardEl;
    this.controlsEl = controlsEl;
    this.state = STATE_MY_MOVE;
    this.winner = 0;
    this.init()
  }

  Board.prototype.init = function() {
    this.board=[0,0,0,0,0,0,0,0,0];
    Array.prototype.forEach.call(this.boardEl.querySelectorAll('.cell'), function(e, i) {
      if (i >= this.board.length) {
        return;
      }
      e.setAttribute("board_row", Math.floor( i / 3 ) );
      e.setAttribute("board_col", i % 3 );
      e.addEventListener('click', this.onCellClick.bind(this));
    }.bind(this));
  }

  Board.prototype.onCellClick = function(ev) {
    var r=parseInt(ev.target.getAttribute("board_row"));
    var c=parseInt(ev.target.getAttribute("board_col"));
    var i = r*3 + c;
    if (this.board[i] != 0 || this.state==STATE_INIT || this.state==STATE_FINISHED) {
      return;
    }
    var myMove = this.state === STATE_MY_MOVE;
    this.board[i] = myMove ? 1 :-1;
    this.state = myMove ? STATE_OTHER_MOVE : STATE_MY_MOVE;
    this.refreshBoard();
  }

  Board.prototype.refreshBoard = function() {
    Array.prototype.forEach.call(this.boardEl.querySelectorAll('.cell'), function(e, i) {
      if (i >= this.board.length) {
        return;
      }
      e.classList.remove('solution');
      e.classList.remove('tic');
      e.classList.remove('tac');
      if (this.board[i] == 1) {
        e.classList.add('tic');
      } else if (this.board[i] == -1) {
        e.classList.add('tac');
      }
    }.bind(this));
    this.checkWinners();
    this.controlsEl.classList.remove('myturn');
    this.controlsEl.classList.remove('otherturn');
    this.controlsEl.classList.remove('win');
    this.controlsEl.classList.remove('lost');
    if (this.state === STATE_FINISHED) {
      this.boardEl.classList.add('finished');
      this.controlsEl.classList.add('finished');
      if (this.winner === 1) {
        this.controlsEl.classList.add('win');
      } else if (this.winner === -1) {
        this.controlsEl.classList.add('lost');
      }
    } else {
      var playerClass = this.state === STATE_MY_MOVE ? 'myturn' : 'otherturn';
      this.controlsEl.classList.add(playerClass);
    }
  }

  Board.prototype.checkWinners = function() {
    var cells = this.boardEl.querySelectorAll('.cell');
    // check horizontals
    for (var r=0; r<3; r++) {
      var v = this.board[r*3];
      if ( v != 0 && v === this.board[r*3+1] && v === this.board[r*3+2] ) {
        this.state = STATE_FINISHED;
        this.winner = v;
        cells.item(r*3).classList.add('solution');
        cells.item(r*3+1).classList.add('solution');
        cells.item(r*3+2).classList.add('solution');
        return;
      }
    }
    // check verticals
    for (var c=0; c<3; c++) {
      var v = this.board[c];
      if ( v != 0 && v === this.board[3+c] && v === this.board[6+c] ) {
        this.state = STATE_FINISHED;
        this.winner = v;
        cells.item(c).classList.add('solution');
        cells.item(3+c).classList.add('solution');
        cells.item(6+c).classList.add('solution');
        return;
      }
    }
    // check diagonals
    if ( this.board[4] != 0 ) {
      var v = this.board[4];
      if ( this.board[0] === v && this.board[8] === v) {
          cells.item(0).classList.add('solution');
          cells.item(4).classList.add('solution');
          cells.item(8).classList.add('solution');
        this.state = STATE_FINISHED;
        this.winner = v;
        return;
      }
      if ( this.board[2] === v && this.board[6] === v) {
          cells.item(2).classList.add('solution');
          cells.item(4).classList.add('solution');
          cells.item(6).classList.add('solution');
        this.state = STATE_FINISHED;
        this.winner = v;
        return;
      }

      if ( this.board[0] === v && this.board[1] === v && this.board[2] === v &&
           this.board[3] === v && this.board[4] === v && this.board[5] === v &&
           this.board[6] === v && this.board[7] === v && this.board[8] === v) {
        this.state = STATE_FINISHED;
        this.winner = v;
      }
    }
  }

  var compareArrays = function(a1, a2) {
    if (a1 === null && a2 === null) {
      return true;
    }
    if (a1 === null || a2 === null) {
      return false;
    }
    if (a1.length != a2.length) {
      return false;
    }
    for (var i=0; i<a1.length; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  };

  window.Board = Board;

})(window);


document.addEventListener('DOMContentLoaded', function() {
  window.board = new Board(document.querySelector('#board'), document.querySelector('#controls'));
});
