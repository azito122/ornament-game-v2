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
                      position={new Position(cellIndex,groupIndex)}
                      key={groupIndex * 4 + cellIndex}
                      type={cell.type}
                      boom={(p:Position,v:number)=>{this.boom(p,v)}}
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
      r.forEach( (c:_Cell) => {
        if (c.type === 0) {
          c.type = this.fillCell(ns);
          c.special = this.cellSpecialize();
        }
      })
    });
    this.flushBuffer();
  }

  private cellSpecialize() {
    if(getRandomInt(1,100) < 4) {
      return getRandomItem(['borg', 'gold']);
    }
  }

  fillCell(ns?:number[]):number {
    if (typeof ns === 'undefined') {
      return this.getRandomTileType();
    } else {
      return getRandomItem(ns);
    }
  }

  boom (position:Position, baseValue:number) {
    let toBoom = this.calcGroup(position);

    if (toBoom.length >= 3) {
      this.boomByPositions(toBoom);
      this.props.addScore(toBoom.length);

      this.flushBuffer();

      setTimeout(() => {
        let bfc = this.fillCells.bind(this);
        bfc(toBoom.length)
      }, 700)
    } else {
      this.resetBuffer();
    }
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

  private boomByPositions(positions:Position[]) {
    positions.forEach((p:Position) => {this.boomByPosition(p)});
  }

  private boomByPosition(position:Position) {
    let cell = this.getCell(position);
    this.boomCell(cell);
  }

  private boomCell(cell:&_Cell) {
    let cType = cell.type;
    let cSpecial = cell.special;
    cell.type = 0;
    cell.special = '';

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
}