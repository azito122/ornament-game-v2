import React from 'react'
import { Position } from './Util'
import './Cell.css'

interface CellProps {
  position: Position,
  type: number,
  boom: Function,
  special: string,
}

interface CellState {}

export class Cell extends React.Component<CellProps, CellState> {
  render () {
    return (
      <div onClick={() => {this.props.boom(this.props.position,this.props.type)}} className={`cell cell-${this.props.type} cell-${this.props.special}`}>
        <span></span>
      </div>
    )
  }
}

export class _Cell {
  public type:number;
  public special:string;

  constructor (type:number, special:string = '') {
    this.type = type;
    this.special = special;
  }
}