import type * as vscode from "vscode";
import Range from "./Range";
import Selection from "./Selection";
import TextDocument from "./TextDocument";
import ViewColumn from "./ViewColumn";

export default class TextEditor implements vscode.TextEditor {
	document: TextDocument;
	get selection(): Selection {
		return Selection.from(this.document.into().getSelection());
	}

	public get selections(): readonly Selection[] {
		return [this.selection];
	}

	get visibleRanges(): readonly Range[] {
		const screenRow = this.document.into().getScreenLength();
		const screenColumn = this.document.into().getScreenWidth();
		return [
			Range.from(
				ace.Range.fromPoints(
					this.document.into().screenToDocumentPosition(0, 0),
					this.document
						.into()
						.screenToDocumentPosition(screenRow, screenColumn),
				),
			),
		];
	}

	get options(): vscode.TextEditorOptions {
		return {
			tabSize: this.document.into().getTabSize(),
		};
	}

	viewColumn: ViewColumn | undefined = ViewColumn.One;

	constructor(value: AceApi.Ace.EditSession) {
		this.document = new TextDocument(value);
	}

	edit(
		callback: (editBuilder: vscode.TextEditorEdit) => void,
		options?: {
			readonly undoStopBefore: boolean;
			readonly undoStopAfter: boolean;
		},
	): Thenable<boolean> {
		throw new Error("Method not implemented.");
	}

	insertSnippet(
		snippet: vscode.SnippetString,
		location?:
			| vscode.Position
			| vscode.Range
			| readonly vscode.Position[]
			| readonly vscode.Range[],
		options?: {
			readonly undoStopBefore: boolean;
			readonly undoStopAfter: boolean;
		},
	): Thenable<boolean> {
		throw new Error("Method not implemented.");
	}

	setDecorations(
		decorationType: vscode.TextEditorDecorationType,
		rangesOrOptions:
			| readonly vscode.Range[]
			| readonly vscode.DecorationOptions[],
	): void {
		this.document.into().addGutterDecoration;
		throw new Error("Method not implemented.");
	}

	revealRange(
		range: vscode.Range,
		revealType?: vscode.TextEditorRevealType,
	): void {
		throw new Error("Method not implemented.");
	}

	show(_column?: vscode.ViewColumn): void {
		throw new Error("Method not implemented.");
	}

	hide(): void {
		throw new Error("Method not implemented.");
	}
}
