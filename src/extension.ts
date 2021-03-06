import { commands, ExtensionContext, extensions, window } from "vscode";
import { executeCommands, printCommands } from "./commands";
import getClassName from "./getClassName";
import { getFilename } from "./files";
import formatDocument from "./formatDocument";
import getSelectedText from "./getSelectedText";
import git from "./git";
import lineMiddle from "./lineMiddle";
import { decrement, increment } from "./numbers";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import selectTo from "./selectTo";
import { openEditorAtIndex } from "./tabs";
import undoUntilNotDirty from "./undoUntilNotDirty";

export const activate = async (context: ExtensionContext) => {
    const parseTreeExtension = extensions.getExtension("pokey.parse-tree");
    if (!parseTreeExtension) {
        throw Error("Depends on pokey.parse-tree extension");
    }
    const gitExtension = extensions.getExtension("vscode.git")?.exports;
    if (!gitExtension) {
        throw Error("Depends on vscode.git extension");
    }
    const { getNodeAtLocation } = await parseTreeExtension.activate();

    const registerCommand = (
        command: string,
        callback: (...args: any[]) => any
    ) => {
        const fullCommand = `andreas.${command}`;
        return commands.registerCommand(fullCommand, (...args: any[]) => {
            try {
                return callback(...args);
            } catch (ex) {
                const err = ex as Error;
                window.showErrorMessage(err.message);
                console.error(err.stack);
            }
        });
    };

    context.subscriptions.push(
        registerLanguageDefinitions(),
        registerCommand("selectTo", selectTo),
        registerCommand("lineMiddle", lineMiddle),
        registerCommand("formatDocument", formatDocument),
        registerCommand("executeCommands", executeCommands),
        registerCommand("printCommands", printCommands),
        registerCommand("getSelectedText", getSelectedText),
        registerCommand("increment", increment),
        registerCommand("decrement", decrement),
        registerCommand("openEditorAtIndex", openEditorAtIndex),
        registerCommand("getFileName", getFilename),
        registerCommand("undoUntilNotDirty", undoUntilNotDirty),
        registerCommand("getClassName", () => getClassName(getNodeAtLocation)),
        registerCommand("getGitURL", (lineNumber: boolean) =>
            git.getURL(gitExtension, lineNumber)
        )
    );
};

export const deactivate = () => {};
