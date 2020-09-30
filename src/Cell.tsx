import React from 'react'
import { Position } from './Util'
import './Cell.css'

interface CellProps {
  position: Position,
  value: number,
  boom: Function,
}

interface CellState {}

export class Cell extends React.Component<CellProps, CellState> {
  render () {
    return (
      <div onClick={() => {this.props.boom(this.props.position,this.props.value)}} className={`cell cell-${this.props.value}`}>
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