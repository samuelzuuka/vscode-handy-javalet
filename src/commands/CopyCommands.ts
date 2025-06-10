import * as vscode from 'vscode';
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