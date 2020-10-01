// export class Position {
//   public x:number;
//   public y:number;

//   constructor(x:number,y:number) {
//     this.x = x;
//     this.y = y;
//   }

//   public onBoard(): boolean {
//     if (
//       this.x < 0 ||
//       this.y < 0 ||
//       this.x >= 11 ||
//       this.y >= 7
//     ) {
//       return false;
//     }
//     return true;
//   }
// }

export function getRandomInt(min:number, max:number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomItem(arr:any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function deepCopy(thing:any) {
  return JSON.parse(JSON.stringify(thing));
}

export function onBoard(position:[number,number]): boolean {
  if (
    position[0] < 0 ||
    position[1] < 0 ||
    position[0] >= 11 ||
    position[1] >= 7
  ) {
    return false;
  }
  return true;
}