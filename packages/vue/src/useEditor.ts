import { inject } from "vue";
import type { InjectionKey } from "vue";
import type { SeditorInstance } from "seditor-core";

export const SEDITOR_KEY: InjectionKey<SeditorInstance> = Symbol("seditor");

export function useEditor(): SeditorInstance {
  const instance = inject(SEDITOR_KEY);
  if (!instance) {
    throw new Error("useEditor must be used within an <Editor>.");
  }
  return instance;
}
