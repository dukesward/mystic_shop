import { Component, SyntheticEvent } from "react";
import { AppWidget } from "../layouts/types";
import { resolveWidget } from "../layouts/widgets";
import { AppContext, appContext } from "../AppContext";

interface BaseWidgetProps {
  widget?: AppWidget | null;
  pageName?: string;
  dataEmitters?: {[key: string]: () => void};
}

interface BaseWidgetStates {
  displayChild: {[key: string]: boolean},
  formData?: {[key: string]: any},
  customStates?: {[key: string]: any}
}

class BaseWidget extends Component<BaseWidgetProps, BaseWidgetStates> {
  widget?: AppWidget | null
  type: string = ""
  subtype?: string
  initialized: boolean = false
  children: AppWidget[] = []
  pageName?: string;
  dataEmitters: {[key: string]: () => void} = {}
  constructor(props: BaseWidgetProps) {
    super(props);
    this.state = {
      "displayChild": {}
    };
    if(props.dataEmitters) {
      this.dataEmitters = props.dataEmitters;
    }
    this.children = this.widget?.children || [];
  }
  appContext(): AppContext {
    return appContext;
  }
  doConfigure(): void {}

  doRender(): JSX.Element { return (<div></div>);}

  render(): JSX.Element {
    if(!this.initialized) {
      this.doConfigure();
      this.initialized = true;
    }
    return this.doRender();
  }

  addDataEmitter(key: string, emitter: () => void) {
    this.dataEmitters[key] = emitter;
  }

  buildDataTransfers(type: string, subtype?: string): {[key: string]: () => void} {
    return {};
  }

  mergeProps(props: any): any {
    return {...this.props, ...props};
  }

  typeIs(type: string): boolean {
    return this.type === type;
  }

  subtypeIs(subtype: string): boolean {
    return this.subtype === subtype;
  }

  findChild(condition: (c: AppWidget) => boolean): AppWidget | null {
    let child: AppWidget | null = null;
    this.children.forEach(c => {
      if(condition(c)) child = c;
    })
    return child;
  }

  renderChildWidget(widgetId: string): JSX.Element | null {
    if(this.children) {
      let child = this.findChild(c => c.widget_id === widgetId);
      let element: JSX.Element = <></>;
      if(child) {
        let Widget: typeof BaseWidget | null = resolveWidget(child.type, child);
        return Widget ? <Widget pageName={this.pageName} 
        dataEmitters={this.dataEmitters}/> : element;
      }
    }
    return null;
  }

  stateFromChildWidget(widgetId: string): any {
    return {
      "displayChild": (key: string) => {
        let displayChild = this.state.displayChild;
        displayChild[key] = !this.state.displayChild[key];
        this.setState({
          "displayChild": displayChild
        });
      }
    };
  }

  stateFromFormInput(e: SyntheticEvent) {
    e.preventDefault();
    console.log(e);
  }

  handleFormSubmit(e: SyntheticEvent) {
    e.preventDefault();
    console.log(e);
  }

  sendPropToParentWidget(key: string): void {
    console.log(`send prop ${key}`)
    if(this.dataEmitters && this.dataEmitters[key]) {
      this.dataEmitters[key]();
    }
  }

  triggerEvent(event: string): () => void {
    console.log(`trigger event ${event}`)
    return this.dataEmitters[event];
  }
}

export type {
  BaseWidgetProps,
  BaseWidgetStates
}

export {
  BaseWidget
};