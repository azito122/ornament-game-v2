export class Position {
  public x:number;
  public y:number;

  constructor(x:number,y:number) {
    this.x = x;
    this.y = y;
  }

  public onBoard(): boolean {
    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x >= 10 ||
      this.y >= 10
    ) {
      return false;
    }
    return true;
  }
}

export function getRandomInt(min:number, max:number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomItem(arr:any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
