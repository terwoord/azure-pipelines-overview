import * as YAML from 'yaml';
import * as YAMLTypes from 'yaml/types';

export enum NodeType {
	Job,
	Step
}

export class OverviewNode {
	constructor(nodeType: NodeType, data: YAMLTypes.YAMLMap) {
		this.NodeType = nodeType;
		this.data = data;

		this.determineLabel();
	}

	public data: YAMLTypes.YAMLMap;

	public NodeType: NodeType;

	public determineLabel() {
		switch(this.NodeType) {
			case NodeType.Job:
				if(this.data.type === "MAP"){
					this.data.items.some((item: any) => {
						if (item.type === "PAIR" && item.key && item.key.type === "PLAIN" && item.value && item.value.type === "PLAIN"){
							if (item.key.value === "job"){
								this._label = "Job '" + item.value.value + "'";
								return true;
							}
						}
						return false;
					});
				}
			case NodeType.Step:
				if (this.data.type === "MAP"){
                    // get display name
					var value = this.getStringValueByNameInMap(this.data, "displayName");
					if (value) {
						this._label = value;
						return;
                    }
                    // get task title
					value = this.getStringValueByNameInMap(this.data, "task");
					if (value) {
						this._label = value;
						return;
					}

					value = this.getStringValueByNameInMap(this.data, "job");
					if (value) {
						this._label = value;
						return;
					}

					value = this.getStringValueByNameInMap(this.data, "template");
					if (value) {
						var parameters = this.getItemsInProperty(this.data, "parameters");
						if (parameters) {
							value = this.getStringValueByNameInItems(parameters, "displayName");
							if(value) {
								this._label = value;
								return;
							}
						}
						value = this.getStringValueByNameInMap(this.data, "template");
						if (value) {
							this._label = value;
						}
						return;
					}

					this._label = "Task";
					return;
				}
				this._label = "Error";
				break;
			default:
				this._label = "Type " + this.NodeType + " not handled!";
		}
	}

	private _label: string = "";
	public getLabel(): string {
		return this._label;
	}

	private getStringValueByNameInMap(map: YAMLTypes.YAMLMap, name: string) {
		var result: string | null = null;

		map.items.some(item =>{
			if (item.key && item.key.type === "PLAIN" && item.key.value === name && item.value
			  && (item.value.type === "PLAIN" || item.value.type === "QUOTE_SINGLE" || item.value.type === "QUOTE_DOUBLE")
			  && item.value.value) {
				result = item.value.value.toString();
				return true;
			}
			return false;
		});

		return result;
	}

	private getStringValueByNameInItems(items: (YAMLTypes.Pair | YAMLTypes.Merge)[], name: string) {
		var result: string | null = null;

		items.some(item =>{
			if (item.key && item.key.type === "PLAIN" && item.key.value === name && item.value
			  && (item.value.type === "PLAIN" || item.value.type === "QUOTE_SINGLE" || item.value.type === "QUOTE_DOUBLE")
			  && item.value.value) {
				result = item.value.value.toString();
				return true;
			}
			return false;
		});

		return result;
	}

	private getItemsInProperty(map: YAMLTypes.YAMLMap, name: string) {
		var result: (YAMLTypes.Pair | YAMLTypes.Merge)[] = [];

		map.items.some(item =>{
			if (item.key && item.key.type === "PLAIN" && item.key.value === name && item.value
			  && item.value.type === "MAP"
			  && item.value.items) {
				result = item.value.items;
				return true;
			}
			return false;
		});

		return result;
	}

	public hasChildren() {
		var result = false;

		if (this.data.type === "MAP" && this.data.items)
		{
			this.data.items.some(item => {
				if (item && item.type === "PAIR" && item.key && item.key.type === "PLAIN" && item.key.value === "steps" && item.value && item.value.type === "SEQ") {
					result = item.value.items.length > 0;
					return true;
				}
				return false;
			});
		}
		
		return result;
	}

	public getChildren(): OverviewNode[] {
		switch(this.NodeType) {
			 case NodeType.Job:
				var result: OverviewNode[] = [];
				if (this.data.type === "MAP" && this.data.items)
				{
					this.data.items.some(item=>{
						if (item && item.type === "PAIR" && item.key && item.key.type === "PLAIN" && item.key.value === "steps" && item.value && item.value.type === "SEQ") 
						{
							(<YAMLTypes.YAMLMap[]>item.value.items).forEach(step => {
								if (step) {
									result.push(new OverviewNode(NodeType.Step, step));
								}
							});
							return true;
						}
						return false;
					});
                }
				return result;
			default:
				return [];
		}
	}
}