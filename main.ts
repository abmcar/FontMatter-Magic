import { App, Editor, MarkdownView, moment, Plugin, PluginSettingTab, Setting } from 'obsidian';
// Remember to rename these classes and interfaces!

interface FrontMatterMagicSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: FrontMatterMagicSettings = {
	mySetting: 'default'
}

export default class FrontMatterMagic extends Plugin {
	settings: FrontMatterMagicSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'insert-frontmatter-command',
			name: 'Insert frontmatter command',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: ";" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if (!view.file) {
					return
				}
				const originalName = view.file.basename
				let baseFileName = view.file.basename
				const nowDate = moment().format("YYYY-MM-DD")
				const arr = baseFileName.split("-")
				if (arr.length > 1) {
					baseFileName = arr[arr.length - 1]
				}
				if (editor.getLine(0) == "---") {
					let endIdx = -1
					for (let i = 1; i < 10; i++) {
						if (editor.getLine(i) == "---") {
							endIdx = i;
							if (editor.getLine(i + 1)[0] == '%') {
								endIdx++;
							}
							break;
						}
					}
					if (endIdx != -1) {
						for (let i = 0; i <= endIdx; i++) {
							editor.setLine(i, "");
						}
						editor.redo;
						return;
					}
				}
				editor.replaceRange(
					'---' + '\n' +
					'layout: post' + '\n' +
					'title: "' + baseFileName + '"\n' +
					'date: ' + nowDate + '\n' +
					'categories: ' + '\n' +
					'tags: ' + '\n' +
					'---' + '\n' +
					"%%" + originalName + "%%\n",
					{ ch: 0, line: 0 })
				view.file?.vault.rename(view.file, nowDate + "-" + baseFileName + ".md")
			}
		})



		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	searchTags() {

	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: FrontMatterMagic;

	constructor(app: App, plugin: FrontMatterMagic) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
