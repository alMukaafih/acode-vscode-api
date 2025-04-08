import { DATA_DIR } from "../lib/constants";
import vscode from "./api";
//import { ExtensionContext } from "./api/extensionContext";
//import type { IExtension } from "./extension";
//import "./api";
import { type IFileIconTheme, IconTheme } from "./contribution/fileIconTheme";

const select = acode.require("select");
const fsOperation = window.acode.require("fs");

export type ConfigChange = [string, string, any];

export const commands = {
	iconTheme: "Preferences: File Icon Theme",
};

const defaultSettings = {
	iconTheme: "default",
};

export let settings = structuredClone(defaultSettings);

async function initSettings() {
	window.log("info", `init vscode-api settings => ${JSON.stringify(settings)}`);
	const fs = fsOperation(DATA_DIR, "settings.json");
	if (await fs.exists()) settings = await fs.readFile("json");
}

async function saveSettings() {
	const fs = fsOperation(DATA_DIR, "settings.json");
	const settingsText = JSON.stringify(settings, undefined, 2);
	if (!(await fs.exists())) {
		const dirFs = fsOperation(DATA_DIR);
		await dirFs.createFile("settings.json");
	}
	await fs.writeFile(settingsText);
}

export class Api {
	constructor() {
		editorManager.editor.commands.addCommand({
			name: commands.iconTheme,
			exec: (_editor: AceApi.Ace.Editor): void => {
				select("Select File Icon Theme", this.getIconThemes(), {
					default: settings.iconTheme,
				}).then((id) => {
					this.setIconTheme(id);
				});
			},
		});

		initSettings().then(() => {
			this.setIconTheme(settings.iconTheme);
		});
		this.iconTheme = new IconTheme();
	}

	/* `commands` Contribution Point   */
	commands: Record<string, string> = {};

	setCommandName(command: string, name: string) {
		this.commands[command] = name;
	}

	getCommandName(command: string) {
		return this.commands[command] ? this.commands[command] : command;
	}

	/* `IconThemes` Contribution Point   */
	_iconThemes: Record<
		string,
		{
			name: string;
			cssUrl: string;
			theme: () => Promise<IFileIconTheme>;
			isMinimized: boolean;
			rootUrl?: string;
		}
	> = {};
	iconTheme: IconTheme;

	/**
	 * Register a new icon theme
	 * @param id - The id of the icon theme
	 * @param detail - The detail of the icon theme
	 */
	registerIconTheme(
		id: string,
		detail: {
			name: string;
			cssUrl: string;
			theme: () => Promise<IFileIconTheme>;
			isMinimized: boolean;
			rootUrl?: string;
		},
	) {
		this._iconThemes[id] = detail;
	}

	/**
	 * Unregister an icon theme
	 * @param id - The id of the icon theme
	 */
	unRegisterIconTheme(id: string) {
		delete this._iconThemes[id];
	}

	/**
	 * Get the icon theme by id
	 * @param id - The id of the icon theme
	 * @returns The icon theme
	 */
	getIconTheme(id: string) {
		return this._iconThemes[id];
	}

	getIconThemes(): [string, string][] {
		const themes: [string, string][] = Object.entries(this._iconThemes)
			.sort((a, b) => {
				const _a = a[1].name.toUpperCase();
				const _b = b[1].name.toUpperCase();
				if (_a < _b) {
					return -1;
				}
				if (_a === _b) {
					return 0;
				}
				return 1;
			})
			.map((value) => [value[0], value[1].name]);

		themes.unshift(["default", "Default"]);
		return themes;
	}

	setIconTheme(id: string) {
		const theme = this.getIconTheme(id);
		settings.iconTheme = theme ? id : "default";
		this.iconTheme.load(theme);
		saveSettings();
	}
}

acode.define("vscode", vscode);
define("vscode", () => vscode);

declare global {
	interface Window {
		vsApi: Api;
	}

	const vsApi: Api;

	namespace AcodeApi {
		interface ModulesMap {
			vscode: typeof vscode;
		}
	}
}
