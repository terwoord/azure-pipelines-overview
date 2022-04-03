import * as vscode from 'vscode';
import * as YAML from 'yaml';
import * as YAMLTypes from 'yaml/types';
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

	private fillProvider(items: any, rootKey: string): boolean {
		return items.some((item: any) =>{
			if (item.type === "PAIR" && item.key && item.key.type === "PLAIN" && item.value && item.value.type === "SEQ"){
				if (item.key.value === rootKey){								
					this.treeDataProvider.setData((<YAMLTypes.YAMLSeq>item.value).items);
					return true;
				}
			}
			return false;
		});
	}

	private refresh(): void {
		this.editor = vscode.window.activeTextEditor;

		try {
			if (this.editor && this.editor.document)
			{
				const documentText = this.editor.document.getText();
				var filteredText = documentText.replace(/(?:\r)/g, "\\r").replace(/(?:\n)/g, "\\n");
				var doc: YAML.Document = YAML.parseDocument(documentText);
				
				if (doc && doc.contents && doc.contents.type === "MAP"){
					if (!this.fillProvider(doc.contents.items, 'jobs')){
						this.fillProvider(doc.contents.items, 'steps');
					}
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