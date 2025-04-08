import type Wrapper from "lib/wrapper";
import type * as vscode from "vscode";
import { Uri } from "../base/uri";
import EndOfLine from "./EndOfLine";
import Position from "./Position";
import Range from "./Range";
import TextLine from "./TextLine";

export default class TextDocument
	implements Wrapper<AcodeApi.EditorFile>, vscode.TextDocument
{
	inner: AcodeApi.EditorFile;

	uri: Uri;

	get fileName(): string {
		return this.inner.filename;
	}

	get isUntitled(): boolean {
		return this.inner.filename === "untitled";
	}

	get languageId(): string {
		// @ts-ignore
		return (this.inner.session.getMode().$id || "").split("/").pop();
	}

	version = 0;

	get isDirty(): boolean {
		return this.inner.isUnsaved;
	}

	get isClosed(): boolean {
		return false;
	}

	readonly eol: EndOfLine = EndOfLine.LF;

	public get lineCount(): number {
		return this.inner.session.getLength();
	}

	constructor(value: AcodeApi.EditorFile) {
		this.inner = value;
		this.uri = Uri.parse(value.filename);
	}

	save(): Thenable<boolean> {
		this.version += 1;
		return this.inner.save();
	}

	lineAt(line: number): TextLine;
	lineAt(position: Position): TextLine;
	lineAt(position: number | Position): TextLine {
		let line: number;
		if (typeof position === "number") {
			line = position;
		} else {
			line = position.line;
		}

		return new TextLine([
			line,
			this.inner.session.getLine(line),
			this.inner.session.doc.getNewLineCharacter().length,
		]);
	}

	offsetAt(position: Position): number {
		return this.inner.session.doc.positionToIndex(position.into());
	}

	positionAt(offset: number): Position {
		// @ts-ignore
		return Position.from(this.inner.session.doc.indexToPosition(offset));
	}

	getText(range?: Range): string {
		if (typeof range !== "undefined")
			return this.inner.session.doc.getTextRange(range.into());
		return this.inner.session.doc.getValue();
	}

	getWordRangeAtPosition(
		position: Position,
		_regex?: RegExp,
	): Range | undefined {
		return Range.from(
			this.inner.session.getWordRange(position.line, position.character),
		);
	}

	validateRange(range: vscode.Range): vscode.Range {
		this.inner;
		throw new Error("Method not implemented.");
	}
	validatePosition(position: vscode.Position): vscode.Position {
		throw new Error("Method not implemented.");
	}

	into = () => this.inner;
}
