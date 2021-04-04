import * as vscode from 'vscode';
import { OverviewNode } from './overviewNode';
import { OverviewExplorer } from './explorer';
import { countCharactersBetween } from './helpers';

var overviewExplorer: OverviewExplorer;
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('azurePipelineOverview.selectNode', (node: OverviewNode) => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		var editor = vscode.window.activeTextEditor;
		
		selectNode(node, editor);
	});

	context.subscriptions.push(disposable);

	overviewExplorer = new OverviewExplorer(context);
}

function selectNode(node: OverviewNode, editor: vscode.TextEditor | undefined) {
	if (editor && node.data && node.data.range)
	{
		// yaml library removes any \r characters. So now we have to calculate how many \n's are before both range variables, and adjust the position for that
		var documentText = editor.document.getText();
		var rangeStart = node.data.range[0];
		var rangeEnd   = node.data.range[1];
		if (documentText.indexOf("\r\n") !== -1)
		{
			var offsetStart = countCharactersBetween(documentText, "\n", 0, rangeStart);
		 	rangeStart += offsetStart;
			var offsetEnd = countCharactersBetween(documentText, "\n", 0, rangeEnd);
			rangeEnd += offsetEnd;
		}

		var range = new vscode.Range(editor.document.positionAt(rangeStart), editor.document.positionAt(rangeEnd));
		
		editor.selection = new vscode.Selection(range.start, range.end);
		editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {

}
