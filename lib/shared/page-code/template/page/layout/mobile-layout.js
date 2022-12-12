import generateLayout from '../layout/index'

/**
 * @desc 生成h5容器类型源码
 * @param { CodeModel } code
 * @param { Array } items 当前h5容器配置
 * @returns { String }
 */
export function generateH5Container (code, item) {
    code.isUseSwiper = true
    /** 根据renderProps获取swiperOption，用于动态配置swiper */
    let swiperOptionsStr = ''
    for (const [key, value] of Object.entries(item.renderProps)) {
        swiperOptionsStr += `${key}: `
        switch (typeof value.renderValue) {
            case 'string':
                swiperOptionsStr += `'${value.renderValue}',\n`
                break
            case 'boolean':
                if (key === 'pagination' && value.renderValue === true) {
                    swiperOptionsStr += '{ el: \'.swiper-pagination\' },\n'
                    break
                }
                swiperOptionsStr += `${value.renderValue},\n`
                break
            case 'number':
                swiperOptionsStr += `${value.renderValue},\n`
        }
    }

    // data中设置相关变量
    code.dataTemplate('swiperOptions', `{
            direction: 'vertical',
            on: {
                init: function () {
                    swiperAni.swiperAnimateCache(this)
                    swiperAni.swiperAnimate(this)
                },
                slideChange: function () {
                    swiperAni.swiperAnimate(this)
                }
            },
            ${swiperOptionsStr}}`)
    
    return `<swiper style="height: 100%" ref="h5-container" :options="swiperOptions">
    ${item.renderSlots && item.renderSlots.default && item.renderSlots.default.map(h5page => {
        const h5Arr = []
        h5Arr.push(h5page)
        return `<swiper-slide>
            ${generateLayout(code, h5Arr)}
         </swiper-slide>`
    }).join('\n')}
        <div class="swiper-pagination" slot="pagination"></div>
    </swiper>`
}
