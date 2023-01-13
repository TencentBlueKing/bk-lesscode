/**
 * @desc 返回所有页面都需要内置的样式
 * @param { String } uniqueKey 页面唯一标识
 * @returns { String }
 */
export default function (uniqueKey) {
    return `.bk-layout-row-${uniqueKey} {
        display: flex;
    }
    .bk-layout-row-${uniqueKey}:after {
        display: block;
        clear: both;
        content: "";
        font-size: 0;
        height: 0;
        visibility: hidden;
    }
    .bk-layout-col-${uniqueKey} {
        float: left;
        position: relative;
        min-height: 1px;
    }
    .bk-free-layout-${uniqueKey} {
        height: 500px;
        width: 100%;
        display: inline-block;
        position: relative;
        z-index: 10;
    }
    .bk-free-layout-item-inner-${uniqueKey} {
        height: 100%;
        position: relative;
    }
    [align-horizontal-left] > *,
    [align-horizontal-center] > *,
    [align-horizontal-right] > *,
    [align-horizontal-space-between] > *,
    [align-vertical-top] > *,
    [align-vertical-center] > *,
    [align-vertical-bottom] > *{
        flex-shrink: 0;
    }
    [align-horizontal-left],
    [align-horizontal-center],
    [align-horizontal-right],
    [align-horizontal-space-between]{
        display: flex !important;
        align-items: flex-start;
        flex-wrap: wrap;
    }
    [align-horizontal-left]{
        justify-content: flex-start;
    }
    [align-horizontal-center]{
        justify-content: center;
    }
    [align-horizontal-right]{
        justify-content: flex-end;
    }
    [align-horizontal-space-between]{
        justify-content: space-between;
    }
    [align-vertical-top],
    [align-vertical-center],
    [align-vertical-bottom]{
        display: flex !important;
        flex-wrap: wrap;
    }
    [align-vertical-top]{
        align-items: flex-start;
    }
    [align-vertical-center]{
        align-items: center;
    }
    [align-vertical-bottom]{
        align-items: flex-end;
    }
    [absolute-align-horizontal-left] {
        left: 0 !important;
    }
    [absolute-align-horizontal-center] {
        left: 50% !important;
        transform: translateX(-50%) !important;
    }
    [absolute-align-horizontal-right] {
        left: unset !important;
        right: 0 !important;
    }
    [absolute-align-vertical-top] {
        top: 0 !important;
    }
    [absolute-align-vertical-center] {
        top: 50% !important;
        transform: translateY(-50%) !important;
    }
    [absolute-align-vertical-bottom] {
        top: unset !important;
        bottom: 0 !important;
    }
    [absolute-align-horizontal-center][absolute-align-vertical-center]{
        transform: translate(-50%, -50%) !important;
    }`
}
