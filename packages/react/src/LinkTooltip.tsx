import { useCallback, useEffect, useRef, useState } from "react";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { SE_OPEN_LINK_COMMAND, getLinkUrl } from "seditor-core";
import { useEditor } from "./Editor";

interface TooltipState {
  url: string;
  top: number;
  left: number;
}

const CLOSE_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const ACCEPT_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 5"/></svg>';

export function LinkTooltip() {
  const instance = useEditor();
  const [state, setState] = useState<TooltipState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unregister = instance.editor.registerCommand(
      SE_OPEN_LINK_COMMAND,
      () => {
        const domSel = window.getSelection();
        let top = 0;
        let left = 0;
        if (domSel && domSel.rangeCount > 0) {
          const rect = domSel.getRangeAt(0).getBoundingClientRect();
          top = rect.bottom + 6;
          left = rect.left + rect.width / 2;
        }
        const url = getLinkUrl(instance.editor);
        setState({ url, top, left });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
    return unregister;
  }, [instance]);

  useEffect(() => {
    if (state) {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [state]);

  const close = useCallback(() => setState(null), []);

  const accept = useCallback(() => {
    const url = inputRef.current?.value ?? "";
    instance.commands.setLink(url);
    setState(null);
  }, [instance]);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Enter") {
        e.preventDefault();
        accept();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close, accept]);

  useEffect(() => {
    if (!state) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".se-link-tooltip")) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [state, close]);

  if (!state) return null;

  return (
    <div
      className="se-link-tooltip"
      style={{ top: state.top, left: state.left }}
      role="dialog"
    >
      <input
        ref={inputRef}
        type="url"
        defaultValue={state.url}
        placeholder="https://"
        className="se-link-tooltip-input"
      />
      <button
        type="button"
        className="se-link-tooltip-btn se-link-tooltip-close"
        title="Cancel"
        aria-label="Cancel"
        onClick={close}
        dangerouslySetInnerHTML={{ __html: CLOSE_ICON }}
      />
      <button
        type="button"
        className="se-link-tooltip-btn se-link-tooltip-accept"
        title="Apply"
        aria-label="Apply link"
        onClick={accept}
        dangerouslySetInnerHTML={{ __html: ACCEPT_ICON }}
      />
    </div>
  );
}
