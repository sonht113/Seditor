import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { Editor } from "./index";
import ToolbarWrapper from "./Toolbar.test.svelte";

describe("Editor", () => {
  it("renders without crashing", () => {
    const { container } = render(Editor, {
      props: { config: { html: "<p>Hello</p>" } },
    });
    expect(container.querySelector(".se-editor")).not.toBeNull();
  });
});

describe("Toolbar", () => {
  it("excludes items by id", () => {
    const { container } = render(ToolbarWrapper, {
      props: { exclude: ["underline", "redo"] },
    });
    expect(container.querySelector('[aria-label="Underline"]')).toBeNull();
    expect(container.querySelector('[aria-label="Redo"]')).toBeNull();
    expect(container.querySelector('[aria-label="Bold"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Undo"]')).not.toBeNull();
  });
});
