
import { c_three_cam_rig, meshline, three } from "@emergelab/unv-core/packs/three/ref";
import { c_three_object, c_three_renderer, threeDebugCube, threeExpandShaderIncludes, threeGeneratePMREM, threeLoadGLTF, threeLoadRGBE, threeLoadTexture, threeLoadTextureNoWait } from "@emergelab/unv-core/packs/three";
import { _, cs_get, cs_get_comp, ease } from "@emergelab/unv-core"
import { createMutable } from "solid-js/store"
import "./model.less"

import { Solid_app } from "@emergelab/unv-core/packs/solid";
import { Settings } from "../tiny";


export class FX_Model extends c_three_object {
    constructor(opts) {
        super(opts);
        this.data = _.merge(this.data, {
            mode: 'scene',
            scene: '',
            selected: 1,
            line: 1,
            picked: {
                id: '',
                group: ''
            }
        });
        this.data = createMutable(
            this.data
        );
        this.local = createMutable({
            now: 0,
            last_time: 0,
            offset: 0,
            line: 1,
            no_user_ctl: false
        })
        this.edit('line')
        // this.edit('floor', {}, this.state)
        this.edit('selected')
        this.edit('offset', { min: 0, max: 1, step: 0.01 }, this.local)
    }
    async async_ctor() {
        await super.async_ctor();

        this.solid = cs_get_comp(Solid_app)
        this.rndr = cs_get_comp(c_three_renderer);
        this.st = cs_get_comp(Settings);
        this.camera = cs_get_comp(c_three_cam_rig)

        this.control_camera();


        await this.init_material();
        await this.load_model();
        this.make_lights();


        window.data = this.data;
        window.local = this.local;
    }


    def_camera = {
        rot: -2.198634338378906,
        tilt: -0.7270942687988282,
        dist: 283.22528656005863,
        ref_pos: {
            'y': 0,
            x: 0,
            z: 0
        }
    }
    control_camera() {
        // 相机转动
        var prev_selected = '';
        this.cloop((t) => {
            // 切换地块
            if (this.data.selected != prev_selected) {
                prev_selected = this.data.selected

                var ctl = this.data.blocks.find(l => l.id == this.data.selected).camera;

                if (!ctl) return;

                this.camera.data.rot = ctl.rot || this.def_camera.rot
                this.camera.data.dist = ctl.dist || this.def_camera.dist
                this.camera.data.tilt = ctl.tilt || this.def_camera.tilt
                this.camera.data.ref_pos.z = ctl?.ref_pos?.z || this.def_camera.ref_pos.z
                this.camera.data.ref_pos.y = ctl?.ref_pos?.y || this.def_camera.ref_pos.y
                this.camera.data.ref_pos.x = ctl?.ref_pos?.x || this.def_camera.ref_pos.x
            }
        })
    }


    update_line(id, update_time = true) {
        var path = this.data.paths.find(v => v.id == id)
        console.log(path);
        if (path) {
            this.data.line = path.id;
            console.log(this.data.line);
            this.data.selected = path.block
            if (update_time) this.local.last_time = Date.now()
        }
    }


    async load_model() {
        var model = await threeLoadGLTF(this.data.model || 'assets/model/hrz2-1.glb');
        model = model.scene
        window.model = model
        this.model = model;

    
        model.traverse(async (v) => {
            v.castShadow = true;
            v.receiveShadow = true;

            if (!v.material) return;

            v.material = this.def;
        })
        this.g.add(model)


    }

