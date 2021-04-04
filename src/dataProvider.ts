import * as vscode from 'vscode';
import * as YAML from 'yaml';
import * as YAMLTypes from 'yaml/types';
import { OverviewNode, NodeType } from './overviewNode';

export class OverviewDataProvider implements vscode.TreeDataProvider<OverviewNode>, vscode.TextDocumentContentProvider  {
	onDidChange?: vscode.Event<vscode.Uri> | undefined;

	provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		throw new Error("Method not implemented.");
	}

	private _onDidChangeTreeData: vscode.EventEmitter<OverviewNode | null> = new vscode.EventEmitter<OverviewNode | null>();
	public readonly onDidChangeTreeData?: vscode.Event<OverviewNode | null> = this._onDidChangeTreeData.event;
	
	getTreeItem(element: OverviewNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		var collapsibleState = vscode.TreeItemCollapsibleState.None;
		if (element.hasChildren())
		{
			collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		}
		return {
			label: element.getLabel(),
			collapsibleState: collapsibleState,
			command: {
				title: element.getLabel(),
				command: "azurePipelineOverview.selectNode",
				arguments: [element]
			}		
		};
	}

	public getChildren(element?: OverviewNode | undefined): vscode.ProviderResult<OverviewNode[]> {
		if (element) {
			return element.getChildren();
		} else {
			if (this.data) {
				var result: OverviewNode[] = [];
				this.data.forEach((item) => {
					if (item) {
						result.push(new OverviewNode(NodeType.Job, item));
					}
				});
				return result;
			} else  {
				return [];
			}
		}
	}

	private data: Array<YAMLTypes.YAMLMap | null> | null = null;

	public setData(data: Array<YAMLTypes.YAMLMap | null> | null): void {
		this.data = data;
		this._onDidChangeTreeData.fire(null);
	}
}