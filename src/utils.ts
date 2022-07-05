import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';

export function getValueByKeyRecursive(obj: any, key: string): any {
    if (key in obj) {
        return obj[key];
    }

    for (const v of Object.values(obj)) {
        if (typeof v === "object" && !Array.isArray(v)) {
            return getValueByKeyRecursive(v, key);
        }
    }
    return null;
}

export async function writeTextToFile(path: vscode.Uri, content: string): Promise<void> {
    await vscode.workspace.fs.writeFile(path, new TextEncoder().encode(content));
}

export async function readTextFromFile(path: vscode.Uri): Promise<string> {
    const file = await vscode.workspace.fs.readFile(path);
    return new TextDecoder().decode(file);
}

export async function fileExists(path: vscode.Uri): Promise<boolean> {
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

export async function openAndShowFile(path: vscode.Uri): Promise<vscode.TextEditor> {
    const openedFile = await vscode.workspace.openTextDocument(path);
    return await vscode.window.showTextDocument(openedFile);
}