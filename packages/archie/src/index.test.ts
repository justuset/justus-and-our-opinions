import { describe, expect, it } from 'vitest';
import { parseStory } from './index';

describe('parseStory (chunk 00 stub)', () => {
  it('returns the Story shape both apps rely on', () => {
    expect(parseStory('headline: The Second Draft')).toEqual({ meta: {}, blocks: [] });
  });
});
