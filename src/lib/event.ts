import type { 
  Event as IEvent, 
  EventData, 
  EventTemplate, 
  EventArgument,
  Action as IAction,
  ActionData,
  ActionTemplate,
} from '../types';
import { interpolateTemplate } from '../utils/property-utils';

export class Event implements IEvent {
  id: string;
  template: EventTemplate;
  args: EventArgument[];
  state: 'pending' | 'resolved' | 'rejected';
  done: boolean;
  result: any;

  constructor(data: EventData) {
    this.id = data.id;
    this.template = data.template;
    this.args = data.args;
    this.state = data.state;
    this.done = data.done;
    this.result = data.result;
  }

  getDesc(): string {
    // 构建模板数据
    const templateData: Record<string, any> = {};
    
    for (const arg of this.args) {
      // 简化处理：直接使用参数作为模板数据
      templateData[arg.template] = arg.params[0] || arg.template;
    }

    return interpolateTemplate(this.template.descTemplate, templateData);
  }

  getArg(name: string): EventArgument | undefined {
    return this.args.find(arg => arg.template === name);
  }

  getData(): EventData {
    return {
      id: this.id,
      template: this.template,
      args: this.args,
      state: this.state,
      done: this.done,
      result: this.result,
    };
  }
}

export class Action extends Event implements IAction {
  template: ActionTemplate;

  constructor(data: ActionData) {
    super(data);
    this.template = data.template as ActionTemplate;
  }

  getData(): ActionData {
    return super.getData() as ActionData;
  }
}