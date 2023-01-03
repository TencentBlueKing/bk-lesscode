/**
 * @desc 返回pc端导航布局样式
 * @param { String } layoutType 导航类型
 * @param { String } layoutContent 导航具体配置
 * @returns { String }
 */
export default function (layoutType, layoutContent) {
    let css = `
    .bk-navigation {
        width:auto;
        height:100vh;
        outline:1px solid #ebebeb;
    }
    .bk-navigation .bk-navigation-wrapper {
        height:calc(100vh - 252px)!important;
    }
    .bk-navigation-wrapper .navigation-container .container-content {
        padding: 0px !important;
     }
    .navigation-header {
        -webkit-box-flex:1;
        -ms-flex:1;
        flex:1;
        height:100%;
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -webkit-box-align:center;
        -ms-flex-align:center;
        align-items:center;
        font-size:14px;
    }
    .navigation-header .header-nav {
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        padding:0;
        margin:0;
    }
    .navigation-header .header-title {
        font-size:16px;
    }
    .navigation-header .header-nav-item {
        list-style:none;
        height:50px;
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -webkit-box-align:center;
        -ms-flex-align:center;
        align-items:center;
        margin-right:40px;
        color:#96A2B9;
        min-width:56px
    }
    .navigation-header .header-nav-item:hover {
        cursor:pointer;
        color:#D3D9E4;
    }
    .navigation-header .header-nav-item.item-active {
        color:#FFFFFF !important;
    }
    .navigation-head-nav {
        width:150px;
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -webkit-box-orient:vertical;
        -webkit-box-direction:normal;
        -ms-flex-direction:column;
        flex-direction:column;
        background:#FFFFFF;
        border:1px solid #E2E2E2;
        -webkit-box-shadow:0px 3px 4px 0px rgba(64,112,203,0.06);
        box-shadow:0px 3px 4px 0px rgba(64,112,203,0.06);
        padding:6px 0;
        margin:0;
        color:#63656E;
    }
    .navigation-head-nav .nav-item {
        -webkit-box-flex:0;
        -ms-flex:0 0 32px;
        flex:0 0 32px;
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -webkit-box-align:center;
        -ms-flex-align:center;
        align-items:center;
        padding:0 20px;
        list-style:none
    }
    .navigation-head-nav .nav-item:hover {
        color:#3A84FF;
        cursor:pointer;
        background-color:#F0F1F5;
    }
    .tippy-popper .tippy-tooltip.navigation-message-theme {
        padding:0;
        border-radius:0;
        -webkit-box-shadow:none;
        box-shadow:none;
    }
    .nav-sign-out {
        display: inline-block;
        cursor: pointer;
        background: #FFFFFF;
        border: 1px solid #E2E2E2;
        box-shadow: 0px 3px 4px 0px rgb(64 112 203 / 6%);
        padding: 0 25px;
        line-height: 30px;
    }
    .nav-sign-out:hover {
        color:#3A84FF;
        background-color:#F0F1F5;
    }
    .header-user {
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#96A2B9;
    }
    .header-user:hover {
        color:#D3D9E4;
    }
    .header-user .bk-icon {
        margin-left:5px;
        font-size:12px;
    }
    .white-theme .header-user {
        color: #63656e;
    }
    .white-theme .header-user:hover {
        color: #3a84ff;
    }
    .nav-head-right {
        color: #d3d9e4;
        margin-left: auto;
        display: flex;
        align-items: center;
        cursor: pointer;
    }
`
    // 设置了导航主题色 则添加以下样式
    // if (layoutContent.theme && layoutContent.theme !== '#182132') {
    if (layoutContent.themeConfig) {
        css += `
            .bk-navigation .theme-style {
                color:#FFFFFF;
                opacity:0.86;
                font-weight:normal;
            }
            .title-desc.white-theme-title {
                color:#313238;
                font-weight:normal;
            }
            .white-navigation .theme-style {
                color:#313238;
            }
            .white-navigation .header-user {
                color:#63656E;
            }
            .white-navigation .header-user:hover {
                color:#000000;
            }
            .white-theme-menu .navigation-sbmenu-title-arrow {
                color:#c4c6cc !important;
            }
            .white-theme .title-desc {
                color: #313238;
            }
            .other-theme .title-desc {
                color: #fff;
                opacity: 0.86;
            }
        `

        // 动态设置顶部栏选中、hover样式
        if (['top-bottom', 'complex'].some(val => val === layoutType)) {
            const topMenuBackground = layoutContent.themeConfig?.topMenuBackground || '#182132'
            const topMenuTheme = layoutContent.themeConfig?.topMenuTheme || '#ffffff'
            const isDefaultTheme = topMenuBackground === '#182132' // 默认主题
            const isWhiteTheme = topMenuBackground === '#ffffff' // 白色主题
            const defaultColor = isDefaultTheme ? '#96a2b9' : isWhiteTheme ? '#63656E' : '#ffffffad'
            const activeColor = isDefaultTheme ? '#d3d9e4' : '#ffffffe6'
            const defaultHoverTheme = topMenuTheme === '#ffffff' ? activeColor : `${topMenuTheme}ad`

            if (layoutType === 'top-bottom') {
                css += `
                .header-nav-item {
                    color: ${defaultColor} !important;
                }
                .header-nav-item.item-active,
                .header-nav-item.item-active:hover {
                    color: ${topMenuTheme} !important;
                }
                .header-nav-item:hover {
                    color: ${defaultHoverTheme} !important;
                }
            `
            } else {
                css += `
                .is-complex-item {
                    color: ${defaultColor} !important;
                }
                .is-complex-active,
                .is-complex-active:hover {
                    color: ${topMenuTheme} !important;
                }
                .is-complex-item:hover {
                    color: ${defaultHoverTheme} !important;
                }
            `
            }
        }
    }
    return css
}
