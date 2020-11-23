import React from 'react'
import { getRandomInt, getRandomItem, deepCopy, onBoard } from './Util'
import { Cell, _Cell } from './Cell'
import './Board.scss'

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
  private hoveredCells?:[number,number];
  private targetedCells?:[number,number][];

  constructor (props:any) {
    super(props)

    let emptyCell = new _Cell(0);
    let cells = Array(this.props.height).fill(Array(this.props.width).fill(emptyCell));
    this.buffer = JSON.parse(JSON.stringify(cells));
    this.hoveredCells = undefined;

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
                      position={[cellIndex,groupIndex]}
                      key={groupIndex * 4 + cellIndex}
                      type={cell.type}
                      handleClick={(p:[number,number])=>{this.handleClick(p)}}
                      handleHover={(p:[number,number])=>{this.handleHover(p)}}
                      handleUnhover={(p:[number,number])=>{this.handleUnhover(p)}}
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

  private handleUnhover (position:[number,number]) {
    this.hoveredCells = undefined;
    this.clearTargeted();
  }

  private clearTargeted () {
    if (this.targetedCells && this.targetedCells.length >= 3) {
      this.untargetByPositions(this.targetedCells);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }

    this.targetedCells = undefined;
  }

  private handleHover (position:[number,number]) {
    this.hoveredCells = position;

    let found = this.findGroupPositions(position);

    if (found[0].length >= 3) {
      this.targetedCells = found[1];
      this.targetByPositions(found[1]);
      if (!this.state.locked) {
        this.flushBuffer();
      }
    }
  }

  private handleClick (position:[number,number]) {
    if (this.state.locked) {
      return;
    } else if (this.targetedCells) {
      let targetedCells = deepCopy(this.targetedCells);
      this.targetedCells = undefined;

      if (targetedCells.length >= 3) {
        this.props.addScore(targetedCells.length);
        this.lock(() => {
          this.boomByPositions(targetedCells);
        });
      } else {
        this.resetBuffer();
      }
    }
  }

  private fillCells(n?:number) {
    let ns:number[];

    if (typeof n === 'number') {
      let pickn = n > 3 ? n - 1 : 2;
      ns = Array(pickn).fill(null);
      ns = ns.map((v:number, i:number) => {
        return this.getRandomTileType();
      });
    }

    this.buffer.forEach( (row:_Cell[]) => {
      row.forEach( (c:_Cell, i:number) => {
        if (c.type === 0) {
          row[i] = this.fillCell(ns);
        }
      })
    });
    this.flushBuffer();

    this.unlock();

    if (typeof this.hoveredCells !== 'undefined') {
      // this.handleUnhover(this.hoveredCells);
      this.clearTargeted();
      this.handleHover(this.hoveredCells);
    }
  }

  private fillCell(ns?:number[]):_Cell {
    let type = this.getRandomTileType();
    if (typeof ns !== 'undefined') {
      console.log(ns);
      type = getRandomItem(ns);
    }

    let special = '';
    if(getRandomInt(1,100) < 5) {
      special = getRandomItem(['borg', 'gold']);
    }

    return new _Cell(type, special);
  }

  private targetByPositions(targeted:[number,number][]) {
    targeted.forEach((p:[number,number]) => {
      let cell = this.getCell(p);
      cell.status = 'targeted';
    });
  }

  private untargetByPositions(targeted:[number,number][]) {
    targeted.forEach((p:[number,number]) => {
      let cell = this.getCell(p);
      cell.status = '';
    });
  }


  private findGroupPositions(start:[number,number]):[number,number][][] {
    let startCell = this.getCell(start);
    let findType = startCell.type;
    let searchSpace = deepCopy(this.buffer)

    return this.findMatchingAdjacent(searchSpace,start,findType,[],[])
  }

  private findTypePositions(type:number):[number,number][] {
    let found:[number,number][] = [];
    this.buffer.forEach((row:_Cell[], y:number) => {
      row.forEach((cell:_Cell, x:number) => {
        if (cell.type === type) {
          found.push([x,y]);
        }
      })
    })
    return found;
  }

  private findMatchingAdjacent(
    searchSpace:&_Cell[][],
    start:[number,number], findType:number,
    foundAdjacent:[number,number][],
    found:[number,number][]):[number,number][][]
  {
    if (searchSpace[start[1]][start[0]].type === 0) {
      return [foundAdjacent,found];
    }

    foundAdjacent.push(start);
    found.push(start);
    if (searchSpace[start[1]][start[0]].special === 'borg') {
      found = found.concat(this.findTypePositions(searchSpace[start[1]][start[0]].type));
    }
    searchSpace[start[1]][start[0]].type = 0;

    let adjacentPositions = this.getAdjacentPositions(start);
    adjacentPositions.forEach((adjPosition:[number,number]) => {
      let adjCell = this.getCell(adjPosition);
      if (adjCell.type === findType) {
        let recurse = this.findMatchingAdjacent(searchSpace,adjPosition,findType,foundAdjacent,found);
        // foundAdjacent = foundAdjacent.concat(recurse[0]);
        found = recurse[1]
      }
    })
    return [foundAdjacent,found];
  }

  private getAdjacentPositions(p:[number,number]) {
    let x = p[0];
    let y = p[1];
    let positions:[number,number][] = [
      [x+1,y],
      [x-1,y],
      [x,y+1],
      [x,y-1]
    ]

    return positions.filter((position:[number,number]) => {
      return onBoard(position);
    })
  }

  private boomByPositions(positions:[number,number][]) {
    positions.forEach((position:[number,number]) => {
      let cell = this.getCell(position);
      if (cell.special === 'gold') {
        this.props.addScore(15)
      }
      cell.status = 'booming';
    });

    this.flushBuffer();

    setTimeout(() => {
      positions.forEach((position:[number,number]) => {
        let cell = this.getCell(position);
        let cType = cell.type;
        let cSpecial = cell.special;

        cell.type = 0;
        cell.special = '';
        cell.status = 'booming';
      });
      this.flushBuffer();

      let bfc = this.fillCells.bind(this);
      bfc(positions.length)
    }, 500)
  }

  private boomByType(type:number) {
    this.boomByPositions(this.findTypePositions(type));
    this.flushBuffer();
  }

  private getCell(p:[number,number]):_Cell {
    return this.buffer[p[1]][p[0]];
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