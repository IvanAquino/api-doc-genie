import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('api-doc-genie.helloWorld', () => {
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
