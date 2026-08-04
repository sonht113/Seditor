export {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
} from "./textFormat";
export { toggleHeading, setParagraph, setAlign } from "./block";
export {
  toggleBulletList,
  toggleNumberedList,
  toggleList,
  clearList,
} from "./list";
export { setLink, unsetLink } from "./link";
export { undo, redo } from "./history";
export {
  setTextColor,
  setTextBackgroundColor,
  clearTextColor,
  clearTextBackgroundColor,
  clearPendingInlineStyles,
  getPendingTextColor,
  getPendingBgColor,
  buildPendingStyle,
} from "./textColor";
export {
  setFontSize,
  clearFontSize,
  clearPendingFontSize,
  getPendingFontSize,
} from "./fontSize";
