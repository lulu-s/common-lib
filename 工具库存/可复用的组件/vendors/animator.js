import { three } from "libao";

function setupModel(data) {
  const model = data.scene;
  model.traverse(v => {
    v.frustumCulled = false;
  });
  const clip = data.animations[0];

  const mixer = new three.AnimationMixer(model);
  const action = mixer.clipAction(clip);
  // action.timeScale = 1;
  action.play();


  action.time = Math.random() * clip.duration;
  console.log(clip.duration);

  model.tick = (delta) => mixer.update(delta);
  model.clear = (time) => {
    action.time = time;
    // console.log("clear?");
  }
  return model;
}

function loadAnimators(models) {
  // const models = assets.animation.data
  let gps = [];
  models.forEach(model => {
    gps.push(setupModel(model))
  });
  return gps;
}

const clock = new three.Clock();

class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.num = -1;
    // this.defs=[0,1,2,3,4,5,6,7,8];
    // this.defs = [1, 4, 5] // 不需要进行 pick 特定播放的动画
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      this.tick(); // 全部一起动
      this.pick();
      // this.def();
      // render a frame
      // this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    for (const object of this.updatables) {
      object.clear(0);
    }
    this.renderer.setAnimationLoop(null);
  }

  pick() {
    if (this.num < 0) return;
    const delta = clock.getDelta();
    this.updatables[this.num].tick(delta);
  }

  def() {
    const delta = clock.getDelta();
    this.defs.forEach((v) => {
      this.updatables[v].tick(delta);
    })
  }

  tick() {
    // only call the getDelta function once per frame!
    const delta = clock.getDelta();

    // console.log(
    //   `The last frame rendered in ${delta * 1000} milliseconds`,
    // );

    for (const object of this.updatables) {
      object.tick(delta);
    }
  }
}

export function initAnimators(
  _models,
  group, 
  camera, scene, renderer
) {
  console.log(_models);
  if(_models == null || _models == undefined) return;
  const models = loadAnimators(_models);
  // window.three = three;
  var loop_model = new Loop(camera, scene, renderer);
  // models[3].children[0].scale.set(0.6, 0.6, 0.6)
  loop_model.updatables.push(...models);
  group.add(...models)
  loop_model.start();
  return loop_model;
}