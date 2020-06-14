import vscode, { ExtensionContext } from 'vscode'
/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ext {
  export let context: vscode.ExtensionContext
}
