import { EditorSelection, MarkdownView } from "obsidian";
import { SetAction, setChecklistItems } from "./setChecklistItems";
import { ChecklistResetSettings } from "./types";
import { sortPositions } from "./sortPositions";

export function handleMarkdownAction(
  view: MarkdownView,
  settings: ChecklistResetSettings,
  action: SetAction,
  selectectText?: EditorSelection,
) {
  if (selectectText) {
    const { from, to } = sortPositions(selectectText);
    const currentValue = view.editor.getRange(from, to);
    const newValue = setChecklistItems(currentValue, settings, action);
    try {
      view.editor.replaceRange(newValue, from, to);
    } catch (error) {
      console.log('Selection range: ', { from, to });
      console.log('Selected text: ', currentValue);
      console.error(error);
    }
  } else {
    const currentValue = view.getViewData();
    const newValue = setChecklistItems(currentValue, settings, action);
    view.setViewData(newValue, false);
  }
  view.save();
}
