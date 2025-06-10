import * as vscode from 'vscode';

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
} 