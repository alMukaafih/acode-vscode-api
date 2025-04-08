import type {
	ConfigurationChangeEvent,
	TextDocumentChangeEvent,
	TextDocumentWillSaveEvent,
} from "vscode";
import type * as vscode from "vscode";
import type { ConfigChange } from "..";
import { toDisposable } from "../base/lifecycle";
import Position from "./Position";
import Range from "./Range";
import TextDocument from "./TextDocument";
import TextDocumentSaveReason from "./TextDocumentSaveReason";

class Workspace {
	onDidChangeConfiguration(
		listener: (e: ConfigurationChangeEvent) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const fn = (e: CustomEvent<ConfigChange>) => {
			const [id, key, value] = e.detail;
			if (thisArgs) {
				// @ts-ignore
				listener.apply(thisArgs, []);
			} else {
				listener({
					affectsConfiguration: (
						section: string,
						scope?: vscode.ConfigurationScope,
					): boolean => {
						throw new Error("Function not implemented.");
					},
				});
			}
		};

		// @ts-ignore
		document.addEventListener("configChange", fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
			// @ts-ignore
			document.removeEventListener("configChange", fn);
		});
	}

	onDidChangeTextDocument(
		listener: (e: TextDocumentChangeEvent) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const fn = (delta: AceApi.Ace.Delta) => {
			const file = editorManager.activeFile;
			const range = new Range(
				Position.from(delta.start),
				Position.from(delta.end),
			);
			const rangeOffset = file.session.doc.positionToIndex(delta.start);
			const text = file.session.getTextRange(range.into());
			const change = {
				document: new TextDocument(file),
				contentChanges: [
					{
						range,
						rangeOffset,
						rangeLength: rangeOffset + text.length,
						text,
					},
				],
				reason: undefined,
			};
			if (thisArgs) {
				listener.apply(thisArgs, [change]);
			} else {
				listener(change);
			}
		};

		editorManager.on("changed" as AcodeApi.EditorEvent.change, fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
			editorManager.off("switch-file" as AcodeApi.EditorEvent.switchFile, fn);
		});
	}

	onDidOpenTextDocument(
		listener: (e: TextDocument) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const fn = (file: AcodeApi.EditorFile) => {
			if (thisArgs) {
				listener.apply(thisArgs, [new TextDocument(file)]);
			} else {
				listener(new TextDocument(file));
			}
		};
		editorManager.on(AcodeApi.EditorEvent.fileLoaded, fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
			editorManager.off(AcodeApi.EditorEvent.fileLoaded, fn);
		});
	}

	onWillSaveTextDocument(
		listener: (e: TextDocumentWillSaveEvent) => any,
		thisArgs?: any,
		disposables?: vscode.Disposable[],
	): vscode.Disposable {
		const fn = (file: AcodeApi.EditorFile) => {
			const save: TextDocumentWillSaveEvent = {
				document: new TextDocument(file),
				reason: TextDocumentSaveReason.Manual,
				waitUntil: (thenable: Thenable<readonly vscode.TextEdit[]>): void => {
					throw new Error("Function not implemented.");
				},
			};
			if (thisArgs) {
				listener.apply(thisArgs, [save]);
			} else {
				listener(save);
			}
		};
		editorManager.on(AcodeApi.EditorEvent.fileLoaded, fn);

		return toDisposable(() => {
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
			editorManager.off(AcodeApi.EditorEvent.fileLoaded, fn);
		});
	}
}

export const workspace = new Workspace();
