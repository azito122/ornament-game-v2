import React from 'react'
import { getRandomInt, getRandomItem, Position, deepCopy } from './Util'
import { Cell, _Cell } from './Cell'
import './Board.css'

interface BoardProps {
  width: number,
  height: number,
  addScore: Function,
  level: number,
}

interface BoardState {
  cells: _Cell[][],
  locked: boolean,
}

export default class Board extends React.Component<BoardProps, BoardState> {
  private buffer:_Cell[][];

  constructor (props:any) {
    super(props)

    let emptyCell = new _Cell(0);
    let cells = Array(this.props.height).fill(Array(this.props.width).fill(emptyCell));
    // cells.forEach((row:_Cell[]) => {
    //   row.forEach((empty:_Cell) => {
    //     empty = new _Cell(0);
    //   })
    // })
    this.buffer = JSON.parse(JSON.stringify(cells));

    this.state = {
      cells: cells,
      locked: false,
    }
  }

  componentDidMount () {
    this.fillCells();
  }

  render () {
    return (
      <div className="cells">
        {
          this.state.cells.map((cells: _Cell[], groupIndex: number) => {
            return (
              <div key={groupIndex} className="cells-row">
                {
                  cells.map((cell: _Cell, cellIndex: number) => {
                    return <Cell
                      status={cell.status}
                      position={new Position(cellIndex,groupIndex)}
                      key={groupIndex * 4 + cellIndex}
                      type={cell.type}
                      handleClick={(p:Position)=>{this.handleClick(p)}}
                      handleHover={(p:Position)=>{this.handleHover(p)}}
                      handleUnhover={(p:Position)=>{this.handleUnhover(p)}}
                      special={cell.special}
                    />
                  })
                }
              </div>
            )
          })
        }
      </div>
    )
  }

  fillCells(s?:number) {
    let ns:number[];

    if (typeof s !== 'undefined') {
      let pickn = s > 3 ? s - 1 : 2;
      ns = Array(pickn).fill(null);
      ns = ns.map((v:number, i:number) => {
        return this.getRandomTileType();
      });
    }

    this.buffer.forEach( (r:_Cell[]) => {
      r.forEach( (c:_Cell, i:number) => {
        if (c.type === 0) {
          r[i] = this.fillCell(ns);
        }
      })
    });
    this.flushBuffer();

    // this.handleHover()
    setTimeout(this.unlock.bind(this), 1000);
  }

  fillCell(ns?:number[]):_Cell {
    let type = this.getRandomTileType();
    if (typeof ns !== 'undefined') {
      let type = getRandomItem(ns);
    }

    let special = '';
    if(getRandomInt(1,100) < 4) {
      special = getRandomItem(['borg', 'gold']);
    }

    return new _Cell(type, special);
  }

  handleUnhover (position:Position) {
    if (this.state.locked) {
      return;
    }

    let untargeted = this.calcGroup(position);
    if (untargeted.length >= 3) {
      this.untargetByPositions(untargeted);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }
  }

  handleHover (position:Position) {
    let targeted = this.calcGroup(position);
    if (targeted.length >= 3) {
      this.targetByPositions(targeted);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }
  }

  private targetByPositions(targeted:Position[]) {
    targeted.forEach((p:Position) => {this.targetByPosition(p)});
  }

  private targetByPosition(position:Position) {
    let cell = this.getCell(position);
    this.targetCell(cell);
  }

  private targetCell(cell:_Cell) {
    cell.status = 'targeted';
  }

  private untargetByPositions(targeted:Position[]) {
    targeted.forEach((p:Position) => {this.untargetByPosition(p)});
  }

  private untargetByPosition(position:Position) {
    let cell = this.getCell(position);
    this.untargetCell(cell);
  }

  private untargetCell(cell:_Cell) {
    cell.status = '';
  }

  handleClick (position:Position) {
    if (this.state.locked) {
      return;
    } else {
      let toBoom = this.calcGroup(position);

      if (toBoom.length >= 3) {
        this.lock(() => {
          this.boom(toBoom);
        });
      } else {
        this.resetBuffer();
      }
    }
  }