    // 材质库
    async init_material() {

        var pmrem = await threeLoadRGBE("./assets/env/lakes_1k.hdr");
        // var pmrem = await threeLoadRGBE("./assets/env/blur-tiny.hdr");
        // var pmrem = await threeLoadTexture("./assets/env/sunsetmoon02.jpg");
        var p = threeGeneratePMREM(pmrem, this.rndr.renderer);
        this.pmrem = p;

        // var uniforms = {
        // }




        this.replacer = {};
        // this.replacer['00002'] = new three.MeshBasicMaterial({ color: 0xff0000 });
        // this.replacer['00003'] = new three.MeshBasicMaterial({ color: 0x00ff00 });
        this.replacer['Material.009'] = new three.MeshBasicMaterial({ color: 0x00eeff });
        // this.replacer['Material.007'] = new three.MeshBasicMaterial({ color: 0xffff00 });
        // this.replacer['Material.010'] = new three.MeshBasicMaterial({ color: 0xffffff });
        // this.replacer['Material'] = new three.MeshBasicMaterial({ color: 0xff00ff });
        // this.replacer['Material.006'] = new three.MeshBasicMaterial({ color: 0x0000ff });


        // 地板
        this.replacer['00002'] = new three.MeshPhysicalMaterial({
            color: 0xfefefe, metalness: 0.1, roughness: 1,
            // emissive: 0xffffff,
            // // emissiveIntensity: 0.4,
            // clearcoat: 1,
            // clearcoatRoughness: 0.1,
            // envMapIntensity: 0.2,
            // envMap: this.pmrem.texture
        });
        this.replacer['00003'] = new three.MeshPhysicalMaterial({
            color: 0xe0e0e0, metalness: 0.2, roughness: 0.9,
            // envMapIntensity: 1,
            // envMap: this.pmrem.texture,
        });

        // 河
        this.replacer['Material.010'] = new three.MeshPhysicalMaterial({
            color: 0x3a9aff, metalness: 0.3, roughness: 1,
        });

        // // 地板
        // this.replacer['Material.007'] = new three.MeshPhysicalMaterial({
        //     color: 0x0, metalness: 0.1, roughness: 0.9,
        // });

        // 山
        this.replacer['Material'] = new three.MeshPhysicalMaterial({
            // color: 0x13bf33, metalness: 0.1, roughness: 0.9,
            // color: 0x348920, metalness: 0.1, roughness: 0.9,
            color: 0xaaffee, metalness: 0.1, roughness: 0.9,
        });

        // 路线？
        this.replacer['Material.006'] = new three.MeshBasicMaterial({
            // transparent: true,
            // emissive: 0x0070f0,
            emissiveIntensity: 2,
            color: 0x0070f0,
            // blending: three.AdditiveBlending
        });

        // 井眼
        this.replacer['Material.009'] = new three.MeshPhysicalMaterial({
            color: 0xffffff, metalness: 0.5, roughness: 0.9,
            emissive: 0xffffff,
            emissiveIntensity: 1,
            envMapIntensity: 0.4,
            envMap: this.pmrem.texture
        });

        // this.def = new three.MeshPhysicalMaterial({
        //     color: 0xffffff, metalness: 0.5, roughness: 0.9,
        //     clearcoat: 1,
        //     clearcoatRoughness: 0.6,
        //     sheen: 1,
        //     reflectivity: 1,
        //     sheenColor: 0x33ffff,
        //     sheenRoughness: 0,
        //     envMapIntensity: 0,
        //     envMap: this.pmrem.texture,
        // });
        this.def = new three.MeshPhysicalMaterial({
            // color: 0x9fbfef, metalness: 0, roughness: 0.7,
            color: 0xffffff, metalness: 0, roughness: 0.7,
            sheenColor: 0x33ffff,
            sheenRoughness: 0,
            // transparent: 1,
            specularIntensity: 0,
            reflectivity: 0,
            // opacity: 0.9,
            envMapIntensity: 1.3,
            envMap: this.pmrem.texture,
        });

        var plane = new three.Mesh(
            new three.PlaneGeometry(100, 100, 1, 1),
            new three.MeshPhysicalMaterial({
                color: 0xefefef
            })
        )
        plane.rotation.x = - Math.PI / 2;
        plane.position.y = -0.35;
        this.g.add(plane)

    }

    make_lights() {
        this.sun_g = new three.Group();

        for (var i = 0; i < 3; i++) {
            var light = new three.DirectionalLight(0xfbfeff, 0.2);
            this.rndr.renderer.shadowMap.type = three.PCFSoftShadowMap;
            light.castShadow = true;
            light.position.set(100, 150, -100); // default camera
            light.position.add(
                (new three.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                )).multiplyScalar(130)
            )
            // light.position.set(100, 100, 100);
            //Set up shadow properties for the light
            light.shadow.camera.top = 5;
            light.shadow.camera.right = 5;
            light.shadow.camera.bottom = -5;
            light.shadow.camera.left = -5;
            light.shadow.camera.near = 100;
            light.shadow.camera.far = 300;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            // light.shadow.bias = -0.002;
            this.sun_g.add(light);

        }


        var light = new three.DirectionalLight(0xffffff, 0.2);
        this.rndr.renderer.shadowMap.type = three.PCFSoftShadowMap;
        light.castShadow = false;
        light.position.set(100, 120, -100); // default camera
        // light.position.set(100, 100, 100);
        //Set up shadow properties for the light
        light.shadow.camera.top = 5;
        light.shadow.camera.right = 5;
        light.shadow.camera.bottom = -5;
        light.shadow.camera.left = -5;
        light.shadow.camera.near = 100;
        light.shadow.camera.far = 300;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        // light.shadow.bias = -0.002;
        this.sun_g.add(light);

        // var rect = new three.RectAreaLight(0x90a0cf, 0.6, 100, 100);
        // rect.rotation.x = -Math.PI / 2;
        // rect.position.y = +30
        // this.sun_g.add(rect);

        this.g.add(this.sun_g);


        var light2 = new three.HemisphereLight(0x77bbff, 0xffffff, 2)
        this.g.add(light2)
    }

}
FX_Model.type = "FX_Model";
FX_Model.register();
