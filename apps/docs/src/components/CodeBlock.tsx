import { useState, useEffect, useCallback } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export function CodeBlock({ code, lang = "tsx", filename }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang,
      theme: "github-dark",
      defaultColor: false,
    })
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-[var(--docs-border)] bg-[#1e1e2e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-mono text-gray-400">
          {filename ?? lang}
        </span>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-sm"
        dangerouslySetInnerHTML={
          html
            ? { __html: html }
            : { __html: `<pre style="color:#cdd6f4">${escapeHtml(code)}</pre>` }
        }
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
