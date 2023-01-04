import { Matrix } from 'ts-matrix';
import { fetcher } from './axios';
import { Method } from 'axios';

type Location = {
  row: number;
  column: number;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export interface Space {
  planets: Matrix | undefined;
  goal: Matrix | undefined;
  init(url: string): Promise<boolean>;
  draw(url: string): Promise<boolean>;
}

export class Phase1Space implements Space {
  planets: Matrix | undefined;
  goal: Matrix | undefined;

  async init(url: string): Promise<boolean> {
    try {
      if (url == '') return false;
      const response = await fetcher({
        method: 'GET',
        url,
      });
      if (response.success) {
        const data = response.data;
        if (data.map && data.map.content) {
          const [rows, cols] = this.getRowsAndCols(data.map.content);
          this.planets = new Matrix(rows, cols, data.map.content);
          return true;
        }
      }
      return false;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  async draw(url: string): Promise<boolean> {
    try {
      if (url == '' || !this.planets) return false;
      const response = await fetcher({
        method: 'GET',
        url,
      });
      if (response.success) {
        const data = response.data;
        if (data && data.goal) {
          const [rows, cols] = this.getRowsAndCols(data.goal);
          this.goal = new Matrix(rows, cols, data.goal);
          if (
            this.planets.rows != this.goal.rows ||
            this.planets.columns != this.goal.columns
          )
            return false;
          const locations: Location[] = [];
          for (let row = 0; row < this.planets.rows; row++) {
            for (let column = 0; column < this.planets.columns; column++) {
              if (
                !this.compare(
                  this.planets?.at(row, column),
                  String(this.goal.at(row, column)),
                )
              ) {
                locations.push({ row, column });
              }
            }
          }
          if (locations.length > 0) {
            await Promise.all(
              locations.map(async (location: Location) => {
                await this.sendRequest('POST', 'polyanets', {
                  row: location.row,
                  column: location.column,
                });
              }),
            );
          }
          return true;
        }
      }
      return false;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  private getRowsAndCols(data: any): [number, number] {
    const rows = data.length ?? 0;
    let cols = 0;
    if (rows > 0) {
      cols = data[0].length ?? 0;
    }
    return [rows, cols];
  }

  private compare(basic: any, target: string) {
    if (!basic) {
      return 'SPACE' == target;
    }
    switch (basic.type) {
      case 0:
        return 'POLYANET' == target;
      //todo case for next phase
    }
    return false;
  }

  private async sendRequest(method: Method, url: string, data?: any) {
    const retryCount = 3;
    let retry = 0;
    while (retry < retryCount) {
      retry++;
      const response = await fetcher({ method, url, data });
      if (response.success) {
        break;
      } else {
        await sleep(2000);
      }
    }
    throw new Error('Failed to API call!');
  }
}
