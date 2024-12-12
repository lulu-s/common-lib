import { cs_build_setup, _, c_base, c_router, cloopStart, cs_get, cs_get_comp, cs_get_key_comp, ease, csn_from_config, csn_on_signal, map } from "@emergelab/unv-core"
import { createMutable, createStore } from "solid-js/store"
import "./ui-display-mockup.less"


/**
 * 模拟拼接屏拼缝
 * @time 2023-5-16
 * @update_time 
 * @param {number} col 列
 * @param {number} row 行
 * @returns <div class="ui-display-mockup">...</div>
 */

export function UI_Display_Mockup_Render(data) {
    return <>{
        <div class="ui-display-mockup" classList={{
            white: data.white,
            active: data.active
        }}>
            {
                data.col && <For each={new Array(data.col)}>
                    {(d, index) => {
                        return <div class="col"
                            style={{
                                'width': 100 / data.col + '%',
                                'left': 100 / data.col * index() + '%',
                                opacity: (index() == data.col - 1) ? 0 : 1
                            }}></div>
                    }}
                </For>
            }
            {
                data.row && <For each={new Array(data.row)}>
                    {(d, index) => {
                        return <div class="row"
                            style={{
                                'height': 100 / data.row + '%',
                                'top': 100 / data.row * index() + '%',
                                opacity: (index() == data.row - 1) ? 0 : 1
                            }}></div>
                    }}
                </For>
            }

        </div>
    }</>;
}

export class UI_Display_Mockup extends c_base {
    constructor(opt) {
        super(opt);
        // this.defaults = this.data;
        this.data = createMutable(this.data); //local mutable.
    }
    async async_ctor() {
        await super.async_ctor();
        this.app = this.parent;
        this.app.components.push(this.render())
    }
    
    render(){
        return UI_Display_Mockup_Render(this.data)
    }
}

UI_Display_Mockup.type = "UI_Display_Mockup";
UI_Display_Mockup.register();


