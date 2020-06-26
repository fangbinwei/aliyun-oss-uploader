import vscode from 'vscode'
import path from 'path'

export class ElanImagePreviewPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ElanImagePreviewPanel | undefined

  public static readonly viewType = 'elanImagePreview'

  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []

  private _imageSrc: string

  public static createOrShow(extensionUri: vscode.Uri, imageSrc: string): void {
    // If we already have a panel, show it.
    if (ElanImagePreviewPanel.currentPanel) {
      ElanImagePreviewPanel.currentPanel.setImageSrc(imageSrc)
      const panel = ElanImagePreviewPanel.currentPanel._panel
      panel.reveal()

      panel.webview.postMessage({
        type: 'setActive',
        value: panel.active
      })
      return
    }

    const column = vscode.window.activeTextEditor
      ? // ? vscode.window.activeTextEditor.viewColumn
        vscode.ViewColumn.Beside
      : undefined

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      ElanImagePreviewPanel.viewType,
      'Elan Preview',
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionUri.fsPath, 'resources'))
        ]
      }
    )

    ElanImagePreviewPanel.currentPanel = new ElanImagePreviewPanel(
      panel,
      imageSrc,
      extensionUri
    )
  }

  public static revive(
    panel: vscode.WebviewPanel,
    imageSrc: string,
    extensionUri: vscode.Uri
  ): void {
    ElanImagePreviewPanel.currentPanel = new ElanImagePreviewPanel(
      panel,
      imageSrc,
      extensionUri
    )
  }

  private constructor(
    panel: vscode.WebviewPanel,
    imageSrc: string,
    extensionUri: vscode.Uri
  ) {
    this._panel = panel
    this._extensionUri = extensionUri
    this._imageSrc = imageSrc

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
    this._panel.onDidChangeViewState(
      () => {
        this._panel.webview.postMessage({
          type: 'setActive',
          value: this._panel.active
        })
      },
      this,
      this._disposables
    )

    // Set the webview's initial html content
    this._update()
    this._panel.webview.postMessage({
      type: 'setActive',
      value: this._panel.active
    })
  }
  public setImageSrc(imageSrc: string): void {
    this._imageSrc = imageSrc
    // TODO: use postMessage to replace image-src, because we should not reload .js .css ?
    // TODO: add force-update configuration for loading image from oss or add cache-control in oss client's put method? since the object name contains hash, don't care ?
    // but .js .css load by memory cache, so it doesn't matter?
    this._update()
  }

  public dispose(): void {
    ElanImagePreviewPanel.currentPanel = undefined

    // Clean up our resources
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private _update(): void {
    const webview = this._panel.webview
    webview.html = this._getHtmlForWebview(webview)
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // // Local path to main script run in the webview
    // const scriptPathOnDisk = vscode.Uri.file(
    //   path.join(this._extensionUri, 'media', 'main.js')
    // )

    // And the uri we use to load this script in the webview
    // const scriptUri = webview.asWebviewUri(scriptPathOnDisk)

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce()
    const settings = {
      isMac: process.platform === 'darwin',
      src: this._imageSrc
    }

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
              	<link rel="stylesheet" href="${escapeAttribute(
                  this.extensionResource('/resources/webview/main.css')
                )}" type="text/css" media="screen" nonce="${nonce}">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${
                  webview.cspSource
                } https:; script-src 'nonce-${nonce}'; style-src ${
      webview.cspSource
    } 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <meta id="image-preview-settings" data-settings="${escapeAttribute(
                  JSON.stringify(settings)
                )}">
                <title>Image Preview</title>
            </head>
            <body class="container image scale-to-fit loading">
              <div class="loading-indicator"></div>
              <div class="image-load-error">
                <p>${'An error occurred while loading the image.'}</p>
              </div>
              <script src="${escapeAttribute(
                this.extensionResource('/resources/webview/main.js')
              )}" nonce="${nonce}"></script>
            </body>
            </html>`
  }
  private extensionResource(path: string): vscode.Uri {
    return this._panel.webview.asWebviewUri(
      this._extensionUri.with({
        path: this._extensionUri.path + path
      })
    )
  }
}

function getNonce(): string {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function escapeAttribute(value: string | vscode.Uri): string {
  return value.toString().replace(/"/g, '&quot;')
}
