import type vscode from "vscode";

/**
 * Turn a function that implements dispose into an {@link Disposable}.
 *
 * @param fn Clean up function.
 */
export function toDisposable(fn: () => void): vscode.Disposable {
	return {
		dispose: () => {
			fn();
		},
	};
}
