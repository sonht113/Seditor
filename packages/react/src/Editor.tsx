import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
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
   * Debounce delay (ms) for `onChange`. Defaults to `0` (fire on every
   * update). When > 0, `onChange` is deferred until no edits happen for
   * the given duration. Pending calls are flushed on blur and unmount.
   */
  onChangeDebounceMs?: number;

  /**
   * Serialization format for `value` / `defaultValue` / `onChange`.
   * Defaults to `"html"`.
   */
  valueFormat?: EditorValueFormat;

  /**
   * Called when the editor root receives focus.
   */
  onFocus?: (event: FocusEvent, instance: SeditorInstance) => void;

  /**
   * Called when the editor root loses focus. Any pending debounced
   * `onChange` is flushed before `onBlur` fires.
   */
  onBlur?: (event: FocusEvent, instance: SeditorInstance) => void;

  /**
   * Called when the editor throws an internal error (Lexical onError).
   */
  onError?: (error: Error, instance: SeditorInstance) => void;

  /**
   * Controlled editable state. When this prop changes, `editor.setEditable`
   * is called and the `contentEditable` attribute is updated. Defaults to
   * `true`. Overrides `config.editable`.
   */
  editable?: boolean;

  /**
   * Called when the editable state changes (via prop or command).
   */
  onEditableChange?: (editable: boolean) => void;

  /**
   * Placeholder text shown when the editor is empty. Reactive — updating
   * this prop re-renders the placeholder. Overrides `config.placeholder`.
   */
  placeholder?: string;

  /**
   * id for the contentEditable root. Useful for `<label htmlFor>` association.
   */
  id?: string;

  /**
   * Form field name. When set, a hidden `<input type="hidden" name={name}>`
   * is rendered and kept in sync with the editor content (per `valueFormat`)
   * so traditional form submission works.
   */
  name?: string;

  /** Accessible label for the editor. */
  ariaLabel?: string;

  /** id of an element that labels the editor. */
  ariaLabelledBy?: string;

  /** id of an element that describes the editor. */
  ariaDescribedBy?: string;

  /** Controls spell-check on the contentEditable root. */
  spellCheck?: boolean;

  /** Focus the editor on mount. */
  autoFocus?: boolean;

  /** Tab order for the contentEditable root. */
  tabIndex?: number;
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

