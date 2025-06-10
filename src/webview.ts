import * as vscode from 'vscode';

export class JavaletDocPanel {
    public static currentPanel: JavaletDocPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (JavaletDocPanel.currentPanel) {
            JavaletDocPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'javaletDoc',
            'Javalet 文档',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        JavaletDocPanel.currentPanel = new JavaletDocPanel(panel, extensionUri);
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Javalet 文档</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .feature {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                }
                h2 {
                    color: var(--vscode-textLink-foreground);
                }
            </style>
        </head>
        <body>
            <h1>Javalet 使用指南</h1>
            
            <div class="feature">
                <h2>Java文件编译</h2>
                <p>在Java文件编辑器中右键，选择"编译Java文件"选项即可编译当前文件。编译完成后会显示生成的class文件路径。</p>
            </div>

            <div class="feature">
                <h2>高级复制功能</h2>
                <ul>
                    <li>复制类引用：在类名上右键选择"高级复制 > 复制类引用"</li>
                    <li>复制类路径：在类名上右键选择"高级复制 > 复制类路径"</li>
                    <li>复制方法引用：在方法名上右键选择"高级复制 > 复制方法引用"</li>
                    <li>复制方法路径：在方法名上右键选择"高级复制 > 复制方法路径"</li>
                </ul>
            </div>

            <div class="feature">
                <h2>注意事项</h2>
                <ul>
                    <li>请确保工作区中已正确配置JDK</li>
                    <li>编译功能需要Java文件没有语法错误</li>
                    <li>复制功能需要正确选中类名或方法名</li>
                </ul>
            </div>
        </body>
        </html>`;
    }

    public dispose() {
        JavaletDocPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
} 