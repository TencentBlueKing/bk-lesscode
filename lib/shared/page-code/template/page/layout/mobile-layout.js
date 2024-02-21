import generateLayout from '../layout/index'

/**
 * @desc 生成h5容器类型源码
 * @param { CodeModel } code
 * @param { Array } items 当前h5容器配置
 * @returns { String }
 */
export function generateH5Container (code, item) {
    code.setProperty('isUseSwiper', true)
    /** 根据renderProps获取swiperOption，用于动态配置swiper */
    let swiperElementOptionStr = ''
    for (const [key, value] of Object.entries(item.renderProps)) {
        swiperElementOptionStr += code.framework === 'vue3' ? `:${key}=` : `${key}=`
        switch (typeof value.renderValue) {
            case 'string':
                swiperElementOptionStr += `"'${value.renderValue}'" `
                break
            case 'boolean':
                swiperElementOptionStr += `${value.renderValue} `
                break
            case 'number':
                swiperElementOptionStr += `${value.renderValue} `
        }
    }

    return `<swiper-container style="height: 100vh" ref="h5-container" direction="vertical" ${swiperElementOptionStr}>
    ${item.renderSlots && item.renderSlots.default && item.renderSlots.default.map(h5page => {
        const h5Arr = []
        h5Arr.push(h5page)
        return `<swiper-slide>
            ${generateLayout(code, h5Arr)}
         </swiper-slide>`
    }).join('\n')}
        <div class="swiper-pagination" slot="pagination"></div>
    </swiper-container>`
}
