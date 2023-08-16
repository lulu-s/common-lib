/**
 * 
 * @param {dom} parent 
 * @param {dom} dom 
 * @returns 可视化范围 true / false
 * @example 
 *  var last_date = Date.now();
 * 
 *  ... loop
 *  if (Date.now() - last_date > 200) {
 *      var flag = isInViewPortOfTwo(this.parent_dom, dom)
 *      last_date = Date.now();
 *  }
 * ... loop_end
 */
export function isInViewPortOfTwo(parent, dom) {
    const parentView = parent ? parent.getBoundingClientRect() : {
        left: 0
    };
    let parentViewWidth = parent
        ? parentView.width
        : window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    const left =
        dom.getBoundingClientRect() && dom.getBoundingClientRect().left - parentView.left; // 减去父级的左侧偏移

    // console.log(left, parentViewWidth, left < parentViewWidth && left > -1, parentViewWidth, parentView.left);
    return (
        left < parentViewWidth && left > -1
    );
}