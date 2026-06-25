/// <reference lib="webworker" />
/**
 * Web Worker: loads a small sentence-embedding model (all-MiniLM-L6-v2) via
 * transformers.js and returns mean-pooled, normalized vectors. Kept off the
 * main thread so embedding a long page never blocks the UI.
 */
import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';

// Models are fetched from the Hugging Face CDN and cached by the browser.
env.allowLocalModels = false;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

interface EmbedRequest {
  id: number;
  texts: string[];
}

self.onmessage = async (e: MessageEvent<EmbedRequest>) => {
  const { id, texts } = e.data;
  try {
    const extractor = await getExtractor();
    const output = await extractor(texts, { pooling: 'mean', normalize: true });
    self.postMessage({ id, vectors: output.tolist() as number[][] });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
