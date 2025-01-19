import type * as vscode from "vscode";
import Position from "./Position";
import Range from "./Range";

// @ts-ignore
export default class Selection extends Range implements vscode.Selection {
	anchor: Position;
	active: Position;
	isReversed: boolean;

	constructor(anchor: Position, active: Position);
	constructor(
		anchorLine: number,
		anchorCharacter: number,
		activeLine: number,
		activeCharacter: number,
	);
	constructor(
		arg0: Position | number,
		arg1: Position | number,
		arg2?: number,
		arg3?: number,
	) {
		let start: Position;
		let end: Position;
		let anchor: Position;
		let active: Position;
		let isReversed = false;

		if (arg0 instanceof Position && arg1 instanceof Position) {
			anchor = arg0;
			active = arg1;
		} else {
			anchor = new Position(arg0 as number, arg1 as number);
			active = new Position(arg2 as number, arg3 as number);
		}

		if (anchor.isBeforeOrEqual(active)) {
			start = anchor;
			end = active;
		} else {
			start = active;
			end = anchor;
			isReversed = true;
		}

		super(start, end);
		this.anchor = anchor;
		this.active = active;
		this.isReversed = isReversed;
	}

	static from(value: AceApi.Ace.Selection) {
		return new Selection(
			Position.from(value.getAnchor()),
			Position.from(value.getCursor()),
		);
	}
}
