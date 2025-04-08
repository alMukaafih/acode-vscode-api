const helpers = acode.require("helpers");
const Url = acode.require("url");

export interface IDefinition {
	/** iconPath */
	"0"?: string;
	iconPath?: string;

	/** fontCharacter */
	"1"?: string;
	fontCharacter?: string;

	/** fontColor */
	"2"?: string;
	fontColor?: string;

	/** fontSize */
	"3"?: string;
	fontSize?: string;

	/** fontId */
	"4"?: string;
	fontId?: string;
}

export interface IFileIconTheme {
	/** iconDefinitions */
	"0": Record<string, IDefinition>;
	iconDefinitions: Record<string, IDefinition>;

	/** fileExtensions */
	"1"?: Record<string, number>;
	fileExtensions?: Record<string, number>;

	/** fileNames */
	"2"?: Record<string, number>;
	fileNames?: Record<string, number>;

	/** languageIds */
	"3"?: Record<string, number>;
	languageIds?: Record<string, number>;
}

/**
 * Represents the options required to load a file icon theme.
 */
interface LoadOptions {
	/**
	 * The name of the file icon theme.
	 */
	name: string;

	/**
	 * The URL to the CSS file associated with the file icon theme.
	 */
	cssUrl: string;

	/**
	 * A function that returns a promise resolving to the file icon theme.
	 */
	theme: () => Promise<IFileIconTheme>;

	/**
	 * Indicates whether the file icon theme is minimized.
	 */
	isMinimized: boolean;

	/**
	 * (Optional) The root URL for the file icon theme resources.
	 */
	rootUrl?: string;
}

/**
 * Represents the options used to resolve file icons.
 */
interface ResolveOptions {
	/**
	 * The name of the file or language ID.
	 */
	name: string;

	/**
	 * The key associated with the file icon definition.
	 */
	isFilename: boolean;

	/**
	 * The file type associated with the file as returned from `getFileType` function.
	 */
	fileType: string;

	/**
	 * The language ID associated with the file.
	 */
	languageId: string;

	/**
	 * The key associated with the file icon definition.
	 */
	isMinimized: boolean;

	/**
	 * Indicates whether the file icon is associated with a language ID.
	 */
	rootUrl?: string;
}

/**
 * Represents the options used to insert CSS rules for file icons.
 */
interface InsertCSSOptions {
	/**
	 * The name of the file.
	 */
	name: string;

	/**
	 * The key associated with the file icon definition.
	 */
	key: string;

	/**
	 * The file icon definition.
	 */
	def: IDefinition;

	/**
	 * Indicates whether the name is a filename or a file extension.
	 */
	isFilename: boolean;

	/**
	 * The file type associated with the file as returned from `getFileType` function.
	 */
	fileType: string;

	/**
	 * The language ID associated with the file.
	 */
	isLanguageId: boolean;

	/**
	 * The key associated with the file icon definition.
	 */
	rootUrl?: string;

	/**
	 * Indicates whether the file icon theme is minimized.
	 */
	isMinimized: boolean;
}

function getFileType(filename: string) {
	const regex: Record<string, RegExp> = {
		babel: /\.babelrc$/i,
		jsmap: /\.js\.map$/i,
		yarn: /^yarn\.lock$/i,
		testjs: /\.test\.js$/i,
		testts: /\.test\.ts$/i,
		cssmap: /\.css\.map$/i,
		typescriptdef: /\.d\.ts$/i,
		clojurescript: /\.cljs$/i,
		cppheader: /\.(hh|hpp)$/i,
		jsconfig: /^jsconfig.json$/i,
		tsconfig: /^tsconfig.json$/i,
		android: /\.(apk|aab|slim)$/i,
		jsbeautify: /^\.jsbeautifyrc$/i,
		webpack: /^webpack\.config\.js$/i,
		audio: /\.(mp3|wav|ogg|flac|aac)$/i,
		git: /(^\.gitignore$)|(^\.gitmodules$)/i,
		video: /\.(mp4|m4a|mov|3gp|wmv|flv|avi)$/i,
		image: /\.(png|jpg|jpeg|gif|bmp|ico|webp)$/i,
		npm: /(^package\.json$)|(^package\-lock\.json$)/i,
		compressed: /\.(zip|rar|7z|tar|gz|gzip|dmg|iso)$/i,
		eslint:
			/(^\.eslintrc(\.(json5?|ya?ml|toml))?$|eslint\.config\.(c?js|json)$)/i,
		postcssconfig:
			/(^\.postcssrc(\.(json5?|ya?ml|toml))?$|postcss\.config\.(c?js|json)$)/i,
		prettier:
			/(^\.prettierrc(\.(json5?|ya?ml|toml))?$|prettier\.config\.(c?js|json)$)/i,
	};

	const fileType = Object.keys(regex).find((type) =>
		regex[type].test(filename),
	);
	if (fileType) return fileType;

	const ext = Url.extname(filename)?.substring(1);
	return ext ? ext : "";
}

/**
 * Gets icon according to filename
 * @param filename
 */
