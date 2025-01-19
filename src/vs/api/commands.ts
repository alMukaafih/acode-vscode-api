import type * as vscode from "vscode";
import type { Disposable } from "vscode";
import { toDisposable } from "../base/lifecycle";
import TextEditor from "./TextEditor";
import TextEditorEdit from "./TextEditorEdit";

const vs = acode.require("vscode");

class Commands {
	result: any;
	registerCommand(
		command: string,
		callback: (...args: any[]) => any,
		thisArg?: any,
	): Disposable {
		let result: any;
		this.result = result;
		editorManager.editor.commands.addCommand({
			name: command,
			decription: vs._contribs.commands[command],
			exec: (_editor: AceApi.Ace.Editor, args?: any): void => {
				result = callback.apply(thisArg, args);
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
		let result: any;
		this.result = result;
		editorManager.editor.commands.addCommand({
			name: command,
			decription: vs._contribs.commands[command],
			exec: (_editor: AceApi.Ace.Editor, args?: any): void => {
				const session = editorManager.activeFile.session;
				const editor = new TextEditor(session);
				const editoredit = new TextEditorEdit(session);
				result = callback.apply(thisArg, [editor, editoredit, ...args]);
			},
		});

		return toDisposable(() => {
			editorManager.editor.commands.removeCommand(command);
		});
	}

	executeCommand<T = unknown>(command: string, ...rest: any[]): Thenable<T> {
		editorManager.editor.commands.exec(
			vs._contribs.commands[command],
			editorManager.editor,
			rest,
		);
		return Promise.resolve(this.result);
	}

	getCommands(_filterInternal?: boolean): Thenable<string[]> {
		const commands = Object.keys(editorManager.editor.commands.commands);
		return Promise.resolve(commands);
	}
}

const commands: typeof vscode.commands = new Commands();
export default commands;
