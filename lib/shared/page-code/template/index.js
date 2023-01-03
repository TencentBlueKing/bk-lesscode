import getNavigation from './navigation'
import generatePageCode from './page'
import generateNocodePageCode from './nocode-page'

/**
 * @desc 生成template部分、其中template包括导航template跟页面template
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    let pageCode = ''
    if (code.isEmpty) { // 空白页面、404时
        pageCode = '<bk-exception class="exception-wrap-item" type="404"></bk-exception>'
    } else if (code.isGenerateNav) { // 生成项目源码时，导航布局父路由的index.vue为router-view
        pageCode = '<router-view class="page-container"></router-view>'
    } else if (code.nocodeType) { // 表单、流程、markdown类型页面
        pageCode = `\n<section class="bk-layout-custom-component-wrapper container-${code.uniqueKey}">\n${generateNocodePageCode(code)}\n</section>\n`
    } else { // 普通自定义页面
        pageCode = `\n<section class="bk-layout-custom-component-wrapper container-${code.uniqueKey}">\n${generatePageCode(code)}\n</section>\n`
    }
    // 有导航布局，则template为导航+页面主体内容， 空白布局则template为页面主体内容
    const source = code.hasLayout ? getNavigation(code, pageCode) : pageCode
    return '<template>' + source + '\n</template>\n'
}
