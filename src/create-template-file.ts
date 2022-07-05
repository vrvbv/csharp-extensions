import * as vscode from 'vscode';
import { openAndShowFile, readTextFromFile, writeTextToFile } from './utils';

export async function createCustomClassTemplate(context: vscode.ExtensionContext): Promise<boolean> {
    return await createFile(context, "cs-class-template.tmpl");
}
export async function createCustomInterfaceTemplate(context: vscode.ExtensionContext): Promise<boolean> {
    return await createFile(context, "cs-interface-template.tmpl");
}

async function createFile(context: vscode.ExtensionContext, templateName: string): Promise<boolean> {
    const customTemplate = await vscode.workspace
        .findFiles(`.vscode/csharp-extensions/templates/${templateName}`);
    if (customTemplate.length > 0) {
        await openAndShowFile(customTemplate[0]);
        return false;
    }
    const defaultTemplateText = await getDefaultTemplateFileText(context.extension, templateName);
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("No active workspace. Aborting custom template creation.");
        return false;
    }
    const workspaceRoot = workspaceFolders[0].uri;
    const path = vscode.Uri.joinPath(
        workspaceRoot,
        `.vscode/csharp-extensions/templates/${templateName}`
    );
    await writeTextToFile(path, defaultTemplateText);
    await openAndShowFile(path);
    return true;
}

async function getDefaultTemplateFileText(self: vscode.Extension<any>, templateName: string) {
    const templatePath = vscode.Uri.file(self.extensionPath + "/templates/" + templateName);
    const templateFileText = await readTextFromFile(templatePath);
    return templateFileText;
}