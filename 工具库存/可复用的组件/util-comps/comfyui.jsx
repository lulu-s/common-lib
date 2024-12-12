import { map, cs_get_comp, c_base, _, cs_get, cfg, ease, n3d } from "@emergelab/unv-core";
import * as core from "libcore/index";
import * as tiny from "../comps/stack"
import { classList, createMutable, Solid_app } from "@emergelab/unv-core/packs/solid"

import "./comfyui.less"

import lz8 from "lzutf8"
import ReconnectingWebsocket from 'reconnecting-websocket';
import { c_c2d_renderer } from "@emergelab/unv-core/packs/c2d";



// Comfy_Provider
export class Comfy_Provider_New extends c_base {

    buffer_image = new Image();
    buffer_result = new Image();
    buffer_latest = new Image();

    buffer_latest_type = 'result';

    constructor(opts) {
        super(opts);
        this.data = _.merge(this.data, {
            network: cfg("network") || 'direct',
            comfy: 'http://192.168.195.169:8188/',
            ws: 'ws://192.168.195.169:8188/',
            // comfy: 'http://192.168.50.170:8188/',
            // ws: 'ws://192.168.50.170:8188/',
            qps_limit: 300,
            firing_before: null,
            firing_result: null,
            folder_type: 'temp',
            skip_id: "61",
        });

        this.state = {
            last_send: 0,
            progress: {},
            queue: 0,
            busy: false
        }
    }

