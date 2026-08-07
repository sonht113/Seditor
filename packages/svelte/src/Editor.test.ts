import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { Editor } from "./index";

describe("Editor", () => {
  it("renders without crashing", () => {
    const { container } = render(Editor, {
      props: { config: { html: "<p>Hello</p>" } },
    });
    expect(container.querySelector(".se-editor")).not.toBeNull();
  });
});
