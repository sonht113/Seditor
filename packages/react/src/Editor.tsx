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

export type EditorValueFormat = "html" | "json";

export interface EditorProps {
  config?: SeditorConfig;
  className?: string;
  onReady?: (instance: SeditorInstance) => void;
  children?: ReactNode;

  /**
   * Initial content (uncontrolled). Resolved in this order:
   * `value` > `defaultValue` > `config.html`. Format depends on `valueFormat`.
   */
  defaultValue?: string;

  /**
   * Controlled content. When this prop changes (and differs from the value
   * the user just typed), the editor content is replaced. Leave `undefined`
   * for uncontrolled usage.
   */
  value?: string;

  /**
   * Called whenever the editor content changes (after each Lexical update).
   * Receives the serialized value (per `valueFormat`) and the instance.
   */
  onChange?: (value: string, instance: SeditorInstance) => void;

  /**
   * Serialization format for `value` / `defaultValue` / `onChange`.
   * Defaults to `"html"`.
   */
  valueFormat?: EditorValueFormat;
}

function readValue(instance: SeditorInstance, format: EditorValueFormat): string {
  return format === "json"
    ? JSON.stringify(instance.getJSON())
    : instance.getHTML();
}

function writeValue(
  instance: SeditorInstance,
  value: string,
  format: EditorValueFormat,
): void {
  if (format === "json") {
    instance.setJSON(value);
  } else {
    instance.setHTML(value);
  }
}

export function Editor({
  config,
  className,
  onReady,
  children,
  defaultValue,
  value,
  onChange,
  valueFormat = "html",
}: EditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueFormatRef = useRef(valueFormat);
  valueFormatRef.current = valueFormat;
  const [isEmpty, setIsEmpty] = useState(true);

  // Loop protection for controlled `value`:
  //  - lastInternalValueRef: the last value produced by the user typing
  //    (so we can skip applying a `value` prop that merely echoes it back).
  //  - isSettingFromPropRef: set while we are applying a `value` prop, so the
  //    update listener can avoid echoing that update back via `onChange`.
  const lastInternalValueRef = useRef<string | undefined>(undefined);
  const isSettingFromPropRef = useRef(false);

  // Resolve initial content once at mount. Priority:
  // value > defaultValue > config.html.
  const initialContentRef = useRef<string | undefined>(undefined);
  if (initialContentRef.current === undefined && (value !== undefined || defaultValue !== undefined || config?.html !== undefined)) {
    initialContentRef.current =
      value ?? defaultValue ?? config?.html ?? "";
  }
  const initialContent = initialContentRef.current;

  // The editor instance is created once. `config` is treated as initial-only
  // for fields that Lexical cannot change after creation (plugins, theme,
  // namespace, shortcuts). Use the controlled props for reactive content.
  const [instance] = useState<SeditorInstance>(() => {
    const inst = createSeditor({
      ...config,
      // Content is set below via the unified valueFormat path so JSON works
      // for initial content too.
      html: undefined,
    });
    if (initialContent !== undefined && initialContent !== "") {
      writeValue(inst, initialContent, valueFormat);
    }
    return inst;
  });

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
        // Skip echoing back updates that we triggered ourselves while
        // applying a controlled `value` prop.
        if (isSettingFromPropRef.current) return;
        if (!onChangeRef.current) return;
        const next = readValue(instance, valueFormatRef.current);
        lastInternalValueRef.current = next;
        onChangeRef.current(next, instance);
      },
    );

    return () => {
      unregisterUpdate();
      editor.setRootElement(null);
      instance.destroy();
    };
  }, [instance]);

  // Sync controlled `value` prop -> editor content.
  useEffect(() => {
    if (value === undefined) return; // uncontrolled mode
    // Layer 1: the prop matches what the user just typed — nothing to do.
    if (value === lastInternalValueRef.current) return;
    // Layer 3: the prop matches the current editor content — nothing to do.
    const current = readValue(instance, valueFormatRef.current);
    if (value === current) return;
    // Layer 2: flag so the update listener does not echo this back.
    isSettingFromPropRef.current = true;
    writeValue(instance, value, valueFormatRef.current);
    // Flush pending update synchronously so subsequent reads are consistent.
    instance.editor.read(() => {});
    isSettingFromPropRef.current = false;
  }, [value, instance]);

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
