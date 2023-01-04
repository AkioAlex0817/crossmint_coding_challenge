import { Phase1Space } from '../index';
import { CANDIDATE_ID } from '../axios';

jest.useRealTimers();

describe('Space class', () => {
  const polyanet = new Phase1Space();
  it('Phase - 1', async () => {
    const init = await polyanet.init(`map/${CANDIDATE_ID}/`);
    expect(init).toBeTruthy();
    if (init) {
      const draw = await polyanet.draw(`map/${CANDIDATE_ID}/goal`);
      expect(draw).toBeTruthy();
    }
  }, 120000); //timeout 120s
});
