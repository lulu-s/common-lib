

// noise
import OpenSimplexNoise from "open-simplex-noise";

export var openSimplex = new OpenSimplexNoise();
export function simplexArray2d(width, height, scale) {
    var output = new Array(width);
    for (var x = 0; x < width; x++) {
        output[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            output[x][y] = openSimplex.noise2D(x * scale, y * scale);
        }
    }
    return output;
}

export function simplexArray3d(width, height, depth, scale) {
    var output = new Array(width);
    for (var x = 0; x < width; x++) {
        output[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            output[x][y] = new Array(depth);
            for (var z = 0; z < depth; z++) {
                output[x][y][z] = OpenSimplexNoise.noise3D(x * scale, y * scale, z * scale);
            }
        }
    }
    return output;
};

export function simplexArray4d(width, height, depth, wLength, scale) {
    var output = new Array(width);
    for (var x = 0; x < width; x++) {
        output[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            output[x][y] = new Array(depth);
            for (var z = 0; z < depth; z++) {
                output[x][y][z] = new Array(wLength);
                for (var w = 0; w < wLength; w++) {
                    output[x][y][z][w] = openSimplex.noise4D(x * scale, y * scale, z * scale, w * scale);
                }
            }
        }
    }
    return output;
};

// console.log(simplexArray2d(1000, 1000, 0.01));

export function pickClosest2d(x, y, arr2d) {
    x = Math.floor(x) % arr2d.length;
    x = x < 0 ? x + arr2d.length : x;
    y = Math.floor(y) % arr2d[x].length;
    y = y < 0 ? y + arr2d[x].length : y;
    return arr2d[x][y];
}
