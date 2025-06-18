import * as vscode from 'vscode';
import * as path from 'path';

export class StackTraceView {
    private static readonly viewType = 'javaletStackTrace';
    private panel: vscode.WebviewPanel | undefined;
    private outputChannel: vscode.OutputChannel;

    constructor(private context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('Java Stack Trace');
    }

    public async show(stackTrace: string) {
        // 输出到Debug Console
        this.outputToDebugConsole(stackTrace);

        // 如果面板已存在，显示它
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two, true);  // 保持在底部
            this.updateContent(stackTrace);
            return;
        }

        // 创建新面板
        this.panel = vscode.window.createWebviewPanel(
            StackTraceView.viewType,
            'Java堆栈分析',
            {
                viewColumn: vscode.ViewColumn.Two,
                preserveFocus: true
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // 设置面板高度为编辑器高度的1/3
        this.panel.webview.html = `
            <style>
                body {
                    max-height: 33vh;
                    overflow-y: auto;
                }
            </style>
        `;

        // 设置HTML内容
        this.updateContent(stackTrace);

        // 处理消息
        this.panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'jumpToLocation') {
                    await this.jumpToLocation(message.file, message.line);
                }
            }
        );

        // 处理面板关闭
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private outputToDebugConsole(stackTrace: string) {
        // 清空之前的输出
        this.outputChannel.clear();
        
        // 添加时间戳和分隔线
        const timestamp = new Date().toLocaleString();
        this.outputChannel.appendLine('='.repeat(80));
        this.outputChannel.appendLine(`Stack Trace Analysis (${timestamp})`);
        this.outputChannel.appendLine('='.repeat(80));
        
        // 输出堆栈信息
        const frames = this.parseStackTrace(stackTrace);
        frames.forEach((frame, index) => {
            if (frame.file) {
                this.outputChannel.appendLine(`[${index + 1}] ${frame.method} (${frame.file}:${frame.line})`);
            } else {
                this.outputChannel.appendLine(`[${index + 1}] ${frame.method}`);
            }
        });
        
        this.outputChannel.appendLine('='.repeat(80));
        
        // 显示输出通道
        this.outputChannel.show(true);
    }

    private updateContent(stackTrace: string) {
        if (!this.panel) return;

        const stackFrames = this.parseStackTrace(stackTrace);
        this.panel.webview.html = this.getHtmlContent(stackFrames);
    }

    private parseStackTrace(stackTrace: string): any[] {
        const lines = stackTrace.split('\n');
        return lines
            .filter(line => line.trim().startsWith('at '))
            .map(line => {
                // 匹配标准Java堆栈格式
                const match = line.match(/at ([\w.$]+)\(([\w.$]+\.java):(\d+)\)/);
                if (match) {
                    return {
                        method: match[1],
                        file: match[2],
                        line: parseInt(match[3]),
                        raw: line.trim()
                    };
                }
                // 匹配其他格式（如lambda、动态代理等）
                return {
                    method: line.trim(),
                    file: '',
                    line: 0,
                    raw: line.trim(),
                    notClickable: true
                };
            })
            .filter(frame => frame !== null);
    }

    private getHtmlContent(stackFrames: any[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 10px;
                        max-height: 33vh;
                        overflow-y: auto;
                        margin: 0;
                    }
                    .stack-frame {
                        padding: 5px;
                        margin: 2px 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .stack-frame.clickable {
                        cursor: pointer;
                    }
                    .stack-frame.clickable:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    .location {
                        color: var(--vscode-textLink-foreground);
                    }
                    .method {
                        color: var(--vscode-symbolIcon-methodForeground);
                    }
                </style>
            </head>
            <body>
                ${stackFrames.map((frame, index) => `
                    <div class="stack-frame ${frame.notClickable ? '' : 'clickable'}"
                         ${frame.notClickable ? '' : `onclick="jumpToLocation('${frame.file}', ${frame.line})"`}
                         title="${frame.raw}">
                        <span class="method">${frame.method}</span>
                        ${frame.file ? `
                            <span class="location">(${frame.file}:${frame.line})</span>
                        ` : ''}
                    </div>
                `).join('')}
                <script>
                    const vscode = acquireVsCodeApi();
                    function jumpToLocation(file, line) {
                        vscode.postMessage({
                            command: 'jumpToLocation',
                            file: file,
                            line: line
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }

    private async jumpToLocation(file: string, line: number) {
        try {
            // 查找工作区中的Java文件
            const files = await vscode.workspace.findFiles(
                '**/' + path.basename(file),
                '**/node_modules/**'
            );

            if (files.length > 0) {
                // 如果找到多个同名文件，尝试匹配最佳路径
                const bestMatch = this.findBestMatch(files, file);
                
                const document = await vscode.workspace.openTextDocument(bestMatch);
                const editor = await vscode.window.showTextDocument(document);
                
                // 跳转到指定行
                const position = new vscode.Position(line - 1, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(
                    new vscode.Range(position, position),
                    vscode.TextEditorRevealType.InCenter
                );
            } else {
                vscode.window.showErrorMessage(`找不到文件: ${file}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`跳转失败: ${error}`);
        }
    }

    private findBestMatch(files: vscode.Uri[], targetFile: string): vscode.Uri {
        if (files.length === 1) {
            return files[0];
        }

        // 将目标文件路径转换为小写并分割
        const targetParts = targetFile.toLowerCase().split(/[/\\]/);
        let bestMatch = files[0];
        let bestScore = 0;

        for (const file of files) {
            // 将文件路径转换为小写并分割
            const fileParts = file.fsPath.toLowerCase().split(/[/\\]/);
            let score = 0;
            let targetIndex = targetParts.length - 1;

            // 从后向前匹配路径部分
            for (let i = fileParts.length - 1; i >= 0 && targetIndex >= 0; i--) {
                if (fileParts[i] === targetParts[targetIndex]) {
                    score++;
                    targetIndex--;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = file;
            }
        }

        return bestMatch;
    }
} 