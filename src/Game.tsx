class Game {
  // static Steps : string[] = ['up', 'down', 'left', 'right']

  cells: number[][]

  score: number

  over: boolean

  won: boolean

  height: number

  width: number

  private callbacks: any

  constructor () {
    this.cells = []
    this.score = 0
    this.over  = false
    this.won   = false
    this.callbacks = {}
    this.height = 5;
    this.width = 5;
  }

  start () : void {
    this.init()
  }

  restart () : void {
    this.init()
  }

  dispatch (step: string) : boolean {
    // switch (step) {
    //   case "up":
    //     this.up()
    //     return true
    //   case "down":
    //     this.down()
    //     return true
    //   case "left":
    //     this.left()
    //     return true
    //   case "right":
    //     this.right()
    //     return true
    //   default:
        return false
    // }
  }

  respond (step: string) : boolean {
    if (!this.over && !this.won && this.dispatch(step)) {
      // this.generateBlock()
      // this.checkOver()
      return true
    }

    return false
  }

  addCallback (event: string, callback: any) : void {
    this.callbacks[event] = callback
  }

  removeCallback (event: string) : void {
    delete this.callbacks[event]
  }

  private buildCells() {
    this.cells = Array(this.height).fill(Array(this.width).fill(0))
  }

  private fillCells(n?:number) {
    this.cells = this.cells.map(
      (v:number[]) => {
        return v.map(
          (v:number) => {
            if (v === 0) {
              if (n !== undefined) {
                return n;
              } else {
                return this.getRandomInt(1,5);
              }
            }
            return 0;
          }
        )
      }
    )
  }

  private init () : void {
    this.buildCells();
    this.fillCells();
    console.log(this.cells);
    this.score = 0
    this.won = false
    this.over = false
  }

  // private checkOver () : boolean {
  //   if (this.hasEmptyCell()) return false

    // for (let i = 0; i < Game.Steps.length; i++) {
    //   const cells = this.cells.slice()

    //   this.dispatch(Game.Steps[i])

    //   if (this.hasEmptyCell()) {
    //     this.cells = cells
    //     return false
    //   }

    //   this.cells = cells
    // }

    // this.over = true
    // this.callbacks['over'] && this.callbacks['over']()
  //   return true
  // }

  private addScore (score: number) {
    this.score = this.score + score

    this.callbacks['addScore'] && this.callbacks['addScore'](score)
  }

  // private hasEmptyCell (): boolean {
    // return false
    // return this.cells.filter(cell => cell === 0).length !== 0
  // }

  private getRandomInt(min:number, max:number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

export default new Game()