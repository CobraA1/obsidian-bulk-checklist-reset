import { App, Notice } from "obsidian";
import { parseRules, isIncluded } from "./bulkPathRules";
import { setChecklistItems } from "./setChecklistItems";
import { ChecklistResetSettings } from "./types";

export async function handleBulkMarkdownAction(
  app: App,
  settings: ChecklistResetSettings
): Promise<void> {
  const includeRules = parseRules(settings.bulkIncludePaths);
  const excludeRules = parseRules(settings.bulkExcludePaths);

  if (includeRules.length === 0) {
    new Notice("Bulk reset requires at least one include path in settings.");
    return;
  }

  const markdownFiles = app.vault.getMarkdownFiles();
  const matchedFiles = markdownFiles.filter((file) =>
    isIncluded(file.path, includeRules, excludeRules)
  );

  let updatedCount = 0;
  let errorCount = 0;

  for (const file of matchedFiles) {
    try {
      const currentContent = await app.vault.read(file);
      const newContent = setChecklistItems(currentContent, settings, "uncheck");
      if (newContent !== currentContent) {
        await app.vault.modify(file, newContent);
        updatedCount += 1;
      }
    } catch {
      errorCount += 1;
    }
  }

  new Notice(
    `Bulk reset complete. Matched: ${matchedFiles.length}, Updated: ${updatedCount}, Errors: ${errorCount}.`
  );
}
