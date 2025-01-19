import type Wrapper from "lib/wrapper";
import type * as vscode from "vscode";
import EndOfLine from "./EndOfLine";
import Position from "./Position";
import Range from "./Range";
import type Selection from "./Selection";

export default class TextEditorEdit
	implements Wrapper<AceApi.Ace.EditSession>, vscode.TextEditorEdit
{
	inner: AceApi.Ace.EditSession;

	constructor(value: AceApi.Ace.EditSession) {
		this.inner = value;
	}

	replace(location: Position | Range | Selection, value: string): void {
		if (location instanceof Position) {
			this.inner.replace(
				ace.Range.fromPoints(location.into(), location.into()),
				value,
			);
		} else if (location instanceof Range) {
			this.inner.replace(location.into(), value);
		}
	}

	insert(location: Position, value: string): void {
		this.inner.insert(location.into(), value);
	}

	delete(location: Range | Selection): void {
		this.inner.remove(location.into());
	}

	setEndOfLine(endOfLine: EndOfLine): void {
		let newLineMode: AceApi.Ace.NewLineMode;
		switch (endOfLine) {
			case EndOfLine.LF:
				newLineMode = "unix";
				break;

			case EndOfLine.CRLF:
				newLineMode = "windows";
				break;
		}
		this.inner.setNewLineMode(newLineMode);
	}
}
