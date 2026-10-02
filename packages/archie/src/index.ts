// @opinion/archie: story copy (ArchieML) → typed blocks.
//
// Chunk 00 ships the shape only, so both apps can depend on it from day one. Chunk 03 replaces the body of
// parseStory() with a real ArchieML parser and validation.
//
// The package exports its TypeScript source directly (see package.json "exports"). There's no build step: each app's
// Vite compiles it along with the app's own code. That's the "internal package" pattern for a private monorepo.

/** One block of the story: a paragraph, a graphic embed, a quote… The full union arrives in chunk 03. */
export type Block = { type: 'text'; value: string };

export type Story = {
  meta: Record<string, string>;
  blocks: Block[];
};

/** Parse a story's ArchieML source. Stub: returns an empty story until chunk 03. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseStory(source: string): Story {
  return { meta: {}, blocks: [] };
}
