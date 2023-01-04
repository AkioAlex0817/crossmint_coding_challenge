import { Matrix } from 'ts-matrix';
import { fetcher } from './axios';
import { Method } from 'axios';
import { RequestScheduler } from './request';

// allow 10 requests per 5 seconds
export const REQUESTS_PER_INTERVAL = 10;
export const REQUESTS_INTERVAL_TIME = 5000;
export const DEBUG_MODE = false;

export const POLYANET = 0;
export const SOLOONS = 1;
export const COMETH = 2;

type Location = {
  url: string;
  row: number;
  column: number;
  color?: string;
  direction?: string;
};

export interface Megaverse {
  my_megaverse: Matrix | undefined;
  goal_megaverse: Matrix | undefined;
  init(url: string): Promise<boolean>;
  draw(url: string): Promise<boolean>;
}

export class MyMegaverse implements Megaverse {
  my_megaverse: Matrix | undefined;
  goal_megaverse: Matrix | undefined;
  cmsScheduler = new RequestScheduler({
    intervalTime: REQUESTS_INTERVAL_TIME,
    requestsPerInterval: REQUESTS_PER_INTERVAL,
    debugMode: DEBUG_MODE,
  });

  /**
   * Initialize my current status
   * @param url
   */
  async init(url: string): Promise<boolean> {
    try {
      if (url == '') return false;
      const response = await this.sendRequest('GET', url);
      if (response.success) {
        const data = response.data;
        if (data.map && data.map.content) {
          const [rows, cols] = this.getRowsAndCols(data.map.content);
          this.my_megaverse = new Matrix(rows, cols, data.map.content);
          return true;
        }
      }
      return false;
    } catch (e: any) {
      if (DEBUG_MODE) {
        console.error(e);
      }
      return false;
    }
  }

  /**
   * Draw the symbol with Goal url
   * @param url
   */
  async draw(url: string): Promise<boolean> {
    try {
      if (url == '' || this.my_megaverse == undefined) return false;
      const response = await this.sendRequest('GET', url);
      if (response.success) {
        const data = response.data;
        if (data && data.goal) {
          const [rows, cols] = this.getRowsAndCols(data.goal);
          this.goal_megaverse = new Matrix(rows, cols, data.goal);
          if (
            this.my_megaverse.rows != this.goal_megaverse.rows ||
            this.my_megaverse.columns != this.goal_megaverse.columns
          )
            return false;
          const locations: Location[] = [];
          for (let row = 0; row < this.my_megaverse.rows; row++) {
            for (let column = 0; column < this.my_megaverse.columns; column++) {
              const base: any = this.my_megaverse?.at(row, column);
              const goal = String(this.goal_megaverse.at(row, column));
              if (!this.compare(base, goal)) {
                const target: Location = { url: '', row, column };
                if (goal != '') {
                  switch (goal) {
                    case 'POLYANET':
                      target.url = 'polyanets';
                      break;
                    case 'PURPLE_SOLOON':
                      target.url = 'soloons';
                      target.color = 'purple';
                      break;
                    case 'BLUE_SOLOON':
                      target.url = 'soloons';
                      target.color = 'blue';
                      break;
                    case 'WHITE_SOLOON':
                      target.url = 'soloons';
                      target.color = 'white';
                      break;
                    case 'RED_SOLOON':
                      target.url = 'soloons';
                      target.color = 'red';
                      break;
                    case 'LEFT_COMETH':
                      target.url = 'comeths';
                      target.direction = 'left';
                      break;
                    case 'RIGHT_COMETH':
                      target.url = 'comeths';
                      target.direction = 'right';
                      break;
                    case 'DOWN_COMETH':
                      target.url = 'comeths';
                      target.direction = 'down';
                      break;
                    case 'UP_COMETH':
                      target.url = 'comeths';
                      target.direction = 'up';
                      break;
                  }
                  if (target.url != '') {
                    locations.push(target);
                  }
                }
              }
            }
          }
          if (locations.length > 0) {
            await (async () => {
              for (let i = 0; i < locations.length; i++) {
                const location = locations[i];
                const data: any = {
                  row: location.row,
                  column: location.column,
                };
                if (location.color) {
                  data.color = location.color;
                }
                if (location.direction) {
                  data.direction = location.direction;
                }
                await this.cmsScheduler.schedule(
                  this.sendRequest('POST', location.url, data),
                );
              }
            })();
          }
          return true;
        }
      }
      return false;
    } catch (e: any) {
      if (DEBUG_MODE) {
        console.error(e);
      }
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

  private compare(basic: any, target: string): boolean {
    if (!basic) {
      return 'SPACE' == target;
    }
    switch (basic.type) {
      case POLYANET: // POLYANET
        return 'POLYANET' == target;
      case SOLOONS: // SOLoons
        return `${basic.color.toUpperCase()}_SOLOON` == target;
      case COMETH: // comETH
        return `${basic.direction.toUpperCase()}_COMETH` == target;
    }
    return false;
  }

  private async sendRequest(method: Method, url: string, data?: any) {
    return await fetcher({ method, url, data });
  }
}
