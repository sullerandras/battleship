ships      = [0,    0,    1,           2,           1,            1]
SHIP_NAMES = [null, null, 'Destroyer', 'Submarine', 'Battleship', 'Carrier']
N = 10

class EmptyCell extends React.Component
  render: ->
    React.createElement 'div',
      className: 'cell empty'

class CellHeading extends React.Component
  render: ->
    React.createElement 'div',
      className: 'cell heading'
      @props.content

class RowHeading extends React.Component
  render: ->
    React.createElement 'div',
      className: 'row heading'
      React.createElement EmptyCell, null
      (React.createElement CellHeading, key: i, content: i + 1 for i in [0...@props.size])

class Cell extends React.Component
  constructor: ->
    @state = className: '', content: ''

  render: ->
    React.createElement 'div',
      className: 'cell '+@state.className, onClick: @handleClick
      @state.content

  handleClick: (e)=>
    ship = @props.onClickCell @props.rowIndex, @props.colIndex
    if ship > 0
      @setState className: 'hit', content: ship
    else if ship == 0
      @setState className: 'miss'

class Row extends React.Component
  render: ->
    React.createElement 'div',
      className: 'row'
      React.createElement CellHeading, content: String.fromCharCode(65 + @props.rowIndex)
      (React.createElement(Cell,
        key: i, rowIndex: @props.rowIndex, colIndex: i, onClickCell: @props.onClickCell) for i in [0...@props.size])

class Board extends React.Component
  render: ->
    React.createElement 'div',
      className: 'board'
      React.createElement RowHeading, size: @props.size
      (React.createElement Row, key: i, size: @props.size, rowIndex: i, onClickCell: @props.onClickCell for i in [0...@props.size])

class Cells
  constructor: (@size) ->
    @cells = ((0 for x in [0...@size]) for y in [0...@size])
    @ships = []

  addRandomShip: (shipSize)->
    while true
      x = Math.floor(Math.random() * @size)
      y = Math.floor(Math.random() * @size)
      isVertical = (Math.random() < 0.5)
      [dx, dy] = if isVertical then [0, 1] else [1, 0]
      if @cellsEmpty x, y, dx, dy, shipSize
        shipIndex = @ships.length
        @ships.push x: x, y: y, dx: dx, dy: dy, shipSize: shipSize, aliveCells: shipSize
        @setCells x, y, dx, dy, shipSize, shipIndex + 1
        break

  cellsEmpty: (x, y, dx, dy, count)->
    while count > 0
      if x >= @size || y >= @size || @cells[y][x] > 0
        return false

      x += dx
      y += dy
      count--
    true

  setCells: (x, y, dx, dy, count, value)->
    while count > 0
      @cells[y][x] = value

      x += dx
      y += dy
      count--

  alreadyFiredAt: (x, y)->
    @cells[y][x] == 'miss' || @cells[y][x] < 0

  # returns:
  #  shipSize (positive number) if hit a ship but the ship is has not sunk
  #  -1 * shipSize (negative number) if hit a ship and sunk
  #  0 otherwise (missed)
  fireAt: (x, y)->
    if @cells[y][x] > 0
      shipIndex = @cells[y][x] - 1
      ship = @ships[shipIndex]
      ship.aliveCells--
      sunk = (ship.aliveCells == 0)
      @cells[y][x] *= -1
      if sunk
        -ship.shipSize
      else
        ship.shipSize
    else
      @cells[y][x] = 'miss'
      0

class Log extends React.Component
  constructor: (props)->

  render: ->
    React.createElement 'ul',
      className: 'log'
      for log, i in @props.logs
        if log.ship > 0
          message = 'Hit. '+@props.shipNames[log.ship]
        else if log.ship < 0
          message = 'Sunk. '+@props.shipNames[-log.ship]
        else
          message = 'Miss.'

        React.createElement 'li', key: i,
          React.createElement 'span', className: 'eventNumber', i+1
          React.createElement 'span', className: 'location', String.fromCharCode(log.y + 65) + (log.x + 1)
          React.createElement 'span', className: 'event '+(log.ship > 0 ? 'hit' : 'miss'), message

  componentDidUpdate: ->
    ul = ReactDOM.findDOMNode @
    ul.scrollTop = 9999

class Progress extends React.Component
  render: ->
    React.createElement 'div',
      className: 'progress'
      React.createElement 'span', className: 'sunk', @props.sunk
      React.createElement 'span', className: 'total', @props.total

class BattleShip extends React.Component
  constructor: (props)->
    @state =
      logs: []
      cells: @generateRandomBoard props.size, props.ships
      totalShip: @countShipCells props.ships
      sunkShip: 0

  render: ->
    React.createElement 'div',
      className: 'battleship'
      React.createElement Board, size: @props.size, onClickCell: @handleClickCell
      React.createElement Log, logs: @state.logs, shipNames: @props.shipNames
      React.createElement Progress, sunk: @state.sunkShip, total: @state.totalShip

  generateRandomBoard: (size, ships)->
    cells = new Cells size
    for shipSize in [1...ships.length]
      for i in [0...ships[shipSize]]
        cells.addRandomShip shipSize
    cells

  countShipCells: (ships)->
    sum = 0
    for count in ships
      sum += count
    sum

  handleClickCell: (rowIndex, colIndex)=>
    return if @state.cells.alreadyFiredAt colIndex, rowIndex
    ship = @state.cells.fireAt colIndex, rowIndex
    @state.logs.push ship: ship, x: colIndex, y: rowIndex
    @setState cells: @state.cells, logs: @state.logs
    if ship < 0
      @setState sunkShip: @state.sunkShip + 1
    Math.abs ship

ReactDOM.render(
  React.createElement(BattleShip, {size: N, ships: ships, shipNames: SHIP_NAMES}),
  document.getElementById('content')
  )