  private boom(toBoom:Position[]) {
      this.preBoomByPositions(toBoom);
      this.flushBuffer();

      setTimeout(() => {
        this._boom(toBoom);
      }, 1000)
  }

  private _boom (toBoom:Position[]) {
    this.boomByPositions(toBoom);
    this.props.addScore(toBoom.length);

    this.flushBuffer();

    setTimeout(() => {
      let bfc = this.fillCells.bind(this);
      bfc(toBoom.length)
    }, 300)
  }

  private calcGroup(start:Position) {
    let startCell = this.getCell(start);
    let findType = startCell.type;
    let searchSpace = deepCopy(this.buffer)

    return this.findMatchingAdjacent(searchSpace,start,findType,[])
  }


  private findMatchingAdjacent(searchSpace:&_Cell[][], start:Position, findType:number, found:Position[]):Position[] {
    if (searchSpace[start.y][start.x].type === 0) {
      return found;
    }

    found.push(start);
    searchSpace[start.y][start.x].type = 0;

    let adjacentPositions = this.getAdjacentPositions(start);
    adjacentPositions.forEach((adjPosition:Position) => {
      let adjCell = this.getCell(adjPosition);
      if (adjCell.type === findType) {
        found.concat(this.findMatchingAdjacent(searchSpace,adjPosition,findType,found));
      }
    })
    return found;
  }

  private getAdjacentPositions(p:Position) {
    let x = p.x;
    let y = p.y;
    let positions = [
      new Position(x+1,y),
      new Position(x-1,y),
      new Position(x,y+1),
      new Position(x,y-1)
    ]

    return positions.filter((p:Position) => {
      return p.onBoard();
    })
  }

  private preBoomByPositions(positions:Position[]) {
    positions.forEach((p:Position) => {this.preBoomByPosition(p)});
  }

  private boomByPositions(positions:Position[]) {
    positions.forEach((p:Position) => {this.boomByPosition(p)});
  }

  private preBoomByPosition(position:Position) {
    let cell = this.getCell(position);
    this.preBoomCell(cell);
  }

  private boomByPosition(position:Position) {
    let cell = this.getCell(position);
    this.boomCell(cell);
  }

  private preBoomCell(cell:&_Cell) {
    cell.status = 'booming';
  }

  private boomCell(cell:&_Cell) {
    let cType = cell.type;
    let cSpecial = cell.special;
    cell.type = 0;
    cell.special = '';
    cell.status = 'booming';

    if (cSpecial === 'borg') {
      this.boomAllOfType(cType)
    } else if (cSpecial === 'gold') {
      this.props.addScore(15)
    }
  }

  private boomAllOfType(type:number) {
    console.log('Boom all of type', type);
    this.buffer.forEach((row:_Cell[]) => {
      row.forEach((cell:_Cell) => {
        if (cell.type === type) {
          // console.log('boom cell', cell);
          this.boomCell(cell);
        }
      })
    })
    this.flushBuffer();
  }

  private getCell(p:Position):_Cell {
    return this.buffer[p.y][p.x];
  }

  private getCellType(p:Position):number {
    return this.getCell(p).type;
  }

  private setCellType(p:Position, type:number) {
    this.getCell(p).type = type;
  }

  private flushBuffer() {
    let buffer = JSON.parse(JSON.stringify(this.buffer));
    this.setState((state) => {
      return {cells: buffer}
    })
  }

  private resetBuffer() {
    this.buffer = JSON.parse(JSON.stringify(this.state.cells));
  }

  private getRandomTileType():number {
    let maxmax = 5;
    let max = this.props.level + 4 >= maxmax ? maxmax : this.props.level + 4;
    let r = getRandomInt(1,this.props.level + 4);
    return r >= max ? max : r;
  }

  private lock(callback?:(() => void)):void {
    this.setState(() => {
      return {locked: true}
    }, callback)
  }

  private unlock(callback?:(() => void)):void {
    this.setState(() => {
      return {locked: false}
    }, callback)
  }
}