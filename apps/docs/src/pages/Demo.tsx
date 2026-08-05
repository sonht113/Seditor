import { DemoEditor } from "../components/DemoEditor";

export function Demo() {
  return (
    <div className="docs-prose">
      <h1>Live Demo</h1>
      <p>
        This demo uses the <strong>published npm packages</strong> (not the
        workspace source) to verify everything works end-to-end. Try the
        toolbar, drag-and-drop images, resize them, toggle dark mode, and
        inspect the HTML/JSON output.
      </p>

      <DemoEditor />

      <h2>What to try</h2>
      <ul>
        <li><strong>Formatting</strong> — select text and use bold, italic, underline, strikethrough.</li>
        <li><strong>Headings</strong> — toggle H1/H2 from the toolbar.</li>
        <li><strong>Lists</strong> — bullet and numbered lists.</li>
        <li><strong>Alignment</strong> — left/center/right align for text and images.</li>
        <li><strong>Colors</strong> — text color and background color pickers.</li>
        <li><strong>Font size</strong> — select a size from the dropdown.</li>
        <li><strong>Links</strong> — select text and click the link button.</li>
        <li><strong>Images</strong> — click the image button to upload, or drag-and-drop from desktop. Click an image to resize via corner handles.</li>
        <li><strong>Undo/Redo</strong> — history controls in the toolbar.</li>
        <li><strong>Dark mode</strong> — toggle in the top-right corner.</li>
        <li><strong>Output</strong> — click "Get HTML" or "Get JSON" to inspect the serialized content.</li>
      </ul>
    </div>
  );
}