    setup_direct() {
        this.ws = new ReconnectingWebsocket(this.data.ws + "ws?clientId=" + this.client_id);
        this.ws.binaryType = "arraybuffer";
        var buffer_canvas = document.createElement("canvas");
        buffer_canvas.width = 512;
        buffer_canvas.height = 512;
        this.ws.onmessage = async (evt) => {
            if (evt.data instanceof ArrayBuffer) {
                // evt.data.type = "image/jpeg";
                // slice the buffer from 8th byte
                var sliced = evt.data.slice(8);
                var blob = new Blob([sliced], { type: "image/jpeg" });
                var url = URL.createObjectURL(blob);
                this.buffer_image.src = url;

                // this.buffer_result.src = url;
            }
            else {
                var d = JSON.parse(evt.data);
                // console.log(d);

                if (d.type == "executed") {
                    if (d.data.node == this.data.skip_id) {
                        // console.log(d.data);
                        let fileurl = `http://local.emerge.ltd:38811/view?filename=${d.data.output.images[0].filename}&subfolder=&type=output`
                        this.bus.emit('save.image', fileurl);
                        // console.log(fileurl);
                        return;
                    }
                    try {
                        var img = d.data.output.images[0].filename;
                        // console.log(d.data)
                        // this.buffer_result.src = this.data.comfy + "view?filename=" + img + "&subfolder=&type=temp";

                        var img_data = await fetch(this.data.comfy + "view?filename=" + img + "&subfolder=&type=" + this.data.folder_type);
                        var img_blob = await img_data.blob();
                        var img_url = URL.createObjectURL(img_blob);

                        // var base64_url = await new Promise((resolve, reject) => {
                        //     var reader = new FileReader();
                        //     reader.onload = function (e) {
                        //         resolve(e.target.result);
                        //     }
                        //     reader.readAsDataURL(img_blob);
                        // });
                        // this.bus.emit("comfy.sync", base64_url, 'result');
                        // // this.bus.emit("comfy.sync", img_url, 'result');

                        this.state.busy = false
                        this.buffer_result.src = img_url;
                        this.data.firing_result = this.data.comfy + "view?filename=" + img + "&subfolder=&type=temp"
                        // console.log("firing_result", this.data.firing_result);

                        this.bus.emit("comfy.result.obj", {
                            src: img_url,
                            url: this.data.comfy + "view?filename=" + img + "&subfolder=&type=temp"
                        });
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else if (d.type == 'execution_cached') {
                    this.state.busy = this.state.queue > 2;
                }
                else if (d.type == 'status') {
                    if (d.data.status.exec_info.queue_remaining > 0) {
                    }
                    this.state.queue = d.data.status.exec_info.queue_remaining;
                    this.state.busy |= d.data.status.exec_info.queue_remaining > 0;
                }
                else if (d.type == 'executing') {
                    this.state.progress = d.data;
                }
            }
        };
    }

    setup_server() {
        var entity = cs_get_comp(tiny[this.data.entity_target_comp || 'Settings']).entity;
        this.data_node = core.rglue_var((entity) + "/comfy_result", "", Date.now());
        this.sync_node = core.rglue_var((entity) + "/comfy_sync", "", Date.now());
        this.control_node = core.rglue_var((entity) + "/comfy_control", "", Date.now());
        this.control_node.ev.on("changedByRemote", () => {
            try {
                var data = lz8.decompress(this.control_node.value, {
                    inputEncoding: "StorageBinaryString",
                    outputEncoding: "String"
                });
                var json = JSON.parse(data);
                if (json.action == 'prompt') {
                    this.prompt_limit(json.flow, json.force);
                }
            }
            catch (e) {
            }
        });
        var last_sync = "";
        this.cloop(() => {
            var pack = JSON.stringify(this.state);
            if (last_sync != pack) {
                this.sync_node.set(pack, true, Date.now());
                last_sync = pack;
            }
        });
        this.bus.on("comfy.sync", (url, type) => {
            this.data_node.set(JSON.stringify({
                type: type,
                bin: lz8.compress(url, {
                    inputEncoding: "String",
                    outputEncoding: "StorageBinaryString"
                })
            }), true, Date.now());
        });
    }

    setup_client() {


        console.log(cs_get_comp(tiny[this.data.entity_target_comp || 'Settings']));
        
        var entity = cs_get_comp(tiny[this.data.entity_target_comp || 'Settings']).entity;
        console.log(entity);
        
        this.data_node = core.rglue_var((entity) + "/comfy_result", "", Date.now());
        this.sync_node = core.rglue_var((entity) + "/comfy_sync", "", Date.now());
        this.control_node = core.rglue_var((entity) + "/comfy_control", "", Date.now());
        this.sync_node.ev.on("changedByRemote", () => {
            try {
                var json = JSON.parse(this.sync_node.value);
                this.state = json;
            }
            catch (e) {
            }
        });
        this.data_node.ev.on("changedByRemote", () => {
            try {
                var json = JSON.parse(this.data_node.value);
                var data = lz8.decompress(json.bin, {
                    inputEncoding: "StorageBinaryString",
                    outputEncoding: "String"
                });
                // console.log(data);
                if (json.type == 'latent') {
                    this.buffer_image.src = data;
                }
                else if (json.type == 'result') {
                    this.buffer_result.src = data;
                }
            }
            catch (e) {
            }
        });

        this.prompt_limit = async (flow = {}, force = false) => {
            if (Date.now() - this.state.last_send < this.data.qps_limit && !force) { console.warn("QPS200"); return false; }
            if (this.state.busy && !force) { console.warn("BUSY"); return false; };
            this.control_node.set(lz8.compress(JSON.stringify({
                action: 'prompt',
                flow: flow,
                force: force
            }), {
                inputEncoding: "String",
                outputEncoding: "StorageBinaryString"
            }), true, Date.now());
        };
    }

    async async_ctor() {
        await super.async_ctor();
        this.client_id = this.data.client_id || (() => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, a => (a ^ Math.random() * 16 >> a / 4).toString(16)))();

        var cv_buf = document.createElement("canvas");
        cv_buf.width = 512;
        cv_buf.height = 512;
        this.buffer_result.onload = () => {
            // console.log("buffer_result loaded", this.buffer_result);
            this.buffer_latest = this.buffer_result;
            this.bus.emit("comfy.result", this.buffer_result);
            cv_buf.getContext("2d").drawImage(this.buffer_result, 0, 0, 512, 512);
            var img_data = cv_buf.toDataURL("image/jpeg", 0.5);

            this.bus.emit("comfy.sync", img_data, 'result');
        };
        this.buffer_image.onload = () => {
            // console.log("buffer_image loaded", this.buffer_image);
            
            this.buffer_latest = this.buffer_image;
            this.buffer_latest_type = 'latent';
            this.bus.emit("comfy.latent", this.buffer_image);
            cv_buf.getContext("2d").drawImage(this.buffer_image, 0, 0, 512, 512);
            var img_data = cv_buf.toDataURL("image/jpeg", 0.2);
            this.bus.emit("comfy.sync", img_data, 'latent');

        };
        if (this.data.network == 'server') {
            this.setup_direct();
            this.setup_server();
        }
        else if (this.data.network == 'client') {
            this.setup_client();
        }
        else if (this.data.network == 'direct') {
            this.setup_direct();
        }

        this.bus.on("clear_canvas", (e) => {
            this.buffer_image.src = ""
            this.buffer_result.src = ""
            this.buffer_latest.src = ""
            cv_buf.getContext("2d").clearRect(0, 0, 512, 512)
        })

        window.bus = this.bus;
        window.bi = this.buffer_image
        window.br = this.buffer_result


    }
    async prompt_limit(flow = {}, force = false) {
        if (Date.now() - this.state.last_send < this.data.qps_limit && !force) { console.warn("QPS200"); return false; }
        if (this.state.busy && !force) { console.warn("BUSY"); return false; };
        this.state.busy = true;
        var res = await this.prompt(flow);
        return res;
    }

    async prompt(flow = {}) {
        try {
            this.state.last_send = Date.now();
            // console.log(flow);
            // console.log(this.client_id);
            var res = await fetch(this.data.comfy + 'prompt', {
                method: 'POST',
                body: JSON.stringify({
                    "prompt": flow, "client_id": this.client_id
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            var json = await res.json();
            this.prompt_id = json.prompt_id;

        } catch (e) {
            // cs_get_comp(tiny[this.data.entity_pos || 'Settings']).data.sync_state.busy = false;
            this.state.busy = false;
            return false;
        }
    }

}
Comfy_Provider_New.type = "Comfy_Provider_New";
Comfy_Provider_New.register();



// test
// export class comfyUI extends c_base {
//     constructor(opts) {
//         super(opts);
//         this.data = _.merge(this.data, {
//             active: 1,
//         });
//         this.data = createMutable(this.data);
//     }

//     // img to base64
//     img2base64(img) {
//         var canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         var ctx = canvas.getContext("2d");
//         img.crossOrigin = "Anonymous";
//         ctx.drawImage(img, 0, 0, img.width, img.height);
//         var dataURL = canvas.toDataURL("image/png");
//         return dataURL.split(',')[1];
//     }

//     async async_ctor() {
//         await super.async_ctor();
//         console.log('comfyUI ctor');

//         this.comfy = cs_get_comp(Comfy_Provider_New);
//         this.setting = cs_get_comp(tiny[this.data.entity_target_comp || 'Settings']);
//         this.solid = cs_get_comp(Solid_app);
//         this.bus.on("comfy.result", (d) => {
//             console.log('comfy.result', d, d.src);
//             if (this.data.res && d.src) {
//                 this.data.res_img = d.src;
//                 this.data.res = false;
//                 this.bus.emit('img.result', d.src);
//             }
//             else if (d.src) {
//                 // this.data.src = d.url;
//                 this.data.src = d.src
//                 this.bus.emit('img.result', d.src);
//             }
//         });
//         this.bus.on("comfy.message", (d) => {
//             console.log('comfy.message', d);
//             if (d.type == 'progress') {
//                 console.log('comfy.message', d);
//                 this.bus.emit('img.progress', d.data);
//             }
//         });

//         this.test_show();
//     }

//     async send_draw_req(filebase64, flow, img_id, seed_id, params = {
//         force: true,
//         quality: true,
//     }) {
//         flow[img_id].inputs.image = filebase64; // 参考种子，将输入的需要传入图片的位置，改成用户照片

//         flow[seed_id].inputs.seed = 17631961 + Math.floor(Math.random() * 1000000); // 种子必须每次随机一个

//         var res = await this.comfy.prompt_limit(flow, params.force)
//         console.log('prompt res:', res);
//     }

//     test_show() {
//         var canvas = <canvas id="canvas"></canvas>
//         this.solid.components.push(canvas);

//         var _w = 768    //this.setting.data.width;
//         var _h = 768    //this.setting.data.height;
//         canvas.width = _w;
//         canvas.height = _h;
//         canvas.style.width = _w + 'px';
//         canvas.style.height = _h + 'px';
//         var ctx = canvas.getContext('2d');


//         var span = 10;

//         this.data.mouse = { x: 0, y: 0 };


//         var user_draw = false;
//         var draw_time = Date.now();
//         canvas.addEventListener('mousemove', async (e) => {
//             this.data.mouse.x = e.offsetX;
//             this.data.mouse.y = e.offsetY;
//             this.data.clear = false

//             // let base64 = canvas.toDataURL('image/png').split(',')[1];
//             // console.log(base64);
//             // await _this.send_draw_req(base64, this.data.before_flow);
//             draw_time = Date.now();
//         });

//         var gen_last_time = Date.now();
//         this.cloop(t => {

//             if (this.data.clear) {
//                 ctx.clearRect(0, 0, _w, _h);
//             } else {
//                 // mouse
//                 ctx.fillStyle = 'rgba(255, 255, 255, 1)';
//                 ctx.beginPath();
//                 ctx.arc(this.data.mouse.x, this.data.mouse.y, 10, 0, 2 * Math.PI);
//                 ctx.fill();
//             }




//             if (Date.now() - draw_time > 1000) {
//                 user_draw = false;
//             } else {
//                 user_draw = true;
//             }

//             if (Date.now() - gen_last_time > 1000 && user_draw) {
//                 gen_last_time = Date.now();
//                 this.data.path = canvas.toDataURL('image/png');

//                 let base64 = this.data.path.split(',')[1];
//                 console.log(base64);
//                 this.send_draw_req(base64, this.data.before.flow, this.data.before.img_id, this.data.before.seed_id);
//             }
//         })

//         var div = <div class="test">
//             <div class="control">
//                 <button onClick={async () => {
//                     let src = this.img2base64(document.querySelector('.test_img'));
//                     await this.send_draw_req(src, this.data.after.flow, this.data.after.img_id, this.data.after.seed_id);
//                     this.data.res = true;
//                 }}>生成</button>
//                 <button onClick={async () => {
//                     this.data.clear = true;
//                 }}>清除</button>
//             </div>
//             {/* <img class="test_img" src={this.data.src} /> */}
//             <img class="test_img" src={this.data.src} />
//             <img class="path_img" src={this.data.path} />
//             <img class="res_img" src={this.data.res_img} />
//         </div>
//         // document.body.appendChild(img);



//         this.solid.components.push(div);

//     }
// }

// comfyUI.type = 'comfyUI';
// comfyUI.register();


function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = (dataURI.split(',')[1]);
    return byteString
}


export class Tweaker extends c_base {
    runtimeOnly = true;
    constructor(opts) {
        super(opts);
        this.data = _.merge(this.data, {
            // prompt_input: 'game map, isometric, ((high resolution)), ((8k)), (vibrant)',
            topics: [{
            }],
            sliders: [{

            }],
            pos: "",
            seed: Math.random() * 100000000000,
            neg: "",
            edit_action: Date.now()
        });
        this.data = createMutable(this.data);

        this.state = createMutable({
            current_layer: 'scribble',
            topic_id: 0,
            editing: 0,
            editing_ease: 0,
            queue: 0,
            pen_mode: 1,

            current_step: ""
        });
    }

    layers = {};
    make_layer(id) {

        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style.transform = "translate(-50%, -50%)";
        canvas.style.border = "1px solid red";
        // document.body.appendChild(canvas);
        var canvas_ctx = canvas.getContext("2d");

        canvas_ctx.fillStyle = "black";
        canvas_ctx.fillRect(0, 0, canvas.width, canvas.height);
        var layer = {
            canvas: canvas,
            ctx: canvas_ctx,
            operating: 0,
            operating_ease: 0,
        }
        this.layers[id] = layer;

        this.cloop(() => {
            if (this.state.current_layer == id) {
                layer.operating = 1;
            }
            else {
                layer.operating = 0;
            }
            layer.operating_ease = ease(layer.operating_ease, layer.operating, layer.operating ? 0.15 : 0.04);
        });

        return layer;
    }

    async async_ctor() {
        await super.async_ctor();
        this.comfy = cs_get_comp(Comfy_Provider_New);
        var c2d = cs_get_comp(c_c2d_renderer);
        var solid = cs_get_comp(Solid_app);
        var ctx = c2d.ctx;
        this.main_ctx = ctx;
        this.ctx = ctx;
        this.c2d = c2d;
        this.t = 0;
        await this.create_paint_area();
        await this.canvas_render();

        this.bus.on("edit", () => {
            this.data.edit_action = Date.now();
        });

        // this.cloop(() => {
        //     var width = this.c2d.width;
        //     var height = this.c2d.height;
        //     ctx.clearRect(0, 0, width, height);
        //     ctx.fillStyle = "black";
        //     ctx.fillRect(0, 0, width, height);
        // })

        // await this.fx();

        this.cloop(() => {
            if (this.paint.allow_ease < 0.01) {
                this.result_ctx.clearRect(0, 0, this.result_canvas.width, this.result_canvas.height)
                this.bus.emit("clear_canvas");
                return;
            }

            this.t += 0.01;
            this.state.editing = Date.now() - this.data.edit_action < 500;
            this.state.editing_ease = ease(this.state.editing_ease, this.state.editing, this.state.editing ? 0.15 : 0.04);

            ctx.globalCompositeOperation = 'lighter'
            ctx.filter = 'blur(400px)'
            ctx.globalAlpha = 0.05 * this.paint.allow_ease;
            ctx.drawImage(this.result_canvas,
                this.paint_BoundingBox.left - 50,
                this.paint_BoundingBox.top - 50,
                this.paint_BoundingBox.width + 100,
                this.paint_BoundingBox.height + 100
            );

            ctx.save();
            ctx.filter = 'blur(100px)'
            ctx.globalAlpha = 0.05 * this.paint.allow_ease;
            ctx.translate(
                this.paint_BoundingBox.left + this.paint_BoundingBox.width / 2,
                this.paint_BoundingBox.top + this.paint_BoundingBox.height / 2
            )
            ctx.scale(1.08, 1.08);
            //ctx.rotate(Math.sin(this.t * 1.2) * 0.03);
            ctx.globalAlpha = (Math.sin(this.t * 2) * 0.5 + 0.5) * this.paint.allow_ease
            ctx.drawImage(this.result_canvas,
                - (this.paint_BoundingBox.width) / 2,
                - (this.paint_BoundingBox.height) / 2,
                this.paint_BoundingBox.width,
                this.paint_BoundingBox.height
            );
            ctx.restore();

            ctx.globalAlpha = 1 * this.paint.allow_ease;

            ctx.globalCompositeOperation = 'source-over'
            ctx.filter = 'none'
            ctx.drawImage(this.result_canvas,
                this.paint_BoundingBox.left,
                this.paint_BoundingBox.top,
                this.paint_BoundingBox.width,
                this.paint_BoundingBox.height
            );


        })

        await this.canvas_scribble();

        this.bus.on("create", (params) => {
            this.create(params);
        });

        this.input = <input type="text" value={this.data.prompt_input} style="width: 70%; position: absolute; display: block; bottom: 5vh; left: 50%; transform: translateX(-50%);" />
        // solid.components.push(this.input);

        // var topic_selector = <div class='topic_selector'>
        //     <div class='topic_selector_scroll'>
        //         <For each={this.data.topics}>
        //             {(topic, i) => <div class='topic_selector_item' classList={{ selected: this.state.topic_id == i() }} onClick={() => {
        //                 this.state.topic_id = i();
        //                 this.bus.emit('edit');
        //                 this.bus.emit("create", {
        //                     force: true,
        //                     quality: true,
        //                 });
        //             }} innerHTML={`<span class="material-symbols-outlined">spoke</span><b>` + topic.name + '</b>'}>

        //             </div>}
        //         </For>
        //     </div>
        // </div>


        // var operators = <div class='operators'>
        //     <div class='operator_left'>
        //         <div class='op left' classList={{
        //             selected: this.state.pen_mode == 1
        //         }} onClick={() => {
        //             this.state.pen_mode = 1;
        //         }}><span class="material-icons-outlined">
        //                 draw
        //             </span>绘图
        //         </div>
        //         <div class='op left' classList={{
        //             selected: this.state.pen_mode == 0
        //         }} onClick={() => {
        //             this.state.pen_mode = 0;
        //         }}><span class="material-symbols-outlined">
        //                 texture_minus
        //             </span>擦除
        //         </div>

        //         <div class='op left' classList={{
        //         }} onClick={() => {
        //             this.bus.emit("clear");
        //         }}><span class="material-icons-outlined">
        //                 refresh
        //             </span>清空
        //         </div>
        //     </div>
        //     <div class='op right' onClick={() => {
        //         this.data.seed = Math.floor(Math.random() * 1e12);
        //         this.bus.emit("create", {
        //             force: true,
        //             quality: true,
        //         });
        //     }}><span class="material-icons-outlined">
        //             auto_awesome
        //         </span>新创意</div>
        // </div >




        this.cloop(() => {
            if (this.state.queue != this.comfy.state.queue) {
                this.state.queue = this.comfy.state.queue;
            }
            try {
                if (this.state.queue > 0 && this.comfy.state.progress.node) {
                    this.state.current_step = this.data.flow_obj.flow[this.comfy.state.progress.node].note;
                }
            } catch (e) {

            }
        })


        var indicator = <div class='indicator' classList={{
            busy: this.state.queue > 0,
            hidden: !this.paint.allow
        }}>
            <div class='busy'>绘制中 {this.state.current_step ? `(${this.state.current_step})` : ''} {this.state.queue}</div><div class='idle'>空闲</div>
        </div>

        var center_pin = <div class='center' classList={{
            hidden: !this.paint.allow
        }}>
            {this.paint_ev_zone}
            {/* {topic_selector} */}
            {/* {operators} */}
        </div>

        solid.components.push(center_pin);
        solid.components.push(
            indicator
        )

    }

    // async fx() {
    //     // topic_selector_item selected
    //     var particles = [];
    //     this.cloop(() => {
    //         var selected = document.querySelector('.topic_selector_item.selected');
    //         if (selected) {
    //             var rect = selected.getBoundingClientRect();
    //             if (Math.random() < 0.8) {
    //                 particles.push({
    //                     x: rect.left, // + Math.random() * rect.width,
    //                     y: rect.top + Math.random() * rect.height,
    //                     vx: Math.random() * 4,
    //                     vy: 0,
    //                     t: 0,
    //                 })
    //             }
    //         }

    //         particles = particles.filter((p) => {
    //             p.x += p.vx;
    //             p.y += p.vy;
    //             p.t += 0.01;
    //             p.vx *= 0.99;
    //             p.vy *= 0.9;
    //             return p.t < 1;
    //         });

    //         particles.forEach((p) => {
    //             this.main_ctx.fillStyle = `rgba(255, 255, 255, ${Math.pow(1 - p.t, 4)})`;
    //             this.main_ctx.fillRect(p.x, p.y, 2, 2);
    //         });
    //     });
    // }

    async canvas_render() {
        var result_canvas = document.createElement("canvas");
        result_canvas.width = 1024;
        result_canvas.height = 1024;

        var result_ctx = result_canvas.getContext("2d");
        this.cloop(() => {
            if (this.paint.allow_ease < 0.01) {
                result_ctx.clearRect(0, 0, result_ctx.width, result_ctx.height)
                return;
            }
            result_ctx.globalAlpha = (this.comfy.buffer_latest_type == 'latent' || this.paint.drawing) ? 0.06 * this.paint.allow_ease : 0.3 * this.paint.allow_ease;
            result_ctx.drawImage(this.comfy.buffer_latest, 0, 0, result_canvas.width, result_canvas.height);
        });

        this.result_canvas = result_canvas;
        this.result_ctx = result_ctx;
    }

    async create(params) {
        var flow = this.data.flow_obj.flow
        var quality_high = params.quality || false;
        var force = params.force || false;
        var seed = this.data.seed; //params.seed || this.seed; //params.seed || Math.floor(Math.random() * 1e12);

        // var seed = Math.floor(Math.random() * 1e12);
        // console.log(this.state.topic_id, this.data.topics);

        this.data.pos = this.data.topics[this.state.topic_id].pos;
        this.data.neg = this.data.topics[this.state.topic_id].neg;

        flow[this.data.flow_obj.pos_id].inputs.text = this.data.pos
        flow[this.data.flow_obj.neg_id].inputs.text = this.data.neg;

        flow[this.data.flow_obj.seed_id].inputs.seed = seed
        // console.log(seed);

        flow[this.data.flow_obj.img_id].inputs.image = dataURItoBlob(this.c_scribble.toDataURL("image/png", 0.6));
        // console.log("flow", flow);

        var res = this.comfy.prompt_limit(flow, force)
        // console.log('prompt res:', res);
    }

    async create_paint_area() {
        var paint_ev_zone = document.createElement("canvas");
        paint_ev_zone.width = 1024;
        paint_ev_zone.height = 1024;
        paint_ev_zone.style.maxWidth = "65vw"
        paint_ev_zone.style.maxHeight = "65vh"
        paint_ev_zone.style.zIndex = "99999"
        paint_ev_zone.style.opacity = 0;

        // var div = document.createElement("div");
        // div.style.position = "absolute";
        // div.style.top = "50%";
        // div.style.left = "50%";
        // div.style.transform = "translate(-50%, -50%)";

        // paint_ev_zone.style.border = "2px solid red";
        // document.body.appendChild(paint_ev_zone);
        // div.appendChild(paint_ev_zone);
        // document.body.appendChild(div);
        this.paint_ev_zone = paint_ev_zone;
        paint_ev_zone.style.pointerEvents = "all";
        paint_ev_zone.style.touchAction = "none";
        paint_ev_zone.style.userSelect = "none";
        paint_ev_zone.style.webkitUserSelect = "none";

        this.paint_BoundingBox = paint_ev_zone.getBoundingClientRect();
        this.cloop(() => {
            this.paint_BoundingBox = paint_ev_zone.getBoundingClientRect();
            if (this.paint.drawing) {
                this.data.edit_action = Date.now();
            }
        }, {
            interval: 10
        });

        this.paint = createMutable({
            touch: false,
            touch_time: 0,
            allow: false,
            allow_ease: 0,
            drawing: false,
            drawing_pointer: null,
            px: 0,
            py: 0,
            x: 0,
            y: 0,
        });

        this.cloop(t => {
            this.paint.allow_ease = ease(this.paint.allow_ease, this.paint.allow ? 1 : 0, 0.1, 0.01);

            if (Date.now() - this.paint.touch_time > 10000) {
                this.paint.touch = false;
                this.paint.touch_time = Date.now();
            }
        })

        paint_ev_zone.addEventListener("pointerdown", (e) => {
            if (this.paint.allow == false || this.paint.drawing) { return; }
            //capture
            e.stopPropagation();
            e.preventDefault();
            this.paint.touch = true;
            paint_ev_zone.setPointerCapture(e.pointerId);
            this.paint.drawing = true;
            this.paint.touch_time = Date.now();
            this.paint.drawing_pointer = e.pointerId;

            var boundingClientRect = paint_ev_zone.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            var width = boundingClientRect.width;
            var height = boundingClientRect.height;
            x = x / width;
            y = y / height;
            this.paint.x = x;
            this.paint.y = y;
            this.paint.px = this.paint.x;
            this.paint.py = this.paint.y;
            this.bus.emit("paint_start", this.paint);
            this.bus.emit("paint_move", this.paint);
            this.bus.emit("edit");

        });
        paint_ev_zone.addEventListener("pointermove", (e) => {

            if (this.paint.allow == false || !this.paint.drawing || this.paint.drawing_pointer != e.pointerId) { return; }
            //log pointer xy
            this.paint.touch_time = Date.now();
            var boundingClientRect = paint_ev_zone.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            var width = boundingClientRect.width;
            var height = boundingClientRect.height;
            x = x / width;
            y = y / height;
            this.paint.px = this.paint.x;
            this.paint.py = this.paint.y;
            this.paint.x = x;
            this.paint.y = y;
            this.bus.emit("paint_move", this.paint);
            this.bus.emit("edit");
            this.seed += 0.1;
        });
        paint_ev_zone.addEventListener("pointerup", (e) => {
            if (this.paint.allow == false || this.paint.drawing_pointer != e.pointerId) { return; }

            var boundingClientRect = paint_ev_zone.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            var width = boundingClientRect.width;
            var height = boundingClientRect.height;
            x = x / width;
            y = y / height;
            this.paint.x = x;
            this.paint.y = y;
            this.paint.px = this.paint.x;
            this.paint.py = this.paint.y;

            paint_ev_zone.releasePointerCapture(e.pointerId);
            this.paint.drawing = false;
            this.paint.drawing_pointer = null;
            this.bus.emit("paint_end", this.paint);
            this.bus.emit("edit");
        });


    }

    async canvas_scribble() {

        var layer = this.make_layer('scribble');
        var canvas = layer.canvas;
        var canvas_ctx = layer.ctx;

        this.c_scribble = canvas;
        this.c_scribble_ctx = canvas_ctx;

        this.bus.on("paint_start", (paint) => {
            if (this.paint.allow_ease < 0.01) return;
            if (!layer.operating) { return; }
            // console.log("paint_start", paint);

            this.bus.emit("create", {
                force: true,
                quality: false,
            });
        });
        this.bus.on("paint_move", (paint) => {
            if (this.paint.allow_ease < 0.01) return;
            if (!layer.operating) { return; }

            // console.log("paint_move", paint);

            canvas_ctx.strokeStyle = "rgba(255,255,255,0.2)";
            canvas_ctx.lineWidth = 2;

            if (this.state.pen_mode == 0) {
                canvas_ctx.strokeStyle = "rgba(0,0,0,1)";
                canvas_ctx.lineWidth = 4;
            }
            canvas_ctx.beginPath();
            canvas_ctx.moveTo(paint.px * canvas.width, paint.py * canvas.height);
            canvas_ctx.lineTo(paint.x * canvas.width, paint.y * canvas.height);
            canvas_ctx.stroke();
            this.bus.emit("create", {
                force: false,
                quality: false,
            });
        });
        this.bus.on("paint_end", (paint) => {
            if (this.paint.allow_ease < 0.01) return;
            if (!layer.operating) { return; }

            // console.log("paint_end", paint);

            this.bus.emit("create", {
                force: true,
                quality: true,
            });
        });

        this.bus.on("clear", () => {
            canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.bus.emit("create", {
                force: true,
                quality: true,
            });
        });

        this.bus.on("clear_point", () => {
            canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        this.cloop(() => {
            if (this.paint.allow_ease < 0.01) return;

            var active_e = this.state.editing_ease;
            var ctx = this.ctx;
            var width = this.c2d.width;
            var height = this.c2d.height;
            ctx.save();

            ctx.globalAlpha = layer.operating_ease * this.paint.allow_ease;

            var rw = this.paint_BoundingBox.width;
            var rh = this.paint_BoundingBox.height;

            ctx.translate(this.paint_BoundingBox.left + this.paint_BoundingBox.width / 2, this.paint_BoundingBox.top + this.paint_BoundingBox.height / 2);

            ctx.translate(-rw / 2, -rh / 2);
            ctx.strokeStyle = "rgba(234,212,169," + ((Math.sin(this.t * 20) * 0.3 + 0.5) * Math.pow(active_e, 4) * 0.8 + 0.2) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, rw, rh);
            var r = rw / canvas.width;

            ctx.save();
            ctx.lineWidth = 1;
            ctx.globalCompositeOperation = 'lighter'
            var cdata = canvas_ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (var x = 0; x < canvas.width; x += 2) {
                for (var y = 0; y < canvas.height; y += 2) {
                    var a = cdata[(x + y * canvas.width) * 4 + 0];
                    var dx = x * r + r / 2;
                    var dy = y * r + r / 2;
                    var R = Math.pow(a / 255, 1 / 4);
                    R *= Math.pow(0.5 + 0.5 * n3d(
                        dx / 100 + this.t, dy / 100 + this.t, this.t
                    ), 1.5);
                    var alpha = R * (0.1 * active_e + 0.9);
                    R *= r / 2;
                    R += 1;
                    ctx.beginPath();
                    ctx.arc(dx, dy, R, 0, 2 * Math.PI);
                    // ctx.fillStyle = `rgba(255,255,255,${a / 255})`;
                    ctx.fillStyle = `rgba(234,212,169,${Math.min(1, Math.pow(a / 255, 1 / 2) * alpha * 5 + 0.04 * active_e)})`;
                    ctx.fill();
                    if (alpha > 0.1) {
                        ctx.beginPath();
                        ctx.arc(dx, dy, alpha * 2 * (r / 2 + 5), 0, 2 * Math.PI);
                        // ctx.fillStyle = `rgba(255,255,255,${a / 255})`;
                        ctx.strokeStyle = `rgba(234,212,169,${Math.min(1, Math.pow(alpha, 4) * 3)})`;
                        ctx.stroke();
                    }
                }
            }

            // ctx.globalCompositeOperation = 'difference'
            ctx.globalAlpha = active_e * this.paint.allow_ease;
            ctx.drawImage(canvas, 0, 0, rw, rh);

            ctx.restore();
            ctx.restore();
        });


    }
}
Tweaker.type = 'Tweaker';
Tweaker.register();
