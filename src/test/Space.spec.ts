import { Phase1Space } from '../index';
import { CANDIDATE_ID } from '../axios';

jest.useRealTimers();

describe('Space class', () => {
  const polynets = new Phase1Space();
  it('Phase1 - init', async () => {
    const init = await polynets.init(`map/${CANDIDATE_ID}/`);
    expect(init).toBeTruthy();
    if (init) {
      const draw = await polynets.draw(`map/${CANDIDATE_ID}/goal`);
      expect(draw).toBeTruthy();
    }
  }, 60000);
});
