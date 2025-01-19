import { defineConfig } from "@rsbuild/core";
//import WasmPackPlugin from "@wasm-tool/wasm-pack-plugin";
import { pluginZipFiles } from "./.pluginZipFiles";
import plugin from "./plugin.json";

export default defineConfig({
	tools: {
		bundlerChain: (chain, { CHAIN_ID }) => {
			/* chain.module
				.rule(CHAIN_ID.RULE.JS)
				.use("babel-loader")
				.after(CHAIN_ID.USE.SWC)
				// The package name or module path of the loader
				.loader("babel-loader")
				.options({
					plugins: [
						"html-tag-js/jsx/jsx-to-tag.js",
						"html-tag-js/jsx/syntax-parser.js",
					],
					compact: false,
					presets: ["@babel/preset-typescript"],
					cacheDirectory: true,
				}); */
			/* chain
				.plugin("wasm-pack")
				.use(new WasmPackPlugin({ crateDirectory: __dirname })); */
		},
		htmlPlugin: false,
	},

	source: {
		entry: {
			main: {
				import: "./src/lib/index.js",
				publicPath: `__cdvfile_files-external__/plugins/${plugin.id}/`,
			},
		},
	},

	output: {
		target: "web",
		filename: {
			js: (pathData) => {
				if (pathData.chunk?.name === "main") {
					return "[name].js";
				}

				return "[name].[contenthash:8].js";
			},
		},
		distPath: {
			js: "",
			jsAsync: "",
		},
	},

	plugins: [pluginZipFiles()],
});
