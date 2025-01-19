import path from "node:path";
import type { RsbuildPlugin } from "@rsbuild/core";
import AdmZip from "adm-zip";

const iconFile = path.join(__dirname, "icon.png");
const pluginJSON = path.join(__dirname, "plugin.json");
const distFolder = path.join(__dirname, "dist");
const readmeDotMd = path.join(__dirname, "README.md");

export const pluginZipFiles = (): RsbuildPlugin => ({
	name: "vsx:zip-files",
	setup(api) {
		api.onAfterBuild(({ stats }) => {
			if (stats?.hasErrors()) {
				return;
			}
			const zip = new AdmZip();
			zip.addLocalFolder(distFolder, "");
			zip.addLocalFile(iconFile);
			zip.addLocalFile(pluginJSON);
			zip.addLocalFile(readmeDotMd, "", "readme.md");

			zip.writeZip("vscode-api.zip");

			console.log("Zipped Files to vscode-api.zip!");
		});
	},
});
