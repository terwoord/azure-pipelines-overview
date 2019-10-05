import * as vscode from 'vscode';
import * as YAML from 'yaml';
import { OverviewDataProvider } from './dataProvider';
import { OverviewNode } from './overviewNode';

export class OverviewExplorer {
	private ftpViewer: vscode.TreeView<OverviewNode>;
	private editor: vscode.TextEditor | undefined;
	private treeDataProvider: OverviewDataProvider;

	constructor(context: vscode.ExtensionContext) {
		this.treeDataProvider = new OverviewDataProvider();

		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));

		this.ftpViewer = vscode.window.createTreeView('myTree', { treeDataProvider: this.treeDataProvider });
		
		this.onActiveEditorChanged();
	}

	private onActiveEditorChanged(): void {
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'file') {
				const enabled = vscode.window.activeTextEditor.document.languageId === 'azure-pipelines';
				vscode.commands.executeCommand('setContext', 'azurePipelineOverviewEnabled', enabled);
				if (enabled) {
					this.refresh();
				}
			}
		} else {
			vscode.commands.executeCommand('setContext', 'azurePipelineOverviewEnabled', false);
		}
	}

	private refresh(): void {
		this.editor = vscode.window.activeTextEditor;

		try {
			if (this.editor && this.editor.document)
			{
				const documentText = this.editor.document.getText();
				var filteredText = documentText.replace(/(?:\r)/g, "\\r").replace(/(?:\n)/g, "\\n");
				var doc = YAML.parseDocument(documentText);

				if (doc && doc.contents && doc.contents.type === "MAP"){
					doc.contents.items.some(item =>{
						if (item.type === "PAIR" && item.key && item.key.type === "PLAIN" && item.value && item.value.type === "SEQ"){
							if (item.key.value === "jobs"){
								
								this.treeDataProvider.setData(item.value.items);
								return true;
							}
						}
						return false;
					});
				}
			}
		}
		catch(ex) {
			this.treeDataProvider.setData(null);
			// error
			console.log("error");
			console.error(ex);
		}
	}

	private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
		if (this.editor) {
			if (changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
				this.refresh();
			}
		}
	}
}