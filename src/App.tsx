import React from 'react'
import Board from './Board'
import Menu from './Menu'
import './App.css'

interface AppProps {
}

interface AppState {
  score: number,
  level: number,
  addition: number,
  over: boolean,
  won: boolean,
}

export default class App extends React.Component<AppProps, AppState> {
  constructor (props: any) {
    super(props)

    this.state = {
      level: 1,
      score: 0,
      over: false,
      won: false,
      addition: 0
    }
  }

  componentDidMount () {  }

  componentWillUnmount () {
  }

  render () {
    return (
      <div className="app">
        <div className="game-header">
          <h1 className="title">
            Christmas Bonanza
            {this.state.level}
          </h1>
          <div className="score-container">
            {this.state.score}

            {
              this.state.addition !== 0 && <div className="score-addition">
                +{this.state.addition}
              </div>
            }
          </div>
          <Menu />
        </div>

        <div className="game-intro">
          {/* <button className="restart-button" onClick={this.restart}>New Board</button> */}
        </div>

        <div className="game-container">
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
            width={10}
            height={10}
            addScore={(s:number) => {this.addScore(s)}}
            level={this.state.level}
          />
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
      4600
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
}
