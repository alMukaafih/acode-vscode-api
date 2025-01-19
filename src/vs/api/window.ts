import type * as vscode from "vscode";
import type { TabGroups } from "vscode";
import { toDisposable } from "../base/lifecycle";
import { Selection } from "./Selection";
import { TextEditor, type TextEditorSelectionChangeEvent } from "./TextEditor";

editorManager.editor.on("change", (delta: AceApi.Ace.Delta) => {
	editorManager.emit(AcodeApi.EditorEvent.change, delta);
});

class Window {
	tabGroups: TabGroups = undefined;
	get activeTextEditor(): TextEditor | undefined {
		return new TextEditor(editorManager.activeFile);
	}

	get visibleTextEditors(): readonly TextEditor[] {
		return editorManager.files.map((value) => {
			return new TextEditor(value);
		});
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

	showErrorMessage<T extends vscode.MessageItem>(
		message: string,
		...args: any[]
	): Thenable<T | undefined> {
		toast(message, 5000);
		return;
	}
}

export const window /*: typeof vscode.window*/ = new Window();
