import { MyMegaverse } from '../index';
import { CANDIDATE_ID } from '../axios';

jest.useRealTimers();

describe('Space class', () => {
  const myMegaverse = new MyMegaverse();
  it('Phase - 1', async () => {
    const init = await myMegaverse.init(`map/${CANDIDATE_ID}/`);
    expect(init).toBeTruthy();
    if (init) {
      const draw = await myMegaverse.draw(`map/${CANDIDATE_ID}/goal`);
      expect(draw).toBeTruthy();
    }
  }, 120000); //timeout 120s
});
