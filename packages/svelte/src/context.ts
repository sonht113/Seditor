import { getContext, setContext } from "svelte";
import type { SeditorInstance } from "seditor-core";

export const SEDITOR_KEY = Symbol("seditor");

export function setEditor(instance: SeditorInstance): void {
  setContext(SEDITOR_KEY, instance);
}

export function useEditor(): SeditorInstance {
  const instance = getContext<SeditorInstance | undefined>(SEDITOR_KEY);
  if (!instance) {
    throw new Error("useEditor must be used within an <Editor>.");
  }
  return instance;
}
