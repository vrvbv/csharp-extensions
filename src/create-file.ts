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

export async function createClass(context: vscode.ExtensionContext, uri: vscode.Uri): Promise<boolean> {
    return await createFile(context, uri, "cs-class-template.tmpl");
}
export async function createInterface(context: vscode.ExtensionContext, uri: vscode.Uri): Promise<boolean> {
    return await createFile(context, uri, "cs-interface-template.tmpl");
}

async function createFile(context: vscode.ExtensionContext, uri: vscode.Uri, templateName: string): Promise<boolean> {
    const fileName = await vscode.window.showInputBox({
        placeHolder: "Type your class name (extension is optional)",
    });
    if (!fileName) {
        return false;
    }

    const name = getName(fileName);
    const newFileName = name + CS;
    let template = await getTemplateFileText(context.extension, templateName);
    const namespace = await getNamespace();
    const cursorPosition = getCursorPosition(template);
    template = performReplaces(template, name, namespace);

    const path = vscode.Uri.joinPath(uri, newFileName);
    if (await fileExists(path)) {
        vscode.window.showErrorMessage(`File already exists. FileName: ${newFileName}`);
        return false;
    }

    await writeTextToFile(path, template);
    const file = await openAndShowFile(path);
    file.selection = new vscode.Selection(cursorPosition, cursorPosition);
    return true;
}

function performReplaces(template: string, name: string, namespace: string | undefined): string {
    if (namespace) {
        template = template.replace(NAMESPACE_TAG, namespace);
    }
    template = template.replace(NAME_TAG, name);
    template = template.replace(CURSOR_TAG, "");
    return template;
}

async function getNamespace(): Promise<string | undefined> {
    const customNamespace = vscode.workspace
        .getConfiguration("csharp-extensions")
        .get("customNamespace") as string;
    if (customNamespace) {
        return customNamespace;
    }
    const csprojFiles = await vscode.workspace.findFiles("*.csproj");
    if (csprojFiles.length === 0) {
        return undefined;
    }
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
    const customTemplate = await vscode.workspace
        .findFiles(`.vscode/csharp-extensions/templates/${templateName}`);

    let templatePath;
    if (customTemplate.length > 0) {
        templatePath = customTemplate[0];
    } else {
        templatePath = vscode.Uri.joinPath(self.extensionUri, `/templates/${templateName}`);
    }

    const templateFileText = await readTextFromFile(templatePath);
    return templateFileText;
}

function getCursorPosition(text: string): vscode.Position {
    const cursorPos = text.indexOf(CURSOR_TAG);
    const finder = LineColumnFinder(text).fromIndex(cursorPos);
    if (!finder) {
        return new vscode.Position(0, 0);
    }
    return new vscode.Position(finder.line - 1, finder.col - 1);
}