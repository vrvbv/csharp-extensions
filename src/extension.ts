import * as vscode from 'vscode';
import { createClass, createInterface } from './create-file';

export function activate(context: vscode.ExtensionContext) {
	const createClassCommand = vscode.commands.registerCommand(
		'csharp-extensions.createClass',
		async (uri: vscode.Uri) => createClass(context, uri)
	);
	const createInterfaceCommand = vscode.commands.registerCommand(
		'csharp-extensions.createInterface',
		async (uri: vscode.Uri) => createInterface(context, uri)
	);
	context.subscriptions.push(createClassCommand);
	context.subscriptions.push(createInterfaceCommand);
}

export function deactivate() { }