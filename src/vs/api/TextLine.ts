import type * as vscode from "vscode";
import Range from "./Range";

export default class TextLine implements vscode.TextLine {
	lineNumber: number;
	text: string;
	range: Range;
	rangeIncludingLineBreak: Range;
	firstNonWhitespaceCharacterIndex: number;
	get isEmptyOrWhitespace(): boolean {
		return this.firstNonWhitespaceCharacterIndex === this.text.length;
	}

	constructor(value: [number, string, number]) {
		this.lineNumber = value[0];
		this.text = value[1];

		let firstNonWhitespaceCharacterIndex = this.text.length;
		try {
			for (let i = 0; i < this.text.length; i++) {
				const char1 = this.text[i];
				const char2 = this.text[i + 1];
				if (char1.match(/\s/) && !char2.match(/\s/)) {
					firstNonWhitespaceCharacterIndex = i + 1;
					break;
				}
			}
		} catch (e) {}

		this.firstNonWhitespaceCharacterIndex = firstNonWhitespaceCharacterIndex;

		this.range = new Range(value[0], 0, value[0], this.text.length);

		const nl = value[2];
		this.rangeIncludingLineBreak = new Range(
			value[0],
			0,
			value[0],
			this.text.length + nl,
		);
	}
}
