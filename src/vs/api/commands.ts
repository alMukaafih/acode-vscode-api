import type * as vscode from "vscode";
import type { Disposable } from "vscode";
import { toDisposable } from "../base/lifecycle";
import TextEditor from "./TextEditor";
import TextEditorEdit from "./TextEditorEdit";

class Commands {
	result: any;
	registerCommand(
		command: string,
		callback: (...args: any[]) => any,
		thisArg?: any,
	): Disposable {
		editorManager.editor.commands.addCommand({
			name: vsApi.getCommandName(command),
			exec: (_editor: AceApi.Ace.Editor, args?: any): void => {
				this.result = callback.apply(thisArg, args);
			},
		});

		return toDisposable(() => {
			editorManager.editor.commands.removeCommand(command);
		});
	}

	registerTextEditorCommand(
		command: string,
		callback: (
			textEditor: TextEditor,
			edit: TextEditorEdit,
			...args: any[]
		) => void,
		thisArg?: any,
	): Disposable {
		editorManager.editor.commands.addCommand({
			name: vsApi.getCommandName(command),
			exec: (_editor: AceApi.Ace.Editor, args?: any): void => {
				const file = editorManager.activeFile;
				const editor = new TextEditor(file);
				const editoredit = new TextEditorEdit(file.session);
				callback.apply(thisArg, [editor, editoredit, ...args]);
			},
		});

		return toDisposable(() => {
			editorManager.editor.commands.removeCommand(command);
		});
	}

	async executeCommand<T = unknown>(
		command: string,
		...rest: any[]
	): Promise<T> {
		editorManager.editor.commands.exec(
			vsApi.getCommandName(command),
			editorManager.editor,
			rest,
		);
		return this.result;
	}

	async getCommands(_filterInternal?: boolean): Promise<string[]> {
		return Object.keys(editorManager.editor.commands.commands);
	}
}

const commands: typeof vscode.commands = new Commands();
export default commands;
