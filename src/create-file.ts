import * as vscode from 'vscode';
import LineColumnFinder from 'line-column';
import { XMLParser } from 'fast-xml-parser';
import {
    fileExists,
    writeTextToFile,
    openAndShowFile,
    readTextFromFile,
    getValueByKeyRecursive
} from './utils';

const CS = ".cs";
const CURSOR_TAG = "${cursor}";
const NAME_TAG = "${name}";
const NAMESPACE_TAG = "${namespace}";

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
    const namespace = await getNamespace();
    const cursorPosition = getCursorPosition(template);
    template = performReplaces(template, name, namespace);

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

function performReplaces(template: string, name: string, namespace: string | undefined): string {
    if (namespace) {
        template = template.replace(NAMESPACE_TAG, namespace);
    }
    template = template.replace(NAME_TAG, name);
    template = template.replace(CURSOR_TAG, "");
    return template;
}

function getRootFolder(): vscode.WorkspaceFolder | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return null;
    }
    return folders[0];
}

async function getNamespace(): Promise<string | undefined> {
    const customNamespace = vscode.workspace
        .getConfiguration("csharp-extensions")
        .get("customNamespace") as string;
    if (customNamespace) {
        return customNamespace;
    }
    const csprojFiles = await vscode.workspace.findFiles("*.csproj");
    const csprojPath = csprojFiles[0];
    const csprojFile = await readTextFromFile(csprojPath);
    const xmlDoc = new XMLParser().parse(csprojFile);
    const rootNamespace = getValueByKeyRecursive(xmlDoc, "RootNamespace") as string;
    return rootNamespace?.toString();
}

function getName(text: string): string {
    const hasExtension = text.substring(text.length - CS.length) === CS;
    return hasExtension ? text.replace(CS, "") : text;
}

async function getTemplateFileText(self: vscode.Extension<any>, templateName: string) {
    // TODO allow custom templates + auto generate templates from command
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