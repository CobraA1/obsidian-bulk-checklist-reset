import type { EditorPosition, EditorSelection } from "obsidian";

export function sortPositions(sel: EditorSelection): { from: EditorPosition; to: EditorPosition } {
  const { anchor, head } = sel;
  const anchorFirst =
    anchor.line < head.line || (anchor.line === head.line && anchor.ch <= head.ch);
  return anchorFirst ? { from: anchor, to: head } : { from: head, to: anchor };
}
