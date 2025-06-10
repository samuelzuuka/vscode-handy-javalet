import * as vscode from 'vscode';
import { BaseCommand } from './BaseCommand';

export class ArthasWatchCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName();
        
        if (!methodName) {
            vscode.window.showErrorMessage('请在方法内使用此命令');
            return;
        }
        const command = `watch ${className} ${methodName} '{params,returnObj,throwExp}' - n 5 - x 3`;
        await this.copyToClipboard(command);
    }
}

export class ArthasJadCommand extends BaseCommand {
    async execute(): Promise<void> {
        const className = this.getFullClassName();
        const methodName = this.getCurrentMethodName();
        const command = `jad --source-only ${className} ${methodName}`;
        await this.copyToClipboard(command);
    }
}

export class ArthasTraceCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName();
        
        if (!methodName) {
            vscode.window.showErrorMessage('请在方法内使用此命令');
            return;
        }

        const command = `trace ${className} ${methodName} -n 5 --skipJDKMethod false`;
        await this.copyToClipboard(command);
    }
}

export class ArthasScCommand extends BaseCommand {
    async execute(): Promise<void> {
        const className = this.getFullClassName();
        const command = `sc -d ${className}`;
        await this.copyToClipboard(command);
    }
}

export class ArthasSmCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName();
        
        if (methodName) {
            // 如果在方法内，查看特定方法
            const command = `sm -d ${className} ${methodName}`;
            await this.copyToClipboard(command);
        } else {
            // 否则查看所有方法
            const command = `sm -d ${className}`;
            await this.copyToClipboard(command);
        }
    }
}

export class ArthasStackCommand extends BaseCommand {
    async execute(): Promise<void> {
        const methodName = this.getCurrentMethodName();
        const className = this.getFullClassName();
        
        if (!methodName) {
            vscode.window.showErrorMessage('请在方法内使用此命令');
            return;
        }

        const command = `stack ${className} ${methodName} -n 5`;
        await this.copyToClipboard(command);
    }
} 