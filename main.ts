import {
  App,
  Notice,
  MarkdownView,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TextFileView,
} from "obsidian";

import { SetAction } from "./src/setChecklistItems";
import { ChecklistResetSettings } from "src/types";
import { handleCanvasAction } from "src/handleCanvasAction";
import { handleBulkMarkdownAction } from "src/handleBulkMarkdownAction";
import { handleMarkdownAction } from "src/handleMarkdownAction";
import {
  addPathRule,
  hasPathRule,
  removePathRule,
} from "./src/pathListSettings";

const DEFAULT_SETTINGS: ChecklistResetSettings = {
  deleteTextOnReset: "",
  bulkIncludePaths: "",
  bulkExcludePaths: "",
};

function configureBulkPathTextArea(textAreaEl: HTMLTextAreaElement): void {
  textAreaEl.style.width = "500px";
  textAreaEl.style.minWidth = "500px";
  textAreaEl.style.maxWidth = "500px";
  textAreaEl.style.overflowX = "auto";
  textAreaEl.wrap = "off";
  textAreaEl.addClass("checklist-reset-bulk-paths");
}

function handleAction(
  app: App,
  view: TextFileView,
  settings: ChecklistResetSettings,
  action: SetAction
) {
  if (view.file.extension === "canvas") {
    handleCanvasAction(app, view, settings, action);
  } else {
    handleMarkdownAction(view as MarkdownView, settings, action);
  }
}

function isSupportedView(app: App, editorOnly = false): boolean {
  const view = app.workspace.getActiveViewOfType(TextFileView);
  const isSupportedView =
    view?.file.extension === "canvas" || view instanceof MarkdownView;
  if (isSupportedView && editorOnly && view instanceof MarkdownView) {
    return (view.currentMode as any).type === "source";
  }
  return isSupportedView;
}

export default class ChecklistReset extends Plugin {
  settings: ChecklistResetSettings;

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ChecklistResetSettingTab(this.app, this));

    this.addCommand({
      id: "checklist-reset",
      name: "Reset checklists",
      checkCallback: (checking: boolean) => {
        if (checking) {
          return isSupportedView(this.app);
        }

        const view = this.app.workspace.getActiveViewOfType(TextFileView);
        if (view) {
          handleAction(this.app, view, this.settings, "uncheck");
        }
      },
    });

    this.addCommand({
      id: "checklist-check-all",
      name: "Check all",
      checkCallback: (checking: boolean) => {
        if (checking) {
          return isSupportedView(this.app);
        }

        const view = this.app.workspace.getActiveViewOfType(TextFileView);
        if (view) {
          handleAction(this.app, view, this.settings, "check");
        }
      },
    });

    this.addCommand({
      id: "checklist-reset-selected",
      name: "Reset selected checklists",
      checkCallback: (checking: boolean) => {
        if (checking) {
          // Editor mode is required as we cannot select text with checkboxes properly in preview mode.
          return isSupportedView(this.app, true);
        }

        const view = this.app.workspace.getActiveViewOfType(TextFileView);

        if (view?.file.extension === "canvas") {
          const selectedNodes = (view as any).canvas.selection as Set<unknown>;
          const selectedNodeIds = [...selectedNodes].map(
            (node: { id: string }) => node.id
          );
          handleCanvasAction(
            this.app,
            view,
            this.settings,
            "uncheck",
            selectedNodeIds
          );
        } else if (view instanceof MarkdownView) {
          const selectedText = view.editor.listSelections();
          if (selectedText.length > 0) {
            handleMarkdownAction(
              view,
              this.settings,
              "uncheck",
              selectedText[0]
            );
          }
        }
      },
    });

    this.addCommand({
      id: "checklist-reset-bulk",
      name: "Reset checklists (bulk)",
      callback: async () => {
        await handleBulkMarkdownAction(this.app, this.settings);
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        this.addBulkPathMenuItems(menu, file);
      })
    );
  }

  private async updateBulkRuleForPath(
    filePath: string,
    listType: "include" | "exclude",
    action: "add" | "remove"
  ): Promise<void> {
    const settingKey =
      listType === "include" ? "bulkIncludePaths" : "bulkExcludePaths";
    const currentValue = this.settings[settingKey];
    const updatedValue =
      action === "add"
        ? addPathRule(currentValue, filePath)
        : removePathRule(currentValue, filePath);

    if (updatedValue === currentValue) {
      return;
    }

    this.settings[settingKey] = updatedValue;
    await this.saveSettings();

    const target = listType === "include" ? "include" : "exclude";
    const verb = action === "add" ? "Added" : "Removed";
    new Notice(`${verb} "${filePath}" ${action === "add" ? "to" : "from"} bulk ${target} paths.`);
  }

  private addBulkPathMenuItems(menu: any, file: TAbstractFile): void {
    const filePath = file.path;
    const inInclude = hasPathRule(this.settings.bulkIncludePaths, filePath);
    const inExclude = hasPathRule(this.settings.bulkExcludePaths, filePath);

    menu.addSeparator();

    menu.addItem((item: any) => {
      item
        .setTitle(
          inInclude
            ? "Checklist Reset: Remove from Bulk Include"
            : "Checklist Reset: Add to Bulk Include"
        )
        .onClick(async () => {
          await this.updateBulkRuleForPath(
            filePath,
            "include",
            inInclude ? "remove" : "add"
          );
        });
    });

    menu.addItem((item: any) => {
      item
        .setTitle(
          inExclude
            ? "Checklist Reset: Remove from Bulk Exclude"
            : "Checklist Reset: Add to Bulk Exclude"
        )
        .onClick(async () => {
          await this.updateBulkRuleForPath(
            filePath,
            "exclude",
            inExclude ? "remove" : "add"
          );
        });
    });
  }
}

export class ChecklistResetSettingTab extends PluginSettingTab {
  plugin: ChecklistReset;

  constructor(app: App, plugin: ChecklistReset) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Delete text on reset")
      .setDesc(
        "A regex or string. When resetting a checklist item any text matching this will be deleted."
      )
      .addText((text) =>
        text
          .setPlaceholder("/ ✅ \\d{4}-\\d{2}-\\d{2}.*/g")
          .setValue(this.plugin.settings.deleteTextOnReset)
          .onChange(async (value) => {
            this.plugin.settings.deleteTextOnReset = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Bulk include paths")
      .setDesc(
        "One vault-relative file or folder path per line. Bulk reset only runs when at least one include path is set."
      )
      .addTextArea((text) =>
        {
          configureBulkPathTextArea(text.inputEl);
          return text
            .setPlaceholder("Projects/Work\nDaily/2026-02-23.md")
            .setValue(this.plugin.settings.bulkIncludePaths)
            .onChange(async (value) => {
              this.plugin.settings.bulkIncludePaths = value;
              await this.plugin.saveSettings();
            });
        }
      );

    new Setting(containerEl)
      .setName("Bulk exclude paths")
      .setDesc(
        "One vault-relative file or folder path per line. Exclusions override included paths."
      )
      .addTextArea((text) =>
        {
          configureBulkPathTextArea(text.inputEl);
          return text
            .setPlaceholder("Projects/Work/Archive")
            .setValue(this.plugin.settings.bulkExcludePaths)
            .onChange(async (value) => {
              this.plugin.settings.bulkExcludePaths = value;
              await this.plugin.saveSettings();
            });
        }
      );
  }
}
