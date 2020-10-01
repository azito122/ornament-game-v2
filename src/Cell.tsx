import React from 'react'
// import { Position } from './Util'
import './Cell.css'

interface CellProps {
  position: [number,number],
  type: number,
  handleClick: Function,
  handleHover: Function,
  handleUnhover: Function,
  special: string,
  status: string,
}

interface CellState {}

export class Cell extends React.Component<CellProps, CellState> {
  render () {
    return (
      <div
        onMouseOver={() => {this.props.handleHover(this.props.position)}}
        onMouseLeave={() => {this.props.handleUnhover(this.props.position)}}
        onClick={() => {this.props.handleClick(this.props.position,this.props.type)}}
        className={`cell cell-type-${this.props.type} cell-special-${this.props.special} cell-status-${this.props.status}`}>
        <span></span>
      </div>
    )
  }
}

export class _Cell {
  public type:number;
  public special:string;
  public status:string;

  constructor (type:number, special:string = '', status:string = 'filling') {
    this.type = type;
    this.special = special;
    this.status = status;
  }
}