function getIconForFile(filename: string) {
	const { getModeForPath } = ace.require("ace/ext/modelist");
	const type = getFileType(filename);
	const { name } = getModeForPath(filename);

	const iconForMode = `file_type_${name}`;
	const iconForType = `file_type_${type}`;

	return `file file_type_default ${iconForMode} ${iconForType}`;
}

/**
 * The `IconTheme` class is responsible for managing and applying file icon themes
 * in a web-based environment. It dynamically loads and applies CSS styles for
 * file icons based on file names, extensions, and language IDs.
 *
 * This class provides functionality to:
 * - Load and apply a file icon theme.
 * - Resolve file icons based on file names, extensions, or language IDs.
 * - Dynamically insert CSS rules for file icons.
 * - Reset the applied icon theme.
 *
 * The class interacts with the DOM by creating and managing `<style>` and `<link>`
 * elements to apply the necessary styles for file icons.
 */
export class IconTheme {
	folders: HTMLLinkElement;
	_theme!: IFileIconTheme;
	langIds: HTMLStyleElement;
	fileExts: HTMLStyleElement;
	fileNames: HTMLStyleElement;
	cache: Set<string>;

	constructor() {
		this.cache = new Set();
		this.folders = document.createElement("link");
		this.folders.id = "vsext-icontheme-folders";
		this.folders.rel = "stylesheet";

		this.langIds = document.createElement("style");
		this.langIds.id = "vsext-icontheme-langids";

		this.fileExts = document.createElement("style");
		this.fileExts.id = "vsext-icontheme-fileexts";

		this.fileNames = document.createElement("style");
		this.fileNames.id = "vsext-icontheme-filenames";
	}

	/**
	 * Loads a file icon theme based on the provided options and applies it to the document.
	 *
	 * @param options - The options for loading the file icon theme.
	 *
	 * @remarks
	 * This method resets the current theme before applying the new one. It appends the necessary
	 * CSS links to the document's `<head>` and overrides the `getIconForFile` helper function
	 * to resolve file icons based on the filename, file type, and language ID.
	 *
	 * The `getIconForFile` function attempts to resolve an icon by checking the filename and
	 * its extensions iteratively until a match is found or all parts are exhausted.
	 *
	 * If no theme is provided or the theme fails to load, the method exits early.
	 */
	async load(options: LoadOptions) {
		this.reset();

		if (!options) {
			return;
		}

		this._theme = await options.theme();
		if (!this._theme) {
			return;
		}

		this.folders.href = options.cssUrl;
		document.head.appendChild(this.folders);
		document.head.appendChild(this.langIds);
		document.head.appendChild(this.fileExts);
		document.head.appendChild(this.fileNames);

		helpers.getIconForFile = (filename) => {
			const { getModeForPath } = ace.require("ace/ext/modelist");
			const fileType = getFileType(filename);
			const { name: languageId } = getModeForPath(filename);

			const names = filename.split(".");
			let result: number;
			let resultStr = "";
			let isFilename = true;
			while (names.length > 0) {
				result = this.resolve({
					name: names.join("."),
					isFilename,
					fileType,
					languageId,
					rootUrl: options.rootUrl,
					isMinimized: options.isMinimized,
				});

				if (result + 1) {
					resultStr = `file_id_${result}`;
					break;
				}
				names.shift();
				isFilename = false;
			}

			return `${getIconForFile(filename)} ${resultStr}`;
		};
	}

	/**
	 * Resolves the appropriate icon definition key based on the provided options.
	 *
	 * @param options - The options used to determine the icon definition.
	 *
	 * @returns The resolved key as a number if successful, or `-1` if no match is found.
	 *
	 * The method determines the appropriate key by checking the theme's file names,
	 * file extensions, and language IDs. If a match is found, it retrieves the
	 * corresponding icon definition and inserts the associated CSS.
	 */
	resolve(options: ResolveOptions): number {
		let iconDefinitions: "0" | "iconDefinitions";
		let fileExtensions: "1" | "fileExtensions";
		let fileNames: "2" | "fileNames";
		let languageIds: "3" | "languageIds";

		if (options.isMinimized) {
			iconDefinitions = "0";
			fileExtensions = "1";
			fileNames = "2";
			languageIds = "3";
		} else {
			iconDefinitions = "iconDefinitions";
			fileExtensions = "fileExtensions";
			fileNames = "fileNames";
			languageIds = "languageIds";
		}

		let key: number | undefined;
		let isLanguageId = false;
		if (options.isFilename) {
			const _fileNames = this._theme[fileNames];
			if (_fileNames !== undefined) {
				key = _fileNames[options.name];
			}
		} else {
			const _fileExtensions = this._theme[fileExtensions];
			if (_fileExtensions !== undefined) {
				key = _fileExtensions[options.name];
			}
		}

		const _languageIds = this._theme[languageIds];
		if (typeof key !== "undefined") {
		} else if (_languageIds?.[options.languageId]) {
			options.name = options.languageId;
			options.isFilename = false;
			isLanguageId = true;
			key = _languageIds[options.languageId];
		} else {
			return -1;
		}

		const def = this._theme[iconDefinitions][key.toString()];

		this.insertCss({ ...options, key: key.toString(), def, isLanguageId });
		return key;
	}

