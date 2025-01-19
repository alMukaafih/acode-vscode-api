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

	async load(theme: {
		name: string;
		cssUrl: string;
		theme: () => Promise<IFileIconTheme>;
		isMinimized: boolean;
		rootUrl?: string;
	}) {
		this.reset();

		if (!theme) {
			return;
		}

		this._theme = await theme.theme();
		if (!this._theme) {
			return;
		}

		this.folders.href = theme.cssUrl;
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
					rootUrl: theme.rootUrl,
					isMinimized: theme.isMinimized,
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
	 * Resolve extension or filename
	 * @param name filename or ext
	 * @param isFilename is it a filename
	 * @param fileType
	 * @param languageId
	 * @returns
	 */
	resolve(icon: {
		name: string;
		isFilename: boolean;
		fileType: string;
		languageId: string;
		isMinimized: boolean;
		rootUrl?: string;
	}): number {
		let iconDefinitions: "0" | "iconDefinitions";
		let fileExtensions: "1" | "fileExtensions";
		let fileNames: "2" | "fileNames";
		let languageIds: "3" | "languageIds";

		if (icon.isMinimized) {
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
		if (icon.isFilename) {
			const _fileNames = this._theme[fileNames];
			if (_fileNames !== undefined) {
				key = _fileNames[icon.name];
			}
		} else {
			const _fileExtensions = this._theme[fileExtensions];
			if (_fileExtensions !== undefined) {
				key = _fileExtensions[icon.name];
			}
		}

		const _languageIds = this._theme[languageIds];
		if (typeof key !== "undefined") {
		} else if (_languageIds?.[icon.languageId]) {
			icon.name = icon.languageId;
			icon.isFilename = false;
			isLanguageId = true;
			key = _languageIds[icon.languageId];
		} else {
			return -1;
		}

		const def = this._theme[iconDefinitions][key.toString()];

		this.insertCss({ ...icon, key: key.toString(), def, isLanguageId });
		return key;
	}

	async insertCss(icon: {
		name: string;
		key: string;
		def: IDefinition;
		isFilename: boolean;
		fileType: string;
		isLanguageId: boolean;
		rootUrl?: string;
		isMinimized: boolean;
	}): Promise<void> {
		if (this.cache.has(icon.name)) {
			return;
		}

		let iconPath: "0" | "iconPath";
		let fontCharacter: "1" | "fontCharacter";
		let fontColor: "2" | "fontColor";
		let fontSize: "3" | "fontSize";
		let fontId: "4" | "fontId";

		if (icon.isMinimized) {
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
		if (icon.def[fontCharacter]) {
			content = `content:"${icon.def[fontCharacter]}"!important;`;
		} else if (icon.def[iconPath]) {
			content = `content:""!important;background-image:url(${icon.rootUrl}/${icon.def[iconPath]});`;
		}

		const _fontColor = icon.def[fontColor]
			? `color:${icon.def[fontColor]};`
			: "";
		const _fontId = icon.def[fontId]
			? `font-family:"${icon.def[fontId]}"!important;`
			: "";
		const _fontSize = icon.def[fontSize]
			? `font-size:${icon.def[fontSize]};`
			: "";

		const typeStr =
			icon.fileType.length !== 0 ? `,.file_type_${icon.fileType}::before` : "";

		let selector: string;
		if (icon.isLanguageId) {
			selector = `.file_type_${icon.name}::before,.file_id_${icon.key}::before${typeStr}`;
		} else {
			selector = icon.isFilename
				? // biome-ignore lint/style/useTemplate: <explanation>
					`*[data-name="${icon.name}"i][data-type="file"]>.file::before,` +
					`*[name="${icon.name}"i][type="file"]>.file::before,` +
					`.file_id_${icon.key}::before` +
					typeStr
				: // biome-ignore lint/style/useTemplate: <explanation>
					`*[data-name$="${icon.name}"i][data-type="file"]>.file::before,` +
					`*[name$="${icon.name}"i][type="file"]>.file::before,` +
					`.file_id_${icon.key}::before` +
					typeStr;
		}

		const css = `${selector}{${content}${_fontColor}${_fontId}${_fontSize}}`;
		// @vsa-debug
		console.log(`vsext.icontheme.insertCSS - ${icon.name} - ${css}`);

		if (icon.isFilename) {
			this.fileNames.sheet?.insertRule(
				css,
				this.fileNames.sheet.cssRules.length,
			);
		} else if (icon.isLanguageId) {
			this.langIds.sheet?.insertRule(css, this.langIds?.sheet.cssRules.length);
		} else if (!icon.name.includes(".")) {
			this.fileExts.sheet?.insertRule(css, 0);
		} else {
			this.fileExts.sheet?.insertRule(css, this.fileExts.sheet.cssRules.length);
		}

		this.cache.add(icon.name);
	}

	reset() {
		this.fileExts.remove();
		this.fileNames.remove();
		this.langIds.remove();
		this.folders.remove();
		this.cache.clear();

		helpers.getIconForFile = getIconForFile;

		this.langIds = document.createElement("style");
		this.langIds.id = "vsext-icontheme-langids";

		this.fileExts = document.createElement("style");
		this.fileExts.id = "vsext-icontheme-fileexts";

		this.fileNames = document.createElement("style");
		this.fileNames.id = "vsext-icontheme-filenames";
	}
}
