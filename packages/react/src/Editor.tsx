import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { $getRoot } from "lexical";
import { createSeditor } from "seditor-core";
import type { SeditorConfig, SeditorInstance } from "seditor-core";
import { LinkTooltip } from "./LinkTooltip";

const SeditorContext = createContext<SeditorInstance | null>(null);

export interface EditorProps {
  config?: SeditorConfig;
  className?: string;
  onReady?: (instance: SeditorInstance) => void;
  children?: ReactNode;
}

export function Editor({ config, className, onReady, children }: EditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [isEmpty, setIsEmpty] = useState(true);

  // The editor instance is created once from the initial `config`.
  // Changing `config` on subsequent renders has no effect — use the
  // imperative API (instance.setHTML, instance.commands.*) to update
  // content after mount.
  const [instance] = useState<SeditorInstance>(() => createSeditor(config));

  useEffect(() => {
    const editor = instance.editor;
    if (!rootRef.current) return;
    editor.setRootElement(rootRef.current);
    onReadyRef.current?.(instance);

    const unregisterUpdate = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          setIsEmpty($getRoot().getTextContent() === "");
        });
      },
    );

    return () => {
      unregisterUpdate();
      editor.setRootElement(null);
      instance.destroy();
    };
  }, [instance]);

  const placeholder = instance.placeholder;

  return (
    <SeditorContext.Provider value={instance}>
      <div className={className ?? "se-editor"}>
        {children}
        <div className="se-content">
          {isEmpty && placeholder && (
            <div className="se-placeholder" aria-hidden="true">
              {placeholder}
            </div>
          )}
          <div
            ref={rootRef}
            className="se-root"
            contentEditable={instance.editor.isEditable()}
            suppressContentEditableWarning
          />
        </div>
        <LinkTooltip />
      </div>
    </SeditorContext.Provider>
  );
}

export function useEditor(): SeditorInstance {
  const instance = useContext(SeditorContext);
  if (instance === null) {
    throw new Error("useEditor must be used within an <Editor>.");
  }
  return instance;
}
