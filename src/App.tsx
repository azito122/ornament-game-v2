import './App.scss'
import { Config, configValue } from './Util'
import Board from './Board'
import Menu from './Menu'
import React from 'react'

interface AppProps {
  seasonGap: number,
}

interface AppState {
  score        : number,
  level        : number,
  over         : boolean,
  won          : boolean,
  season       : number,
  tilNextSeason: number,
  config       : Config,
}

export default class App extends React.Component<AppProps, AppState> {
  constructor (props: any) {
    super(props)

    this.state = {
      level        : 1,
      score        : 0,
      over         : false,
      won          : false,
      season       : 0,
      tilNextSeason: props.seasonGap,
      config       : new Config({
        'pause-seasons': false,
      }),
    }
  }

  componentDidMount () {
    setTimeout(() => {
      this.seasonTick();
    }, 1000)
  }

  componentWillUnmount () {
  }

  render () {
    return (
      <div className="app">
        <div className="game-header">
          <h1 className="title">
            Nature's Ornaments
          </h1>
          <Menu
            getConfig={(id:string, defaultv:string) => {this.getConfig(id, defaultv)}}
            setConfig={(id:string, value:string) => {this.setConfig(id, value)}}
            config={this.state.config}
          />
        </div>

        <div className="game-intro">
          {/* <button className="restart-button" onClick={this.restart}>New Board</button> */}
        </div>

        <div className={`game-container season-${this.getSeasonString(this.state.season).toLowerCase()}`}>
          {
            (this.state.won || this.state.over) &&
              <div className={`game-message game-${(this.state.won && 'won') || (this.state.over && 'over')}`}>
                <p>
                  {this.state.won ? 'You win!' : 'Board over!'}
                </p>

                <div className='actions'>
                  {/* <button className='retry-button' onClick={this.restart}>Try again</button> */}
                </div>
              </div>
          }
          <Board
            width={11}
            height={7}
            addScore={(s:number) => {this.addScore(s)}}
            level={this.state.level}
          />
          <div className="sidebar">
            <div className="score-container">
              {this.state.score}
            </div>
            <div className="level-container">
              {this.state.level}
            </div>
            <div>
              Season: {this.getSeasonString(this.state.season)}
              <div className="loading-bar"><span
                style={{width:(this.state.tilNextSeason/this.props.seasonGap)*100}}
              ></span></div>
            </div>
          </div>
        </div>

        <p className="game-explanation">
        </p>
      </div>
    )
  }

  private addScore (boomed: number) {
    const levelThresholds = [
      0,
      1000,
      2100,
      3300,
      4600,
      7000,
      15000,
      25000,
      100000000000,
    ]

    let add = boomed;
    if (boomed <= 4) {
      add = 10 * boomed;
    } else if (boomed <= 7) {
      add = 15 * boomed;
    } else if (boomed <= 10) {
      add = 20 * boomed;
    } else {
      add = 25 * boomed;
    }

    let newScore = add + this.state.score;

    this.setState((state) => {
      let level = state.level;

      levelThresholds.reduce((a:number, b:number, i:number):number => {
        if (newScore >= a && newScore <= b) {
          level = i;
        }

        return b;
      })

      return {
        score: newScore,
        level: level,
      }
    })
  }

  private getSeasonString(seasonId:number):string {
    switch (seasonId) {
      case 0:
        return 'Spring';
      case 1:
        return 'Summer';
      case 2:
        return 'Fall';
      case 3:
        return 'Winter';
      default:
        return 'Spring';
    }
  }

  private seasonTick() {
    this.setState((state) => {
      if (this.getConfig('pause-seasons', true)) {
        return;
      }
      let result = {};
      if (state.tilNextSeason <= 0) {
        result = {
          season: state.season >= 3 ? 0 : state.season + 1,
          tilNextSeason: this.props.seasonGap,
        }
      } else {
        result = {
          tilNextSeason: state.tilNextSeason - 1000,
        }
      }
      setTimeout(this.seasonTick.bind(this), 1000);
      return result;
    })
  }

  private getConfig(id:string, defaultv?:configValue) {
    return this.state.config.get(id, defaultv);
  }

  private setConfig(id:string, value:string) {
    console.log('setConfig', id, value);
    this.setState((state) => {
      return {
        config: state.config.set(id, value),
      }
    }, () => {
      this.handleConfigUpdate(id, value);
    })
  }

  private handleConfigUpdate(id:string, value:configValue) {
    console.log('handleConfigUpdate', id, value);
    switch(id) {
      case 'pause-seasons':
        if (!value) {
          this.seasonTick();
        }
        break;
      default:
        break;
    }
  }
}
