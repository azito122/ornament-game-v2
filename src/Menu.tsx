import React from 'react'
import './Menu.scss'
import { Config } from './Util';

interface MenuProps {
  setConfig: Function,
  getConfig: Function,
  config: Config,
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
      <div
        className={`menu-backdrop ${this.state.visible ? 'visible' : 'invisible'}`}
        onClick={this.close.bind(this)}
      ></div>
      <div className="menu-icon" onClick={this.open.bind(this)}></div>
      <div className={`menu ${this.state.visible ? 'visible' : 'invisible'}`}>
        <div className="menu-items-wrapper">
          <label htmlFor="pause-seasons">Pause seasons</label>
          <input
            name="pause-seasons" id="pause-seasons"
            type="checkbox"
            value={this.props.config.getString('pause-seasons', 'false')}
            onChange={(event) => {this.props.setConfig('pause-seasons', event.target.checked)}}
          />
        </div>
      </div>
    </div>
    )
  }

  private toggle() {
    this.setState((state) => {
      return {visible: !state.visible}
    })
  }

  private open() {
    this.setState((state) => {
      return {visible: true}
    })
  }

  private close() {
    this.setState((state) => {
      return {visible: false}
    })
  }
}