import { get, list, put } from "@vercel/blob";

/**
 * Small key-value store for accounts, applications and resumes. Production uses the private Vercel
 * Blob store (no public URLs). Tests and local runs without a Blob token use an in-memory store.
 * Keys are paths such as "accounts/by-email/<hash>.json".
 */
export interface Store {
  getJson<T>(key: string): Promise<T | null>;
  putJson(key: string, value: unknown): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
  getBytes(key: string): Promise<Uint8Array | null>;
  putBytes(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
}

export function memoryStore(): Store {
  const data = new Map<string, Uint8Array>();
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  return {
    async getJson<T>(key: string) {
      const v = data.get(key);
      return v ? (JSON.parse(dec.decode(v)) as T) : null;
    },
    async putJson(key, value) {
      data.set(key, enc.encode(JSON.stringify(value)));
    },
    async listKeys(prefix) {
      return [...data.keys()].filter((k) => k.startsWith(prefix)).sort();
    },
    async getBytes(key) {
      return data.get(key) ?? null;
    },
    async putBytes(key, bytes) {
      data.set(key, bytes);
    },
  };
}

async function readBlob(key: string): Promise<Uint8Array | null> {
  const res = await get(key, { access: "private", useCache: false }).catch(() => null);
  if (!res || !res.stream) return null;
  return new Uint8Array(await new Response(res.stream).arrayBuffer());
}

export function blobStore(): Store {
  const opts = { access: "private" as const, addRandomSuffix: false, allowOverwrite: true };
  return {
    async getJson<T>(key: string) {
      const bytes = await readBlob(key);
      return bytes ? (JSON.parse(new TextDecoder().decode(bytes)) as T) : null;
    },
    async putJson(key, value) {
      await put(key, JSON.stringify(value), { ...opts, contentType: "application/json", cacheControlMaxAge: 60 });
    },
    async listKeys(prefix) {
      const keys: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix, cursor, limit: 1000 });
        keys.push(...page.blobs.map((b) => b.pathname));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return keys.sort();
    },
    getBytes: readBlob,
    async putBytes(key, bytes, contentType) {
      await put(key, Buffer.from(bytes), { ...opts, contentType });
    },
  };
}

let current: Store | null = null;

/** Memory store when PATHWAY_STORE=memory or no Blob token is set; the Blob store otherwise. */
export function getStore(): Store {
  if (!current) {
    const memory = process.env.PATHWAY_STORE === "memory" || !process.env.BLOB_READ_WRITE_TOKEN;
    current = memory ? memoryStore() : blobStore();
  }
  return current;
}

/** Tests only: replace the store (pass null to reset). */
export function setStore(store: Store | null): void {
  current = store;
}
