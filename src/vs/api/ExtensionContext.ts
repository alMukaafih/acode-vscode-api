import { GLOBAL_DIR, LOGS_DIR, WORKSPACE_DIR } from "lib/constants";
import { Uri } from "vs/base/uri";
import type vscode from "vscode";
import * as path from "../base/path";

export default class ExtensionContext implements vscode.ExtensionContext {
	subscriptions: { dispose(): any }[] = [];
	workspaceState!: vscode.Memento;
	globalState!: vscode.Memento & {
		setKeysForSync(keys: readonly string[]): void;
	};
	secrets!: vscode.SecretStorage;
	extensionUri: vscode.Uri;
	extensionPath: string;
	environmentVariableCollection!: vscode.GlobalEnvironmentVariableCollection;
	asAbsolutePath(relativePath: string): string {
		return path.join(this.extensionPath, relativePath);
	}
	storageUri: vscode.Uri;
	storagePath: string;
	globalStorageUri: vscode.Uri;
	globalStoragePath: string;
	logUri: vscode.Uri;
	logPath: string;
	extensionMode: vscode.ExtensionMode;
	extension: vscode.Extension<any>;
	languageModelAccessInformation!: vscode.LanguageModelAccessInformation;

	constructor(id: string) {
		this.extensionPath = path.join(PLUGIN_DIR, id);
		this.extensionUri = Uri.parse(this.extensionPath);
		this.storagePath = `${WORKSPACE_DIR}/${id}`;
		this.storageUri = Uri.parse(this.storagePath);
		this.globalStoragePath = `${GLOBAL_DIR}/${id}`;
		this.globalStorageUri = Uri.parse(this.globalStoragePath);
		this.logPath = `${LOGS_DIR}/${id}`;
		this.logUri = Uri.parse(this.logPath);
		this.extensionMode = 1;

		this.extension = {
			id,
			extensionUri: this.extensionUri,
			extensionPath: this.extensionPath,
			isActive: false,
			packageJSON: undefined,
			extensionKind: 1,
			exports: undefined,
			activate: (): Thenable<any> => {
				throw new Error("Function not implemented.");
			},
		};
	}
}
