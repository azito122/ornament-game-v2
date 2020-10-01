import React from 'react'
// import { Position } from './Util'
import './Menu.css'

interface MenuProps {
}

interface MenuState {
	visible: boolean,
}

export default class Menu extends React.Component<MenuProps, MenuState> {
  constructor(props:any) {
    super(props);

    this.state = {
      visible: false,
    }
  }

  render () {
    return (
    <div className="menu-wrapper">
      <div className="menu-icon" onClick={this.open.bind(this)}></div>
      <div className={`menu ${this.state.visible ? 'menu-visible' : ''}`}>
        <ul>
          <li>Test</li>
          <li>Test</li>
          <li>Test</li>
          <li>Test</li>
        </ul>
      </div>
    </div>
    )
  }

  open() {
    this.setState((state) => {
      return {visible: !state.visible}
    })
  }
}