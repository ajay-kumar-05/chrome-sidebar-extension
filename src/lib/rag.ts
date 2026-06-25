/**
 * Local retrieval-augmented generation: embed a page's text on-device (via the
 * embeddings worker) and retrieve the chunks most relevant to a query. No data
 * leaves the browser; nothing is sent to the AI provider except the top chunks.
 */

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: number[][]) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./embeddings.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; vectors?: number[][]; error?: string }>) => {
      const { id, vectors, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error || !vectors) p.reject(new Error(error ?? 'embedding failed'));
      else p.resolve(vectors);
    };
    worker.onerror = () => {
      for (const p of pending.values()) p.reject(new Error('embedding worker crashed'));
      pending.clear();
    };
  }
  return worker;
}

/** Embed texts into normalized vectors using the worker. */
function embed(texts: string[]): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, texts });
  });
}

/** Split text into overlapping chunks (~`size` chars) on paragraph/word bounds. */
export function chunkText(text: string, size = 900, overlap = 150): string[] {
  const clean = text.replace(/\n{3,}/g, '\n\n').trim();
  if (clean.length <= size) return clean ? [clean] : [];
  const words = clean.split(/\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > size) {
      chunks.push(current.trim());
      // Carry the last ~`overlap` chars into the next chunk for continuity.
      current = current.slice(-overlap) + ' ' + word;
    } else {
      current += (current ? ' ' : '') + word;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Cosine similarity of two equal-length, normalized vectors (= dot product). */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

interface PageIndex {
  chunks: string[];
  vectors: number[][];
}

// One index per URL for the session (not persisted).
const indexCache = new Map<string, PageIndex>();

async function getPageIndex(url: string, text: string): Promise<PageIndex> {
  const cached = indexCache.get(url);
  if (cached) return cached;
  const chunks = chunkText(text);
  const vectors = chunks.length ? await embed(chunks) : [];
  const index: PageIndex = { chunks, vectors };
  indexCache.set(url, index);
  return index;
}

/** Return the `k` page chunks most relevant to `query`. */
export async function retrieve(url: string, text: string, query: string, k = 5): Promise<string[]> {
  const index = await getPageIndex(url, text);
  if (!index.chunks.length) return [];
  const [queryVec] = await embed([query]);
  return index.vectors
    .map((vec, i) => ({ i, score: cosineSimilarity(queryVec, vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => index.chunks[s.i]);
}
