# vscode-api - Acode Plugin

<p align="center">
  <img src='https://github.com/alMukaafih/acode-vscode-api/raw/HEAD/logo.png' alt='logo' width='250'>
</p>

## • Overview

This plugin exposes vscode like api in Acode.

## • Installation

1. Open the plugins sidebar on Acode
1. Search for **vscode-api**
1. Click Install

## • Usage

```js
// main.js
import { activate, deactivate } from "./vscode-extension";
const vscode = acode.require("vscode");

const id = "extension-id";

if (window.acode) {
  acode.setPluginInit(id, async (rootUrl, $page, _) => {
    if (!rootUrl.endsWith("/")) {
      rootUrl += "/";
    }

    if (vscode && window.vsApi) {
      activate(new vscode.ExtensionContext(id));
    } else {
      window.addEventListener("vscode-api", async () => {
        activate(new vscode.ExtensionContext(id));
      });
    }
  });

  acode.setPluginUnmount(id, () => {
    deactivate();
  });
}
```

## • Notes

1. Currently not all vscode's api are implemented.
2. This plugin is meant to assist plugin devs in porting vscode extensions to Acode.

## • Api
