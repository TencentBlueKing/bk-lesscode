/**
 * @desc 布局类型 type 判断
 * @param { String } type
 * @returns { Boolean }
 */
export default function (type) {
    return [
        'root',
        'render-grid',
        'h5-container',
        'h5-page',
        'render-column',
        'render-block',
        'free-layout',
        'widget-form',
        'widget-form-item',
        'widget-tab',
        'widget-van-tab'
    ].includes(type)
}
