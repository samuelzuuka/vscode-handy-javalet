import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { suite, test } from 'mocha';

suite('插件测试套件', () => {
    vscode.window.showInformationMessage('开始测试套件');

    test('编译Java文件测试', async () => {
        // 打开测试文件
        const testFilePath = path.join(__dirname, '../../../.vscode/test-workspace/Test.java');
        const document = await vscode.workspace.openTextDocument(testFilePath);
        await vscode.window.showTextDocument(document);

        // 执行编译命令
        await vscode.commands.executeCommand('javalet.compileJavaFile');

        // 验证class文件是否生成
        const classFilePath = testFilePath.replace('.java', '.class');
        const fileExists = await new Promise<boolean>(resolve => {
            const fs = require('fs');
            fs.access(classFilePath, fs.constants.F_OK, (err: NodeJS.ErrnoException | null) => {
                resolve(!err);
            });
        });

        assert.strictEqual(fileExists, true, 'Class文件应该被生成');
    });

    test('复制类引用测试', async () => {
        // 执行复制类引用命令
        await vscode.commands.executeCommand('javalet.copyClassReference');
        
        // 这里需要实现验证复制到剪贴板的内容
        // TODO: 添加具体的验证逻辑
    });
});