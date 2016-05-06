var shipSizes  = [0,    0,    4,           8,           4,            4]
var SHIP_NAMES = [null, null, 'Destroyer', 'Submarine', 'Battleship', 'Carrier']
var N = 20

class EmptyCell extends React.Component {
  render() {
    return (<div className="cell empty"></div>)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}

class ColHeadingCell extends React.Component {
  render() {
    return (<div className="cell heading">{String.fromCharCode(this.props.colIndex + 65)}</div>)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}

class RowHeadingCell extends React.Component {
  render() {
    return (<div className="cell heading">{this.props.rowIndex + 1}</div>)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hit: false, ship: null}
  }

  render() {
    return (<div className={this.getClassName()} onClick={this.handleClickCell.bind(this)}>{this.getShipSize()}</div>)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.hit != nextState.hit) ||
           (this.props.sunk != nextProps.sunk)
  }

  getClassName() {
    var className = ''
    if (this.state.ship && this.state.ship.sunk) {
      className = 'sunk hit'
    } else if (this.state.ship) {
      className = 'hit'
    } else if (this.state.hit) {
      className = 'miss'
    }
    return 'cell '+className
  }

  getShipSize() {
    if (this.state.ship) {
      return this.state.ship.shipSize
    }
  }

  handleClickCell(e, f, g) {
    if (this.state.hit) {
      return
    }
    var ship = this.props.onClickCell(this.props.colIndex, this.props.rowIndex)
    this.setState({hit: true, ship: ship})
  }
}

class Board extends React.Component {
  render() {
    return (
      <div className="board">
        <div className="row heading">
          <EmptyCell/>
          {[...Array(this.props.size)].map((_, x) =>
            <ColHeadingCell colIndex={x} key={x}/>
          )}
        </div>
        {[...Array(this.props.size)].map((_, y) =>
          <div className="row" key={y}>
            <RowHeadingCell rowIndex={y}/>
            {[...Array(this.props.size)].map((_, x) =>
              <Cell rowIndex={y} colIndex={x}
                    sunk={this.props.ships.sunkAt(x, y)}
                    onClickCell={this.props.onClickCell} key={x}/>
            )}
          </div>
        )}
      </div>
    )
  }
}

class Ship {
  constructor(boardSize, x, y, isVertical, shipSize) {
    this.boardSize = boardSize
    this.x = x
    this.y = y
    this.isVertical = isVertical
    this.x2 = x + (isVertical ? 0 : shipSize - 1)
    this.y2 = y + (isVertical ? shipSize - 1 : 0)
    this.shipSize = shipSize
    this.cellsRemaining = shipSize
    this.sunk = false
  }

  intersects(otherShip) {
    var tx1 = this.x
    var ty1 = this.y
    var ox1 = otherShip.x
    var oy1 = otherShip.y

    var tx2 = this.x2 + 1
    var ty2 = this.y2 + 1
    var ox2 = otherShip.x2 + 1
    var oy2 = otherShip.y2 + 1

    return ((ox2 < ox1 || ox2 > tx1) &&
            (oy2 < oy1 || oy2 > ty1) &&
            (tx2 < tx1 || tx2 > ox1) &&
            (ty2 < ty1 || ty2 > oy1))
  }

  contains(x, y) {
    return (x >= this.x && x <= this.x2 && y >= this.y && y <= this.y2)
  }

  hit() {
    this.cellsRemaining--
    if (this.cellsRemaining == 0) {
      this.sunk = true
    }
  }
}

class Ships {
  constructor(boardSize, shipSizes) {
    this.boardSize = boardSize
    this.ships = []
    shipSizes.forEach((shipCount, shipSize) => {
      for (var i = 0; i < shipCount; i++) {
        this.addRandomShip(shipSize)
      }
    })
  }

  addRandomShip(shipSize) {
    while (true) {
      var isVertical = (Math.random() < 0.5)
      var x = Math.floor(Math.random() * (this.boardSize - (isVertical ? 0 : shipSize - 1)))
      var y = Math.floor(Math.random() * (this.boardSize - (isVertical ? shipSize - 1 : 0)))
      var ship = new Ship(this.boardSize, x, y, isVertical, shipSize)
      var good = true
      for (var i = 0; i < this.ships.length; i++) {
        var otherShip = this.ships[i]
        if (otherShip.intersects(ship)) {
          good = false
          break
        }
      }
      if (good) {
        this.ships.push(ship)
        break
      }
    }
  }

