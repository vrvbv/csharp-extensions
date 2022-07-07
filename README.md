# csharp-extensions

This VSCode C# extension should help you speed up your workflow automating repetitive tasks.

---
## Features
### Create files
This extension adds new shortcuts for creating C# classes and interfaces.

#### Class
![Add C# Class](./repository-images/class-cut.mp4)

#### Interface
![Add C# Interface](./repository-images/interface-cut.mp4)

### Custom templates
It's possible to specify a custom template for class and interface creation.
Just press <kbd>Ctrl</kbd><kbd>⇧ Shift</kbd><kbd>P</kbd> on Windows/Linux or <kbd>⌘ Cmd</kbd><kbd>⇧ Shift</kbd><kbd>P</kbd> on MacOS and type:
- _"C# Extensions: Create custom class template"_
- _"C# Extensions: Create custom interface template"_

And then the extension will generate a new template file in your `.vscode/csharp-extension/templates` folder.

When reading your custom template file the extension will look for the following tags and replace them:
**`${name}`:**  your class/interface name.
**`${namespace}`:** your class/interface namespace. This is optional.
**`${cursor}`:** where the text cursor will positioned when the file is created. This is optional.

---
## Extension Settings

This extension contributes the following settings:

* `csharp-extensions.customNamespace`: Custom namespace that will be used for file creation
