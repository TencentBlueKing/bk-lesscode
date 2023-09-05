/**
 * @desc 返回移动端相关导航布局的样式
 * @returns { String }
 */
export default function () {
    const css = `
        .sidebar-layout-wrapper {
            display: flex;
            height: 100%;
        }

        .sidebar-layout-wrapper .van-sidebar {
            flex-shrink: 0;
        }

        .sidebar-layout-wrapper .bk-layout-custom-component-wrapper {
            flex: 1;
        }
    `
    return css
}
