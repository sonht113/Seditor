import { createCommand } from "lexical";
import type { AlignType } from "./types";

export const SE_OPEN_IMAGE_COMMAND = createCommand<undefined>();
export const SE_SET_ALIGN_COMMAND = createCommand<AlignType>();
