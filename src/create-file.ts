import * as vscode from 'vscode';
import LineColumnFinder from 'line-column';
import { TextEncoder } from 'util';

const CS = ".cs";
const CURSOR_TAG = "${cursor}";
const NAME_TAG = "${name}";

export async function createClass(context: vscode.ExtensionContext, uri: vscode.Uri) {
    createFile(context, uri, "cs-class-template.tmpl");
}
export async function createInterface(context: vscode.ExtensionContext, uri: vscode.Uri) {
    createFile(context, uri, "cs-interface-template.tmpl");
}

async function createFile(context: vscode.ExtensionContext, uri: vscode.Uri, templateName: string) {
    const fileName = await vscode.window.showInputBox({
        placeHolder: "Type your class name (extension is optional)",
    });
    if (!fileName) {
        return;
    }

    const name = getName(fileName);
    const newFileName = name + CS;
    let template = await getTemplateFileText(context.extension, templateName);
    const cursorPosition = getCursorPosition(template);
    template = performReplaces(template, name);

    const newFilePath = uri ?? getRootFolder()?.uri;
    if (!newFilePath) {
        return;
    }

    const path = vscode.Uri.joinPath(newFilePath, newFileName);
    if (await fileExists(path)) {
        vscode.window.showErrorMessage(`File already exists. FileName: ${newFileName}`);
        return;
    }

    await writeTextToFile(path, template);
    const file = await openAndShowFile(path);
    file.selection = new vscode.Selection(cursorPosition, cursorPosition);
}

function performReplaces(template: string, name: string): string {
    // TODO also replace namespaces according to csproj
    // TODO option to use custom namespace
    template = template.replace(CURSOR_TAG, "");
    return template.replace(NAME_TAG, name);
}

async function writeTextToFile(path: vscode.Uri, content: string): Promise<void> {
    await vscode.workspace.fs.writeFile(path, new TextEncoder().encode(content));
}

async function fileExists(path: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(path);
        return true;
    } catch (e: any) {
        if (e instanceof vscode.FileSystemError) {
            return false;
        } else {
            throw e;
        }
    }
}

async function openAndShowFile(fileName: vscode.Uri): Promise<vscode.TextEditor> {
    const openedFile = await vscode.workspace.openTextDocument(fileName);
    return await vscode.window.showTextDocument(openedFile);
}

function getRootFolder(): vscode.WorkspaceFolder | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return null;
    }
    return folders[0];
}

function getName(text: string): string {
    const hasExtension = text.substring(text.length - CS.length) === CS;
    return hasExtension ? text.replace(CS, "") : text;
}

async function getTemplateFileText(self: vscode.Extension<any>, templateName: string) {
    // TODO allow custom templates + allow custom templates to be exposed from commands
    const templatePath = self.extensionPath + "/templates/" + templateName;
    const templateFile = await vscode.workspace.openTextDocument(templatePath);
    return templateFile.getText();
}

function getCursorPosition(text: string): vscode.Position {
    const cursorPos = text.indexOf(CURSOR_TAG);
    const finder = LineColumnFinder(text).fromIndex(cursorPos);
    if (!finder) {
        return new vscode.Position(0, 0);
    }
    return new vscode.Position(finder.line - 1, finder.col - 1);
}