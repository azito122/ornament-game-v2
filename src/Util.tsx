export type configValue = string|boolean;
export type configValues = { [key: string]: configValue }

export class Config {
  private values:configValues = {};

  constructor(initialValues:configValues) {
    this.values = deepCopy(initialValues);
  }

  public get(id:string, defaultv:configValue = false) {
    let val = this.values[id];
    if (typeof val === 'undefined' || val === null) {
      return defaultv;
    } else {
      return val;
    }
  }

  public getString(id:string, defaultv:string = ''):string {
    let val = this.get(id);
    return String(val);
  }

  public set(id:string, value:configValue) {
    console.log('set', id, value);
    this.values[id] = value;
    return this;
  }
}

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