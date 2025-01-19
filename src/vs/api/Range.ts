import type Wrapper from "lib/wrapper";
import type * as vscode from "vscode";
import Position from "./Position";

export default class Range implements vscode.Range, Wrapper<AceApi.Ace.Range> {
	public get start(): Position {
		return Position.from(this.inner.start);
	}

	public get end(): Position {
		return Position.from(this.inner.end);
	}

	get isEmpty(): boolean {
		return this.start.isEqual(this.end);
	}

	get isSingleLine(): boolean {
		return this.start.line === this.end.line;
	}

	inner: AceApi.Ace.Range;

	constructor(start: Position, end: Position);
	constructor(
		startLine: number,
		startCharacter: number,
		endLine: number,
		endCharacter: number,
	);
	constructor(
		arg0: Position | number,
		arg1: Position | number,
		arg2?: number,
		arg3?: number,
	) {
		if (arg0 instanceof Position && arg1 instanceof Position) {
			this.inner = ace.Range.fromPoints(arg0.into(), arg1.into());
		} else {
			this.inner = ace.Range.fromPoints(
				{ row: arg0 as number, column: arg1 as number },
				{ row: arg2 as number, column: arg3 as number },
			);
		}
	}

	/* static from(value: Ace.Range): Range {

    } */

	contains(positionOrRange: Position | Range): boolean {
		if (positionOrRange instanceof Position) {
			if (
				positionOrRange.line < this.start.line ||
				positionOrRange.line > this.end.line
			) {
				return false;
			}
			if (
				positionOrRange.line === this.start.line &&
				positionOrRange.character < this.start.character
			) {
				return false;
			}
			if (
				positionOrRange.line === this.end.line &&
				positionOrRange.character > this.start.character
			) {
				return false;
			}
			return true;
		}

		if (
			positionOrRange.start.line < this.start.line ||
			positionOrRange.end.line < this.start.line
		) {
			return false;
		}
		if (
			positionOrRange.start.line > this.end.line ||
			positionOrRange.end.line > this.end.line
		) {
			return false;
		}
		if (
			positionOrRange.start.line === this.start.line &&
			positionOrRange.start.character < this.start.character
		) {
			return false;
		}
		if (
			positionOrRange.end.line === this.end.line &&
			positionOrRange.end.character < this.end.character
		) {
			return false;
		}
		return true;
	}

	isEqual(other: Range): boolean {
		return this.start.isEqual(other.start) && this.end.isEqual(other.end);
	}

	intersection(range: Range): Range | undefined {
		let resultStartLine = this.start.line;
		let resultStartChar = this.start.character;
		let resultEndLine = this.end.line;
		let resultEndChar = this.end.character;
		const otherStartLine = range.start.line;
		const otherStartChar = range.start.character;
		const otherEndLine = range.end.line;
		const otherEndChar = range.end.character;

		if (resultStartLine < otherStartLine) {
			resultStartLine = otherStartLine;
			resultStartChar = otherStartChar;
		} else if (resultStartLine === otherStartLine) {
			resultStartChar = Math.max(resultStartChar, otherStartChar);
		}

		if (resultEndLine > otherEndLine) {
			resultEndLine = otherEndLine;
			resultEndChar = otherEndChar;
		} else if (resultEndLine === otherEndLine) {
			resultEndChar = Math.min(resultEndChar, otherEndChar);
		}

		// Check if selection is now empty
		if (resultStartLine > resultEndLine) {
			return undefined;
		}
		if (resultStartLine === resultEndLine && resultStartChar > resultEndChar) {
			return undefined;
		}

		return new Range(
			resultStartLine,
			resultStartChar,
			resultEndLine,
			resultEndChar,
		);
	}

	union(other: Range): Range {
		let startLine: number;
		let startChar: number;
		let endLine: number;
		let endChar: number;

		if (other.start.line < this.start.line) {
			startLine = other.start.line;
			startChar = other.start.character;
		} else if (other.start.line === this.start.line) {
			startLine = other.start.line;
			startChar = Math.min(other.start.character, this.start.character);
		} else {
			startLine = this.start.line;
			startChar = this.start.character;
		}

		if (other.end.line > this.end.line) {
			endLine = other.end.line;
			endChar = other.end.character;
		} else if (other.end.line === this.end.line) {
			endLine = other.end.line;
			endChar = Math.max(other.end.character, this.end.character);
		} else {
			endLine = this.end.line;
			endChar = this.end.character;
		}

		return new Range(startLine, startChar, endLine, endChar);
	}

	with(start?: Position, end?: Position): Range;
	with(change: { start?: Position; end?: Position }): Range;
	with(
		start?: Position | { start?: Position; end?: Position },
		end?: Position,
	): Range {
		let newStart: Position;
		let newEnd: Position;
		if (start && !(start instanceof Position)) {
			newStart = typeof start.start !== "undefined" ? start.start : this.start;
			newEnd = typeof start.end !== "undefined" ? start.end : this.end;
		} else {
			newStart = typeof start !== "undefined" ? start : this.start;
			newEnd = typeof end !== "undefined" ? end : this.end;
		}
		if (newStart.isEqual(this.start) && newEnd.isEqual(this.end)) {
			return this;
		}
		return new Range(newStart, newEnd);
	}

	into = () => this.inner;

	static from(value: AceApi.Ace.Range) {
		const range: Range = Object.create(Range.prototype);
		range.inner = value;
		return range;
	}
}
