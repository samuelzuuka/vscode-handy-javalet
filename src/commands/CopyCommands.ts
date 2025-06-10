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
        
        // 1. 查找Maven项目根目录
        const mavenRoot = this.findMavenProjectRoot(javaFilePath);
        if (!mavenRoot) {
            vscode.window.showErrorMessage('无法找到Maven项目根目录（包含pom.xml的目录）');
            return;
        }

        // 2. 获取src目录
        const srcPath = this.findSourceRoot(javaFilePath);
        if (!srcPath) {
            vscode.window.showErrorMessage('无法确定源代码根目录');
            return;
        }

        // 3. 计算class文件路径
        const relativePath = path.relative(srcPath, javaFilePath);
        const classPath = path.join(
            mavenRoot,
            'target/classes',
            relativePath.replace('.java', '.class')
        );

        // 4. 复制到剪贴板
        await vscode.env.clipboard.writeText(classPath);
        
        // 5. 检查文件是否存在
        if (fs.existsSync(classPath)) {
            // 6. 根据操作系统打开文件所在目录
            this.openInFileExplorer(classPath);
            vscode.window.showInformationMessage('Class文件路径已复制，并打开所在目录');
        } else {
            vscode.window.showWarningMessage('Class文件路径已复制,但未编译,不跳转');
        }
    }

    private findMavenProjectRoot(filePath: string): string | null {
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

    private findSourceRoot(filePath: string): string | null {
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