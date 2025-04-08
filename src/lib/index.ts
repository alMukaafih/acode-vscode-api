import {
	DATA_DIR,
	GLOBAL_DIR,
	LOGS_DIR,
	ROOT_DIR,
	WORKSPACE_DIR,
} from "lib/constants";
import plugin from "plugin.json";

import("vs/index").then(async (module) => {
	const fs = acode.require("fs");

	window.log("info", "init vscode-api...");

	if (!(await fs(ROOT_DIR).exists())) {
		await fs(DATA_STORAGE).createDirectory(".vscode");
	}

	if (!(await fs(DATA_DIR).exists())) {
		await fs(ROOT_DIR).createDirectory("data");
	}

	if (!(await fs(GLOBAL_DIR).exists())) {
		await fs(DATA_DIR).createDirectory("global");
	}

	if (!(await fs(WORKSPACE_DIR).exists())) {
		await fs(DATA_DIR).createDirectory("workspace");
	}

	if (!(await fs(LOGS_DIR).exists())) {
		await fs(DATA_DIR).createDirectory("logs");
	}

	window.vsApi = new module.Api();
	window.dispatchEvent(new CustomEvent("vscode-api"));

	class Main {
		baseUrl: string | undefined;

		async init(_$page: AcodeApi.WCPage) {}

		async dispose() {
			acode.define("vscode", undefined as any);
			window.vsApi = undefined as any;
		}
	}
	try {
		if (window.acode) {
			const main = new Main();
			acode.setPluginInit(
				plugin.id,
				async (baseUrl, $page) => {
					main.baseUrl = baseUrl;
					if (!main.baseUrl.endsWith("/")) {
						main.baseUrl += "/";
					}
					await main.init($page);
				},
				{
					list: [
						{
							key: "iconTheme",
							text: module.commands.iconTheme,
							get value() {
								if (module.settings.iconTheme === "default") {
									return "Default";
								}
								return window.vsApi._iconThemes[module.settings.iconTheme].name;
							},

							set value(v) {
								const found = window.vsApi.getIconThemes().find((value) => {
									return v === value[1];
								});
								window.vsApi.setIconTheme(found ? found[0] : "default");
							},

							get select() {
								return window.vsApi
									.getIconThemes()
									.map((value) => [value[1], value[1]]);
							},

							set select(_) {},
						},
					],
					cb: (_, __): void => {},
				},
			);
			acode.setPluginUnmount(plugin.id, () => {
				main.dispose();
			});
		}
	} catch (e) {
		window.log("error", e);
	}
});
