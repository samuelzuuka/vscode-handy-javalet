import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { JavaletDocPanel } from './webview';
import { CopyReferenceCommand, CopyPathCommand, CopyClassPathCommand } from './commands/CopyCommands';
import { 
    ArthasWatchCommand,
    ArthasJadCommand,
    ArthasTraceCommand,
    ArthasScCommand,
    ArthasSmCommand,
    ArthasStackCommand
} from './commands/ArthasCommands';
import { StackTraceView } from './views/StackTraceView';

export function activate(context: vscode.ExtensionContext) {
    // 显示文档面板命令
    let showDoc = vscode.commands.registerCommand('javalet.showDoc', () => {
        JavaletDocPanel.createOrShow(context.extensionUri);
    });

    // 编译Java文件
    let compileJavaFile = vscode.commands.registerCommand('javalet.compileJavaFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            vscode.window.showErrorMessage('请在Java文件中使用此命令');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const fileDir = path.dirname(filePath);
        
        try {
            await editor.document.save();
            const result = await new Promise<string>((resolve, reject) => {
                cp.exec(`javac "${filePath}"`, { cwd: fileDir }, (error: cp.ExecException | null, stdout: string, stderr: string) => {
                    if (error) {
                        reject(stderr);
                        return;
                    }
                    const classFile = filePath.replace('.java', '.class');
                    resolve(`编译成功！\n类文件路径: ${classFile}`);
                });
            });
            vscode.window.showInformationMessage(result);
        } catch (error) {
            vscode.window.showErrorMessage(`编译失败: ${error}`);
        }
    });

    // 复制引用（类或方法）
    let copyReference = vscode.commands.registerCommand('javalet.copyReference', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new CopyReferenceCommand(editor).execute();
    });

    // 复制路径（类或方法）
    let copyPath = vscode.commands.registerCommand('javalet.copyPath', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new CopyPathCommand(editor).execute();
    });

    // 复制类路径
    let copyClassPath = vscode.commands.registerCommand('javalet.copyClassPath', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        new CopyClassPathCommand(editor).execute();
    });

    // Arthas Watch 命令
    let arthasWatch = vscode.commands.registerCommand('javalet.arthasWatch', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasWatchCommand(editor).execute();
    });

    // Arthas Jad 命令
    let arthasJad = vscode.commands.registerCommand('javalet.arthasJad', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasJadCommand(editor).execute();
    });

    // Arthas Trace 命令
    let arthasTrace = vscode.commands.registerCommand('javalet.arthasTrace', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasTraceCommand(editor).execute();
    });

    // Arthas Sc 命令
    let arthasSc = vscode.commands.registerCommand('javalet.arthasSc', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasScCommand(editor).execute();
    });

    // Arthas Sm 命令
    let arthasSm = vscode.commands.registerCommand('javalet.arthasSm', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasSmCommand(editor).execute();
    });

    // Arthas Stack 命令
    let arthasStack = vscode.commands.registerCommand('javalet.arthasStack', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'java') {
            return;
        }
        await new ArthasStackCommand(editor).execute();
    });

    // 堆栈分析命令
    let stackTraceView: StackTraceView | undefined;
    let analyzeStackTrace = vscode.commands.registerCommand('javalet.analyzeStackTrace', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        
        if (!text.trim()) {
            vscode.window.showErrorMessage('请先选择堆栈信息');
            return;
        }
        if (!stackTraceView) {
            stackTraceView = new StackTraceView(context);
        }
        
        stackTraceView.show(text);
    });

    context.subscriptions.push(
        showDoc,
        compileJavaFile,
        copyReference,
        copyPath,
        copyClassPath,
        arthasWatch,
        arthasJad,
        arthasTrace,
        arthasSc,
        arthasSm,
        arthasStack,
        analyzeStackTrace
    );
}

export function deactivate() {} 