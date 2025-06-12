import path = require('path');
import * as vscode from 'vscode';
import * as fs from 'fs';
import { exec } from 'child_process';

export abstract class BaseCommand {
    protected editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    protected async copyToClipboard(text: string): Promise<void> {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('已复制到剪贴板');
    }

    protected getSelectedText(): string {
        const selection = this.editor.selection;
        return this.editor.document.getText(selection);
    }

    protected getCurrentLine(): string {
        const line = this.editor.selection.active.line;
        return this.editor.document.lineAt(line).text;
    }

    protected getPackageName(): string {
        const text = this.editor.document.getText();
        const packageMatch = text.match(/package\s+([\w.]+);/);
        return packageMatch ? packageMatch[1] : '';
    }

    protected getClassName(): string {
        const text = this.editor.document.getText();
        const classMatch = text.match(/class\s+(\w+)/);
        return classMatch ? classMatch[1] : '';
    }

    protected getCurrentMethodName(): string {
        const text = this.editor.document.getText();
        const lines = text.split('\n');
        const currentLine = this.editor.selection.active.line;
        
        // 向上查找最近的方法声明
        for (let i = currentLine; i >= 0; i--) {
            const methodMatch = lines[i].match(/(?:public|private|protected)?\s+(?:static\s+)?(?:[\w<>[\],\s]+)\s+(\w+)\s*\(/);
            if (methodMatch) {
                return methodMatch[1];
            }
        }
        return '';
    }

    protected getFullClassName(): string {
        const packageName = this.getPackageName();
        const className = this.getClassName();
        return packageName ? `${packageName}.${className}` : className;
    }

    protected findMavenProjectRoot(filePath: string): string | null {
        let dir = path.dirname(filePath);
        // 向上查找直到找到包含pom.xml的目录或到达根目录
        while (dir !== path.dirname(dir)) { // 当dir等于其父目录时，说明已到达根目录
            const pomPath = path.join(dir, 'pom.xml');
            if (fs.existsSync(pomPath)) {
                return dir;
            }
            dir = path.dirname(dir);
        }
        return null;
    }

    protected findSourceRoot(filePath: string): string | null {
        let dir = path.dirname(filePath);
        while (dir !== path.dirname(dir)) {
            const baseName = path.basename(dir);
            // 优先匹配Maven标准目录结构
            if (baseName === 'java' && path.basename(path.dirname(dir)) === 'main') {
                return dir;
            }
            // 其次匹配src目录
            if (baseName === 'src') {
                return dir;
            }
            dir = path.dirname(dir);
        }
        return null;
    }

    protected openInFileExplorer(filePath: string) {
        const platform = process.platform;
        const dirPath = path.dirname(filePath);

        switch (platform) {
            case 'darwin': // macOS
                exec(`open "${dirPath}"`);
                break;
            case 'win32': // Windows
                exec(`explorer "${dirPath.replace(/\//g, '\\')}"`);
                break;
            case 'linux': // Linux
                exec(`xdg-open "${dirPath}"`);
                break;
            default:
                vscode.window.showErrorMessage('不支持的操作系统');
        }
    }
} 