  shipAt(x, y) {
    for (var i = 0; i < this.ships.length; i++) {
      var ship = this.ships[i]
      if (ship.contains(x, y)) {
        return ship
      }
    }
  }

  cellAt(x, y) {
    var ship = this.shipAt(x, y)
    if (ship) {
      return ship.shipSize
    }
  }

  sunkAt(x, y) {
    var ship = this.shipAt(x, y)
    if (ship) {
      return ship.sunk
    }
  }
}

class Log extends React.Component {
  constructor(props) {
    super(props)
    this.state = {visible: false}
  }

  render() {
    return (
      <div className="logContainer">
        <button className="toggleLog" onClick={this.toggleLog.bind(this)}>{this.state.visible ? "Hide" : "Show"} log</button>
        {(this.state.visible) ?
        <ul className="log">
          {this.props.logs.map((log, i) =>
            <li key={i}>
              <span className="eventNumber">{i + 1}</span>
              <span className="location">{log.cell}</span>
              <span className="event">
                {!log.ship ? "Miss."
                           : ((log.sunk ? "Sunk. " : "Hit. ")+this.props.shipNames[log.ship])}
              </span>
            </li>
          )}
        </ul>
        : ''}
      </div>
    )
  }

  toggleLog() {
    this.setState({visible: !this.state.visible})
  }

  componentDidUpdate() {
    var ul = ReactDOM.findDOMNode(this)
    ul.scrollTop = 9999
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.visible || (this.state.visible != nextState.visible)
  }
}

class Progress extends React.Component {
  render() {
    return (
      <div className="progress">
        {this.props.shipSizes.map((shipCount, shipSize)=>{
          if (shipCount > 0) {
            return (
              <div key={shipSize}>
                <span className="shipname">{this.props.shipNames[shipSize]}</span>
                <span className="sunk">{this.props.shipsSunk[shipSize]}</span>
                <span className="total">{shipCount}</span>
              </div>
            )
          }
        })}
      </div>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.totalShipsSunk != nextProps.totalShipsSunk)
  }
}

class BattleShip extends React.Component {
  constructor(props) {
    super(props)
    var ships = new Ships(this.props.size, this.props.shipSizes)
    this.state = {
      ships: ships,
      cellsHit: {},
      logs: [],
      shipsSunk: Array(this.props.size).fill().map(()=> 0),
      totalShipsSunk: 0
    }
  }
  render() {
    return (
      <div>
        <Board size={this.props.size} ships={this.state.ships} onClickCell={this.handleClickCell.bind(this)}/>
        <Log logs={this.state.logs} shipNames={this.props.shipNames}/>
        <Progress shipsSunk={this.state.shipsSunk} totalShipsSunk={this.state.totalShipsSunk}
                  shipSizes={this.props.shipSizes} shipNames={this.props.shipNames}/>
      </div>
    )
  }
  handleClickCell(x, y) {
    var cell = String.fromCharCode(x + 65) + (y + 1)
    if (this.state.cellsHit[cell]) {
      return
    }
    this.state.cellsHit[cell] = true
    var ship = this.state.ships.shipAt(x, y)
    var log = {cell: cell}
    if (ship) {
      ship.hit()
      this.setState({ships: this.state.ships})
      log.ship = ship.shipSize
      log.sunk = ship.sunk
      if (ship.sunk) {
        this.state.shipsSunk[ship.shipSize]++
        this.setState({shipsSunk: this.state.shipsSunk, totalShipsSunk: this.state.totalShipsSunk + 1})
      }
    }
    this.state.logs.push(log)
    this.setState({cellsHit: this.state.cellsHit, logs: this.state.logs})
    return ship
  }
}

ReactDOM.render(
  <BattleShip  size={N} shipSizes={shipSizes} shipNames={SHIP_NAMES}/>,
  document.getElementById('content')
)
