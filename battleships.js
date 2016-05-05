var ships      = [0,    0,    1,           2,           1,            1]
var SHIP_NAMES = [null, null, 'Destroyer', 'Submarine', 'Battleship', 'Carrier']
var N = 10

var EmptyCell = React.createClass({
  render: function(){
    return (
      <span className="cell empty"/>
    )
  }
})
var RowHeadingCell = React.createClass({
  render: function() {
    return (
      <span className="cell row heading">{String.fromCharCode(65+this.props.row)}</span>
    )
  }
})
var ColHeadingCell = React.createClass({
  render: function() {
    return (
      <span className="cell col heading">{this.props.col + 1}</span>
    )
  }
})
var Cell = React.createClass({
  getInitialState: function() {
    return {hit: ''}
  },
  handleClick: function(e) {
    var hit = this.props.onClickCell(this.props.row, this.props.col)
    this.setState({hit: hit})
  },
  className: function() {
    return "cell "+(this.state.hit > 0 ? 'hit' : (this.state.hit === null ? 'miss' : 'no'))
  },
  render: function() {
    return (
      <span className={this.className()} onClick={this.handleClick}>{this.state.hit}</span>
    )
  }
})
var RowHeading = React.createClass({
  render: function() {
    return (
      <div className="row heading">
        <EmptyCell key="1"/>
        {Array.apply(0, Array(this.props.size)).map(function(x, i) {
          return <ColHeadingCell col={i} key={i+10}/>
        })}
      </div>
    )
  }
})
var Row = React.createClass({
  render: function() {
    var self = this
    var row = this.props.row
    var rowdata = this.props.rowdata
    return (
      <div className="row">
        <RowHeadingCell row={row} />
        {Array.apply(0, Array(this.props.size)).map(function(x, i) {
          return <Cell key={i+1} row={row} col={i} data={rowdata[i]} onClickCell={self.props.onClickCell}/>
        })}
      </div>
    )
  }
})
var Board = React.createClass({
  render: function() {
    var self = this
    var size = this.props.size
    var cells = this.props.cells
    return (
      <div className="board">
        <RowHeading size={size} />
        {Array.apply(0, Array(size)).map(function(x, i) {
          return <Row key={i+1} row={i} size={size} rowdata={cells[i]} onClickCell={self.props.onClickCell}/>
        })}
      </div>
    )
  }
})
var Log = React.createClass({
  getClassName: function(event) {
    return event.hit ? "event hit" : "event miss"
  },
  componentDidUpdate: function() {
    var ul = ReactDOM.findDOMNode(this)
    ul.scrollTop = 9999
  },
  render: function() {
    var lis = []
    for (var i = 0; i < this.props.hits.length; i++) {
      var event = this.props.hits[i]
      var message;
      if (event.hit) {
        message = 'Hit. ' + this.props.shipNames[event.ship]
      } else {
        message = 'Miss.'
      }
      lis.push(
        <li key={i+1}>
          <span className="eventNumber">{i + 1}</span>
          <span className="location">{event.cell}</span>
          <span className={this.getClassName(event)}>{message}</span>
        </li>)
    }
    return (<ul className="log">{lis}</ul>)
  }
})
var Progress = React.createClass({
  render: function() {
    return (
      <div className="progress">
        <span className="sunk">{this.props.progress}</span>
        <span className="total">{this.props.total}</span>
      </div>
    )
  }
})
var BattleShip = React.createClass({
  getInitialState: function() {
    return {
      cells: this.generateRandomBoard(this.props.size, this.props.ships),
      hits: [],
      shipCells: this.countShipCells(this.props.ships),
      shipCellsSunk: 0
    }
  },
  generateRandomBoard: function(size, ships) {
    var board = []
    for (var rowIdx = 0; rowIdx < size; rowIdx++) {
      var row = []
      for (var col = 0; col < size; col++) {
        row.push({content: null, hit: false})
      }
      board.push(row)
    }
    var shipCells = 0
    for (var shipSize = 0; shipSize < ships.length; shipSize++) {
      var shipCount = ships[shipSize]
      for (var i = 0; i < shipCount; i++) {
        this.addShip(board, size, shipSize)
        shipCells += shipSize
      }
    }
    return board;
  },
  countShipCells: function(ships) {
    var shipCells = 0
    for (var shipSize = 0; shipSize < ships.length; shipSize++) {
      var shipCount = ships[shipSize]
      shipCells += shipSize * shipCount
    }
    return shipCells
  },
  addShip: function(board, size, shipSize) {
    while (true) {
      var row = Math.floor(Math.random()*size)
      var col = Math.floor(Math.random()*size)
      var isVertical = (Math.random() < 0.5)

      var dx = (isVertical ? 0 : 1)
      var dy = (isVertical ? 1 : 0)
      var x = col
      var y = row
      var good = true
      for (var i = 0; i < shipSize; i++) {
        if (x >= size || y >= size || board[y][x].content != null) {
          good = false
          break
        }
        x += dx
        y += dy
      }
      if (good) {
        x = col
        y = row
        for (i = 0; i < shipSize; i++) {
          board[y][x].content = shipSize
          x += dx
          y += dy
        }
        break
      }
    }
  },
  handleClickCell: function(row, col) {
    var cell = this.state.cells[row][col]
    if (cell.hit) {
      return cell.content
    }
    var hit = (cell.content > 0)
    cell.hit = (hit ? 'hit' : 'miss')
    this.setState({
      hits: this.state.hits.concat({
        cell: String.fromCharCode(row + 65) + (col + 1),
        hit: hit,
        ship: cell.content
      }),
      cells: this.state.cells,
      shipCellsSunk: this.state.shipCellsSunk + (hit ? 1 : 0)
    })
    return cell.content
  },
  render: function() {
    return (
      <div className="battleship">
        <Board size={this.props.size} cells={this.state.cells} onClickCell={this.handleClickCell} />
        <Log hits={this.state.hits} shipNames={this.props.shipNames} />
        <Progress total={this.state.shipCells} progress={this.state.shipCellsSunk} />
      </div>
    );
  }
});


ReactDOM.render(
  <BattleShip size={N} ships={ships} shipNames={SHIP_NAMES}/>,
  document.getElementById('content')
);