	/**
	 * Inserts a CSS rule into the appropriate stylesheet based on the provided options.
	 * This method ensures that the CSS rule is only added once for a given name.
	 *
	 * @param options - The configuration options for the CSS rule to be inserted.
	 *
	 * @remarks
	 * - The method dynamically generates a CSS rule based on the provided options and inserts it into
	 *   the appropriate stylesheet (fileNames, langIds, or fileExts).
	 * - The `cache` is used to ensure that duplicate rules are not inserted.
	 * - The method handles different scenarios such as rules for filenames, language IDs, and file extensions.
	 *
	 * @example
	 * ```typescript
	 * await insertCss({
	 *   name: "example",
	 *   key: "123",
	 *   fileType: "ts",
	 *   isFilename: true,
	 *   isLanguageId: false,
	 *   isMinimized: false,
	 *   def: {
	 *     iconPath: "icons/example.svg",
	 *     fontCharacter: "E001",
	 *     fontColor: "#FF0000",
	 *     fontSize: "16px",
	 *     fontId: "CustomFont"
	 *   },
	 *   rootUrl: "https://example.com/assets"
	 * });
	 * ```
	 */
	async insertCss(options: InsertCSSOptions): Promise<void> {
		if (this.cache.has(options.name)) {
			return;
		}

		let iconPath: "0" | "iconPath";
		let fontCharacter: "1" | "fontCharacter";
		let fontColor: "2" | "fontColor";
		let fontSize: "3" | "fontSize";
		let fontId: "4" | "fontId";

		if (options.isMinimized) {
			iconPath = "0";
			fontCharacter = "1";
			fontColor = "2";
			fontSize = "3";
			fontId = "4";
		} else {
			iconPath = "iconPath";
			fontCharacter = "fontCharacter";
			fontColor = "fontColor";
			fontSize = "fontSize";
			fontId = "fontId";
		}

		let content = "";
		if (options.def[fontCharacter]) {
			content = `content:"${options.def[fontCharacter]}"!important;`;
		} else if (options.def[iconPath]) {
			content = `content:""!important;background-image:url(${options.rootUrl}/${options.def[iconPath]});`;
		}

		const _fontColor = options.def[fontColor]
			? `color:${options.def[fontColor]};`
			: "";
		const _fontId = options.def[fontId]
			? `font-family:"${options.def[fontId]}"!important;`
			: "";
		const _fontSize = options.def[fontSize]
			? `font-size:${options.def[fontSize]};`
			: "";

		const typeStr =
			options.fileType.length !== 0
				? `,.file_type_${options.fileType}::before`
				: "";

		let selector: string;
		if (options.isLanguageId) {
			selector = `.file_type_${options.name}::before,.file_id_${options.key}::before${typeStr}`;
		} else {
			selector = options.isFilename
				? // biome-ignore lint/style/useTemplate: <explanation>
					`*[data-name="${options.name}"i][data-type="file"]>.file::before,` +
					`*[name="${options.name}"i][type="file"]>.file::before,` +
					`.file_id_${options.key}::before` +
					typeStr
				: // biome-ignore lint/style/useTemplate: <explanation>
					`*[data-name$="${options.name}"i][data-type="file"]>.file::before,` +
					`*[name$="${options.name}"i][type="file"]>.file::before,` +
					`.file_id_${options.key}::before` +
					typeStr;
		}

		const css = `${selector}{${content}${_fontColor}${_fontId}${_fontSize}}`;
		// @vsa-debug
		console.log(`vsext.icontheme.insertCSS - ${options.name} - ${css}`);

		if (options.isFilename) {
			this.fileNames.sheet?.insertRule(
				css,
				this.fileNames.sheet.cssRules.length,
			);
		} else if (options.isLanguageId) {
			this.langIds.sheet?.insertRule(css, this.langIds?.sheet.cssRules.length);
		} else if (!options.name.includes(".")) {
			this.fileExts.sheet?.insertRule(css, 0);
		} else {
			this.fileExts.sheet?.insertRule(css, this.fileExts.sheet.cssRules.length);
		}

		this.cache.add(options.name);
	}

	/**
	 * Resets the icon theme by removing all previously applied styles and clearing the cache.
	 *
	 * @remarks
	 * This method removes all `<style>` and `<link>` elements associated with the icon theme
	 * from the document's `<head>`. It also clears the cache of previously resolved icons.
	 */
	reset() {
		this.fileExts.remove();
		this.fileNames.remove();
		this.langIds.remove();
		this.folders.remove();
		this.cache.clear();

		helpers.getIconForFile = getIconForFile;

		this.langIds = document.createElement("style");
		this.langIds.id = "vscode-icontheme-langids";

		this.fileExts = document.createElement("style");
		this.fileExts.id = "vscode-icontheme-fileexts";

		this.fileNames = document.createElement("style");
		this.fileNames.id = "vscode-icontheme-filenames";
	}
}
