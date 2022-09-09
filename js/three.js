
/* 获取 导入的模型 的某一个属性合集
 * model 模型本体
 * bufferName 获取的属性名称
 * 
 */ 

export function combineBuffer(model, bufferName) {

    let count = 0;
    model.traverse(function (child) {
        if (child.geometry) {
        // if (child.isMesh) {
            const buffer = child.geometry.attributes[bufferName];
            // if (buffer.array.length < 10000) {
            count += buffer.array.length;
            // }

        }
    });

    const combined = new Float32Array(count);
    console.log(count);

    let offset = 0;

    model.traverse(function (child) {

        if (child.geometry) {
            const buffer = child.geometry.attributes[bufferName];
            // if (buffer.array.length < 10000) {

            combined.set(buffer.array, offset);
            offset += buffer.array.length;
            // }

        }
    });

    return new three.BufferAttribute(combined, 3);
}

// combineBuffer 使用方法
function get_point_mesh(){
    let model = null; // 获取的模型
    let positions = combineBuffer(model, 'position');
    const geometry = new three.BufferGeometry();
    geometry.setAttribute('position',  positions);
    let material = new three.PointsMaterial({ size: 0.2, color: 0xffffff });
    let mesh = new three.Points(geometry, material);
    return mesh;
}