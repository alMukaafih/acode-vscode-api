import type Wrapper from "lib/wrapper";
import type * as vscode from "vscode";

export default class Position
	implements vscode.Position, Wrapper<AceApi.Ace.Point>
{
	inner: AceApi.Ace.Point;

	public get line(): number {
		return this.inner.row;
	}
	public set line(value: number) {
		this.inner.row = value;
	}

	public get character(): number {
		return this.inner.column;
	}
	public set character(value: number) {
		this.inner.column = value;
	}

	constructor(line: number, character: number) {
		this.inner = {
			row: line,
			column: character,
		};
	}

	isBefore(other: Position): boolean {
		if (this.line < other.line) {
			return true;
		}
		if (other.line < this.line) {
			return false;
		}
		return this.character < other.character;
	}

	isBeforeOrEqual(other: Position): boolean {
		if (this.line < other.line) {
			return true;
		}
		if (other.line < this.line) {
			return false;
		}
		return this.character <= other.character;
	}

	isAfter(other: Position): boolean {
		return !this.isBefore(other);
	}

	isAfterOrEqual(other: Position): boolean {
		return !this.isBeforeOrEqual(other);
	}

	isEqual(other: Position): boolean {
		return this.line === other.line && this.character === other.character;
	}

	compareTo(other: Position): number {
		const thisLine = this.line | 0;
		const otherLine = other.line | 0;

		if (thisLine === otherLine) {
			const thisChar = this.character | 0;
			const otherChar = other.character | 0;
			return thisChar - otherChar;
		}

		return thisLine - otherLine;
	}

	translate(lineDelta?: number, characterDelta?: number): Position;
	translate(change: {
		lineDelta?: number;
		characterDelta?: number;
	}): Position;
	translate(
		lineDelta?:
			| number
			| {
					lineDelta?: number;
					characterDelta?: number;
			  },
		characterDelta?: number,
	): Position {
		let deltaLine: number;
		let deltaChar: number;

		if (lineDelta && typeof lineDelta !== "number") {
			deltaLine =
				typeof lineDelta.lineDelta !== "undefined" ? lineDelta.lineDelta : 0;
			deltaChar =
				typeof lineDelta.characterDelta !== "undefined"
					? lineDelta.characterDelta
					: 0;
		} else {
			deltaLine = typeof lineDelta !== "undefined" ? lineDelta : 0;
			deltaChar = typeof characterDelta !== "undefined" ? characterDelta : 0;
		}

		return this.with(this.line + deltaLine, this.character + deltaChar);
	}
	with(line?: number, character?: number): Position;
	with(change: { line?: number; character?: number }): Position;
	with(
		line?: number | { line?: number; character?: number },
		character?: number,
	): Position {
		let newLine: number;
		let newChar: number;
		if (line && typeof line !== "number") {
			newLine = typeof line.line !== "undefined" ? line.line : this.line;
			newChar =
				typeof line.character !== "undefined" ? line.character : this.character;
		} else {
			newLine = typeof line !== "undefined" ? line : this.line;
			newChar = typeof character !== "undefined" ? character : this.character;
		}

		if (newLine === this.line && newChar === this.character) {
			return this;
		}
		return new Position(newLine, newChar);
	}

	into = () => this.inner;

	static from(value: AceApi.Ace.Point): Position {
		const position: Position = Object.create(Position.prototype);
		position.inner = value;

		return position;
	}
}
