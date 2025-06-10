import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { BaseCommand } from './BaseCommand';

export class CopyReferenceCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName();
        
        if (methodName) {
            // 如果在方法内，复制方法引用
            await this.copyToClipboard(`${className}#${methodName}`);
        } else {
            // 否则复制类引用
            await this.copyToClipboard(className);
        }
    }
}

export class CopyPathCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName().replace(/\./g, '/');
        
        if (methodName) {
            // 如果在方法内，复制方法路径
            await this.copyToClipboard(`${className}#${methodName}`);
        } else {
            // 否则复制类路径
            await this.copyToClipboard(className);
        }
    }
}

export class CopyClassPathCommand extends BaseCommand {

    async execute() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'java') {
            return;
        }

        // 获取Java文件的完整路径
        const javaFilePath = document.uri.fsPath;
        
        // 计算对应的class文件路径
        // 1. 获取src或者源代码目录
        const srcPath = this.findSourceRoot(javaFilePath);
        if (!srcPath) {
            vscode.window.showErrorMessage('无法确定源代码根目录');
            return;
        }

        // 2. 计算class文件路径
        const relativePath = path.relative(srcPath, javaFilePath);
        const classPath = path.join(
            path.dirname(srcPath), 
            'target/classes', 
            relativePath.replace('.java', '.class')
        );

        // 3. 复制到剪贴板
        await vscode.env.clipboard.writeText(classPath);
        
        // 4. 检查文件是否存在
        if (fs.existsSync(classPath)) {
            // 5. 根据操作系统打开文件所在目录
            this.openInFileExplorer(classPath);
            vscode.window.showInformationMessage('Class文件路径已复制，并打开所在目录');
        } else {
            vscode.window.showWarningMessage('Class文件路径已复制,但未编译,不跳转');
        }
    }

    private findSourceRoot(filePath: string): string | null {
        let dir = path.dirname(filePath);
        while (dir !== path.dirname(dir)) {
            if (path.basename(dir) === 'src' || 
                path.basename(dir) === 'java' || 
                path.basename(dir) === 'main') {
                return dir;
            }
            dir = path.dirname(dir);
        }
        return null;
    }

    private openInFileExplorer(filePath: string) {
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