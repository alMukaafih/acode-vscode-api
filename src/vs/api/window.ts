import type * as vscode from "vscode";
import type { TabGroups, TextEditorSelectionChangeEvent } from "vscode";
import { toDisposable } from "../base/lifecycle";
import Selection from "./Selection";
import TextEditor from "./TextEditor";
import type StatusBarAlignment from "./StatusBarAlignment";
import StatusBarItem from "./StatusBarItem";

editorManager.editor.on("change", (delta: AceApi.Ace.Delta) => {
	editorManager.emit(AcodeApi.EditorEvent.change, delta);
});

class Window {
	tabGroups!: TabGroups;
	get activeTextEditor(): TextEditor | undefined {
		return new TextEditor(editorManager.activeFile);
	}

	get visibleTextEditors(): readonly TextEditor[] {
		return editorManager.files.map((value) => {
			return new TextEditor(value);
		});
	}

	createStatusBarItem(
		...args:
			| [alignment?: StatusBarAlignment, priority?: number]
			| [id: string, alignment?: StatusBarAlignment, priority?: number]
	): StatusBarItem {
		let id: string;

		if (typeof args[0] === "string") {
			id = args[0];
		} else {
			const uuid = crypto.randomUUID();
			const stack = new Error().stack || uuid;
			id =
				callSite(stack)
					.replace("https://localhost/__cdvfile_files-external__/plugins/", "")
					.split("/")
					.shift() || uuid;
		}

		return new StatusBarItem(id);
	}

	onDidChangeActiveTextEditor(
		listener: (e: TextEditor) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const fn = (file: AcodeApi.EditorFile) => {
			if (thisArgs) {
				listener.apply(thisArgs, [new TextEditor(file)]);
			} else {
				listener(new TextEditor(file));
			}
		};
		editorManager.on(AcodeApi.EditorEvent.switchFile, fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
			editorManager.off(AcodeApi.EditorEvent.switchFile, fn);
		});
	}

	onDidChangeTextEditorSelection(
		listener: (e: TextEditorSelectionChangeEvent) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const selection = editorManager.editor.getSelection();
		const change = {
			textEditor: new TextEditor(editorManager.activeFile),
			selections: [Selection.from(selection)],
			kind: undefined,
		};

		const fn = () => {
			if (thisArgs) {
				listener.apply(thisArgs, [change]);
			} else {
				listener(change);
			}
		};

		editorManager.editor.on("select-word", fn);
		selection.on("changeSelection", fn);
		selection.on("changeCursor", fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}

			editorManager.editor.off("select-word", fn);
			selection.off("changeSelection", fn);
			selection.off("changeCursor", fn);
		});
	}

	async showErrorMessage<T extends vscode.MessageItem>(
		message: string,
		..._args: any[]
	): Promise<T | undefined> {
		toast(message, 5000);
		return;
	}
}

function callSite(stack: string): string {
	let lines = stack.split("\n");
	let site = lines[2];
	let i = 0;
	while (site[i] !== "(") i++;
	i++;
	let start = i;

	while (site[i] !== ":") i++;
	let end = i;

	return site.slice(start, end);
}
export const window /*: typeof vscode.window*/ = new Window();
