import * as vscode from 'vscode';
import { createClass, createInterface } from './create-file';
import { createCustomClassTemplate, createCustomInterfaceTemplate } from './create-template-file';

export function activate(context: vscode.ExtensionContext) {
	const createClassCommand = vscode.commands.registerCommand(
		'csharp-extensions.createClass',
		(uri: vscode.Uri) => createClass(context, uri)
	);
	const createInterfaceCommand = vscode.commands.registerCommand(
		'csharp-extensions.createInterface',
		(uri: vscode.Uri) => createInterface(context, uri)
	);

	const createCustomClassTemplateCommand = vscode.commands.registerCommand(
		'csharp-extensions.createCustomClassTemplate',
		() => createCustomClassTemplate(context)
	);
	const createCustomInterfaceTemplateCommand = vscode.commands.registerCommand(
		'csharp-extensions.createCustomInterfaceTemplate',
		() => createCustomInterfaceTemplate(context)
	);

	context.subscriptions.push(createClassCommand);
	context.subscriptions.push(createInterfaceCommand);
	context.subscriptions.push(createCustomClassTemplateCommand);
	context.subscriptions.push(createCustomInterfaceTemplateCommand);
}

export function deactivate() { }