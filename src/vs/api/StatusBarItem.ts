import * as vscode from "vscode";

export default class StatusBarItem implements vscode.StatusBarItem {
	id: string;
	alignment!: vscode.StatusBarAlignment;
	priority: number | undefined;
	name: string | undefined;
	private _text: string;
	private _isShown: boolean = false;
	set text(value: string) {
		this._text = value;
		this.sideButton?.hide();
		this.render();
		if (this._isShown) {
			this.show()
		}
	}

	tooltip: string | vscode.MarkdownString | undefined;
	color: string | vscode.ThemeColor | undefined;
	backgroundColor: vscode.ThemeColor | undefined;
	command: string | vscode.Command | undefined;
	accessibilityInformation: vscode.AccessibilityInformation | undefined;

	sideButton: AcodeApi.SideButton | undefined;

	constructor(id: string) {
		this.id = id;
		this._text = "";
	}

	show(): void {
		this.render()
		this.sideButton?.show();
		this._isShown = true
	}

	hide(): void {
		this.sideButton?.hide();
		this._isShown = false
	}

	dispose(): void {
		this.hide()
		this.sideButton = undefined;
	}

	render() {
		const SideButton = acode.require("sideButton");
		this.sideButton = SideButton({
			text: this._text,
			onclick: () => {
				if (typeof this.command !== "undefined") {
					editorManager.editor.commands.exec(
						typeof this.command === "string"
							? this.command
							: this.command.command,
						editorManager.editor,
						undefined,
					);
				}
			},
		});
	}
}
