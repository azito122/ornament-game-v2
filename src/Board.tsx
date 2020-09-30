import React from 'react'
import { getRandomInt, getRandomItem, Position } from './Util'
import { Cell, _Cell } from './Cell'
import './Board.css'

interface BoardProps {
  width: number,
  height: number,
  addScore: Function,
  level: number,
}

interface BoardState {
  cells: number[][],
}

export default class Board extends React.Component<BoardProps, BoardState> {
  private buffer:number[][];

  constructor (props:any) {
    super(props)

    let cells = Array(this.props.height).fill(Array(this.props.width).fill(0));
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
          this.state.cells.map((cells: number[], groupIndex: number) => {
            return (
              <div key={groupIndex} className="cells-row">
                {
                  cells.map((cell: number, cellIndex: number) => {
                    return <Cell
                      position={new Position(cellIndex,groupIndex)}
                      key={groupIndex * 4 + cellIndex}
                      value={cell}
                      boom={(p:Position,v:number)=>{this.boom(p,v)}}
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
    this.buffer = this.buffer.map(
      (v:number[]) => {
        return v.map(
          (v:number) => {
            if (v === 0) {
              return this.fillCell(ns);
            }
            return v;
          }
        )
      }
    );
    this.flushBuffer();
  }

  fillCell(ns?:number[]):number {
    if (typeof ns === 'undefined') {
      return this.getRandomTileType();
    } else {
      return getRandomItem(ns);
    }
  }

  boom (position:Position, baseValue:number) {
    React.Children.map(this.props.children, (child) => {console.log(child)});
    let boomCount = this._boom(position, baseValue) - 1;
    if (boomCount >= 3) {
      this.flushBuffer();
      this.props.addScore(boomCount);
      setTimeout(() => {
        let bfc = this.fillCells.bind(this);
        bfc(boomCount)
      }, 700)
    } else {
      this.resetBuffer();
    }
  }

  _boom (position:Position, baseValue:number) {
    let adjacentCells = this.getAdjacentCells(position);
    let boomCount = 0;

    adjacentCells.forEach((position) => {
      let value = this.getCellValue(position);

      if (value === 0) {
        return;
      }

      if (baseValue === value) {
        this.setCellValue(position, 0);
        boomCount += this._boom(position, baseValue);
      }
    })
    return boomCount + 1;
  }

  private setCellValue(p:Position, value:number) {
    this.buffer[p.y][p.x] = value;
  }

  private flushBuffer() {
    console.log(this.props.children);
    let buffer = JSON.parse(JSON.stringify(this.buffer));
    this.setState((state) => {
      return {cells: buffer}
    })
  }

  private resetBuffer() {
    this.buffer = JSON.parse(JSON.stringify(this.state.cells));
  }

  private getCellValue(p:Position) {
    return this.buffer[p.y][p.x];
  }

  private getAdjacentCells(p:Position) {
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

  private getRandomTileType():number {
    let maxmax = 5;
    let max = this.props.level + 4 >= maxmax ? maxmax : this.props.level + 4;
    let r = getRandomInt(1,this.props.level + 4);
    return r >= max ? max : r;
  }
}