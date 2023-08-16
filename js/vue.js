// vue 深层对象检测到并响应
export function hybridObserve(x) {
    if (x.__hobserved) return x;
    Object.defineProperty(x, "__hobserved", {
        enumerable: false,
        writable: false,
        value: 1,
    });
    var mount = reactive({});
    for (var i in x) {
        ((i) => {
            mount[i] = x[i];
            if (typeof mount[i] == "object") {
                hybridObserve(mount[i]);
            }
            Object.defineProperty(x, i, {
                get() {
                    return mount[i];
                },
                set(v) {
                    mount[i] = v;
                },
            });
        })(i);
    }
    return x;
}