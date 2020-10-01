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
  private hovered?:Position;
  private targeted?:Position[];

  constructor (props:any) {
    super(props)

    let emptyCell = new _Cell(0);
    let cells = Array(this.props.height).fill(Array(this.props.width).fill(emptyCell));
    this.buffer = JSON.parse(JSON.stringify(cells));
    this.hovered = undefined;

    this.state = {
      cells: cells,
      locked: false,
    }
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

  componentDidMount () {
    this.fillCells();
  }

  private handleUnhover (position:Position) {
    this.hovered = undefined;
    if (this.targeted && this.targeted.length >= 3) {
      this.untargetByPositions(this.targeted);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }
    this.targeted = undefined;
  }

  private handleHover (position:Position) {
    this.hovered = position;
    this.targeted = this.findGroupPositions(position);
    if (this.targeted.length >= 3) {
      this.targetByPositions(this.targeted);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }
  }

  private handleClick (position:Position) {
    if (this.state.locked) {
      return;
    } else if (this.targeted) {
      let targeted = this.targeted;

      if (targeted.length >= 3) {
        this.props.addScore(targeted.length);
        this.lock(() => {
          this.boomByPositions(targeted);
        });
      } else {
        this.resetBuffer();
      }
    }
  }


  private fillCells(s?:number) {
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

    this.unlock();

    if (typeof this.hovered !== 'undefined') {
      this.handleHover(this.hovered);
    }
  }

  private fillCell(ns?:number[]):_Cell {
    let type = this.getRandomTileType();
    if (typeof ns !== 'undefined') {
      let type = getRandomItem(ns);
    }

    let special = '';
    if(getRandomInt(1,100) < 20) {
      special = getRandomItem(['borg', 'gold']);
    }

    return new _Cell(type, special);
  }

  private targetByPositions(targeted:Position[]) {
    targeted.forEach((p:Position) => {
      let cell = this.getCell(p);
      cell.status = 'targeted';
    });
  }

  private untargetByPositions(targeted:Position[]) {
    targeted.forEach((p:Position) => {
      let cell = this.getCell(p);
      cell.status = '';
    });
  }


  private findGroupPositions(start:Position):Position[] {
    let startCell = this.getCell(start);
    let findType = startCell.type;
    let searchSpace = deepCopy(this.buffer)

    return this.findMatchingAdjacent(searchSpace,start,findType,[])
  }

  private findTypePositions(type:number):Position[] {
    let found:Position[] = [];
    this.buffer.forEach((row:_Cell[], y:number) => {
      row.forEach((cell:_Cell, x:number) => {
        if (cell.type === type) {
          found.push(new Position(x,y));
        }
      })
    })
    return found;
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
    let additionalBoom:Position[] = [];
    positions.forEach((position:Position) => {
      let cell = this.getCell(position);
      if (cell.special === 'borg') {
        additionalBoom = additionalBoom.length > 0 ? additionalBoom : this.findTypePositions(cell.type);
      } else if (cell.special === 'gold') {
        this.props.addScore(15)
      }
    });
    positions = positions.concat(additionalBoom);

    positions.forEach((position:Position) => {
      let cell = this.getCell(position);
      cell.status = 'booming';
    })


    this.flushBuffer();

    setTimeout(() => {
      positions.forEach((position:Position) => {
        let cell = this.getCell(position);
        let cType = cell.type;
        let cSpecial = cell.special;

        cell.type = 0;
        cell.special = '';
        cell.status = 'booming';
      });
      this.flushBuffer();

      setTimeout(() => {
        let bfc = this.fillCells.bind(this);
        bfc(positions.length)
      }, 300)
    }, 1000)
  }

  private boomByType(type:number) {
    this.boomByPositions(this.findTypePositions(type));
    this.flushBuffer();
  }

  private getCell(p:Position):_Cell {
    return this.buffer[p.y][p.x];
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