export const Editor = forwardRef<SeditorInstance, EditorProps>(
  function Editor(
    {
      config,
      className,
      onReady,
      children,
      defaultValue,
      value,
      onChange,
      onChangeDebounceMs = 0,
      valueFormat = "html",
      onFocus,
      onBlur,
      onError,
      editable,
      onEditableChange,
      placeholder: placeholderProp,
      id,
      name,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      spellCheck,
      autoFocus,
      tabIndex,
    },
    ref,
  ) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onChangeDebounceMsRef = useRef(onChangeDebounceMs);
  onChangeDebounceMsRef.current = onChangeDebounceMs;
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onEditableChangeRef = useRef(onEditableChange);
  onEditableChangeRef.current = onEditableChange;
  const valueFormatRef = useRef(valueFormat);
  valueFormatRef.current = valueFormat;
  const [isEmpty, setIsEmpty] = useState(true);
  const [editableState, setEditableState] = useState(
    editable ?? config?.editable ?? true,
  );
  const [placeholderState, setPlaceholderState] = useState(
    placeholderProp ?? config?.placeholder ?? null,
  );

  // Loop protection for controlled `value`:
  //  - lastInternalValueRef: the last value produced by the user typing
  //    (so we can skip applying a `value` prop that merely echoes it back).
  //  - isSettingFromPropRef: set while we are applying a `value` prop, so the
  //    update listener can avoid echoing that update back via `onChange`.
  const lastInternalValueRef = useRef<string | undefined>(undefined);
  const isSettingFromPropRef = useRef(false);

  // Debounce plumbing for `onChange`. Default (0) fires synchronously.
  // `flushOnChange` is referenced by the blur handler in the mount effect.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fireOnChange = (val: string) => {
    const ms = onChangeDebounceMsRef.current;
    if (ms > 0) {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        onChangeRef.current?.(val, instance);
      }, ms);
    } else {
      onChangeRef.current?.(val, instance);
    }
  };
  const flushOnChange = () => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      const last = lastInternalValueRef.current;
      if (last !== undefined) onChangeRef.current?.(last, instance);
    }
  };

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
      // Placeholder and editable are managed reactively below.
      placeholder: undefined,
      editable: undefined,
      // Pipe Lexical errors out through the `onError` prop.
      onError: (error) => {
        onErrorRef.current?.(error, inst);
      },
    });
    if (initialContent !== undefined && initialContent !== "") {
      writeValue(inst, initialContent, valueFormat);
    }
    return inst;
  });

  // Expose the SeditorInstance through the forwarded ref so consumers can
  // use it with form libraries (e.g. react-hook-form Controller).
  useImperativeHandle(ref, () => instance, [instance]);

  // Hidden input value for traditional form submission (synced with content).
  const [hiddenValue, setHiddenValue] = useState(
    initialContent ?? "",
  );

  useEffect(() => {
    const editor = instance.editor;
    const root = rootRef.current;
    if (!root) return;
    editor.setRootElement(root);
    onReadyRef.current?.(instance);

    const unregisterUpdate = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          setIsEmpty($getRoot().getTextContent() === "");
        });
        // Skip echoing back updates that we triggered ourselves while
        // applying a controlled `value` prop.
        if (isSettingFromPropRef.current) return;
        const next = readValue(instance, valueFormatRef.current);
        lastInternalValueRef.current = next;
        // Keep the hidden input in sync before any debounce so a form
        // submission always has the latest value.
        setHiddenValue(next);
        if (onChangeRef.current) {
          fireOnChange(next);
        }
      },
    );

    // Focus / blur listeners on the contenteditable root. Use capture phase
    // so we catch focus delegated from inner contentEditable children.
    const handleFocus = (event: FocusEvent) => {
      onFocusRef.current?.(event, instance);
    };
    const handleBlur = (event: FocusEvent) => {
      // Flush any pending debounced onChange before blur fires.
      flushOnChange();
      onBlurRef.current?.(event, instance);
    };
    root.addEventListener("focus", handleFocus, true);
    root.addEventListener("blur", handleBlur, true);

    if (autoFocus) {
      editor.focus();
    }

    return () => {
      unregisterUpdate();
      root.removeEventListener("focus", handleFocus, true);
      root.removeEventListener("blur", handleBlur, true);
      editor.setRootElement(null);
      instance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, autoFocus]);

  // Reactive `editable` prop -> editor.setEditable + local state.
  useEffect(() => {
    const next = editable ?? config?.editable ?? true;
    instance.editor.setEditable(next);
    setEditableState(next);
    onEditableChangeRef.current?.(next);
  }, [editable, instance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reactive `placeholder` prop -> local state.
  useEffect(() => {
    setPlaceholderState(placeholderProp ?? config?.placeholder ?? null);
  }, [placeholderProp, config?.placeholder]);

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
    // Keep hidden input in sync with controlled value too.
    setHiddenValue(value);
  }, [value, instance]);

  // Clear any pending debounce timer on unmount.
  useEffect(() => () => flushOnChange(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const placeholder = placeholderState;

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
            id={id}
            className="se-root"
            contentEditable={editableState}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            spellCheck={spellCheck}
            tabIndex={tabIndex}
          />
        </div>
        {name && (
          <input type="hidden" name={name} value={hiddenValue} />
        )}
        <LinkTooltip />
      </div>
    </SeditorContext.Provider>
  );
},
);

export function useEditor(): SeditorInstance {
  const instance = useContext(SeditorContext);
  if (instance === null) {
    throw new Error("useEditor must be used within an <Editor>.");
  }
  return instance;
}
