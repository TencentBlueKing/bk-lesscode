import LC from '@/element-materials/core'
import store from '@/store'

export default (cmdMessage) => {
    const handleGetHomePageTemplate = () => {
        cmdMessage.value += [
            '',
            '# cmd',
            'You can refer to the following commands to generate a homePage, and You must return all the commands at once:',
            // 设置页面边距
            'cmd: <page.updatePageSetting(\'paddingTop\', \'0\')>',
            'cmd: <page.updatePageSetting(\'paddingLeft\', \'0\')>',
            'cmd: <page.updatePageSetting(\'paddingRight\', \'0\')>',
            // 轮播图
            'cmd: <component.insert(\'render-block\', \'block-3ac58\')>',
            'cmd: <component.insertComponentIntoComponent("block-3ac58", "bk-swiper", "swiper-97fe3")>',
            'cmd: <component.setStyle(\'swiper-97fe3\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'block-3ac58\', \'height\', \'300px\')>',
            'cmd: <component.setStyle(\'block-3ac58\', \'margin-bottom\', \'40px\')>',
            // 产品特性
            'cmd: <component.insert(\'span\', \'text-c88b7\')>',
            'cmd: <component.setSlot(\'text-c88b7\', \'default\', {"format": "value","component": "text","code": "产品特性","payload": {},"valueType": "text","renderValue": "产品特性"})>',
            'cmd: <component.setStyle(\'text-c88b7\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'text-c88b7\', \'text-align\', \'center\')>',
            'cmd: <component.setStyle(\'text-c88b7\', \'font-size\', \'28px\')>',
            'cmd: <component.setStyle(\'text-c88b7\', \'font-weight\', \'700\')>',
            'cmd: <component.setStyle(\'text-c88b7\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-c88b7\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.insert(\'render-block\', \'block-3620a\')>',
            'cmd: <component.setAlign(\'block-3620a\', \'horizontal\', \'align-horizontal-center\')>',
            'cmd: <component.setStyle(\'block-3620a\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.insertComponentIntoComponent("block-3620a", "bk-card", "card-adf1j")>',
            'cmd: <component.insertComponentIntoComponent("block-3620a", "bk-card", "card-sdg23")>',
            'cmd: <component.insertComponentIntoComponent("block-3620a", "bk-card", "card-fgh4e")>',
            'cmd: <component.insertComponentIntoComponent("block-3620a", "bk-card", "card-qwe1f")>',
            `cmd: <component.insertComponentIntoComponent("card-adf1j", ${LC.getFramework() === 'vue2' ? 'bk-image' : 'img'}, "image-gbj1e")>`,
            `cmd: <component.insertComponentIntoComponent("card-sdg23", ${LC.getFramework() === 'vue2' ? 'bk-image' : 'img'}, "image-pk6nd")>`,
            `cmd: <component.insertComponentIntoComponent("card-fgh4e", ${LC.getFramework() === 'vue2' ? 'bk-image' : 'img'}, "image-wg45s")>`,
            `cmd: <component.insertComponentIntoComponent("card-qwe1f", ${LC.getFramework() === 'vue2' ? 'bk-image' : 'img'}, "image-cuq6b")>`,
            'cmd: <component.setStyle(\'image-gbj1e\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'image-gbj1e\', \'height\', \'100%\')>',
            'cmd: <component.setStyle(\'image-pk6nd\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'image-pk6nd\', \'height\', \'100%\')>',
            'cmd: <component.setStyle(\'image-wg45s\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'image-wg45s\', \'height\', \'100%\')>',
            'cmd: <component.setStyle(\'image-cuq6b\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'image-cuq6b\', \'height\', \'100%\')>',
            'cmd: <component.setProp(\'card-adf1j\', \'title\', { renderValue: \'产品特性\' })>',
            'cmd: <component.setProp(\'card-sdg23\', \'title\', { renderValue: \'产品特性\' })>',
            'cmd: <component.setProp(\'card-fgh4e\', \'title\', { renderValue: \'产品特性\' })>',
            'cmd: <component.setProp(\'card-qwe1f\', \'title\', { renderValue: \'产品特性\' })>',
            // 用户案例
            'cmd: <component.insert(\'span\', \'text-jgg76\')>',
            'cmd: <component.setSlot(\'text-jgg76\', \'default\', {"format": "value","component": "text","code": "用户案例","payload": {},"valueType": "text","renderValue": "用户案例"})>',
            'cmd: <component.setStyle(\'text-jgg76\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'text-jgg76\', \'text-align\', \'center\')>',
            'cmd: <component.setStyle(\'text-jgg76\', \'font-size\', \'28px\')>',
            'cmd: <component.setStyle(\'text-jgg76\', \'font-weight\', \'700\')>',
            'cmd: <component.setStyle(\'text-jgg76\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-jgg76\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.insert(\'render-block\', \'block-jh1nb\')>',
            'cmd: <component.setAlign(\'block-jh1nb\', \'horizontal\', \'align-horizontal-center\')>',
            'cmd: <component.setStyle(\'block-jh1nb\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.setStyle(\'block-jh1nb\', \'height\', \'375px\')>',
            'cmd: <component.insertComponentIntoComponent("block-jh1nb", "widget-tab", "tab-wj1gf")>',
            'cmd: <component.select(\'tab-wj1gf\')>',
            'cmd: <component.setStyle(\'tab-wj1gf\', \'width\', \'700px\')>',
            // 开始使用
            'cmd: <component.insert(\'span\', \'text-qhd12\')>',
            'cmd: <component.setSlot(\'text-qhd12\', \'default\', {"format": "value","component": "text","code": "5分钟上手，即刻开启体验","payload": {},"valueType": "text","renderValue": "5分钟上手，即刻开启体验"})>',
            'cmd: <component.setStyle(\'text-qhd12\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'text-qhd12\', \'text-align\', \'center\')>',
            'cmd: <component.setStyle(\'text-qhd12\', \'font-size\', \'28px\')>',
            'cmd: <component.setStyle(\'text-qhd12\', \'font-weight\', \'700\')>',
            'cmd: <component.setStyle(\'text-qhd12\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-qhd12\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.insert(\'render-block\', \'block-b1pxt\')>',
            'cmd: <component.setAlign(\'block-b1pxt\', \'horizontal\', \'align-horizontal-center\')>',
            'cmd: <component.setStyle(\'block-b1pxt\', \'margin-bottom\', \'40px\')>',
            'cmd: <component.insertComponentIntoComponent("block-b1pxt", "bk-button", "button-ij1lp")>',
            'cmd: <component.setProp(\'button-ij1lp\', \'theme\', { renderValue: \'primary\', code: "primary" })>',
            'cmd: <component.setSlot(\'button-ij1lp\', \'default\', {format: "value", component: "text", code: "开始使用", payload: {}, valueType: "text", renderValue: "开始使用"})>',
            // footer
            'cmd: <component.insert(\'render-block\', \'block-hpl9w\')>',
            'cmd: <component.setStyle(\'block-hpl9w\', \'background\', \'#14182F\')>',
            'cmd: <component.setStyle(\'block-hpl9w\', \'color\', \'#fff\')>',
            'cmd: <component.setStyle(\'block-hpl9w\', \'height\', \'300px\')>',
            'cmd: <component.setAlign(\'block-hpl9w\', \'horizontal\', \'align-horizontal-center\')>',
            'cmd: <component.insertComponentIntoComponent("block-hpl9w", "render-block", "block-w29jg")>',
            'cmd: <component.setStyle(\'block-w29jg\', \'width\', \'700px\')>',
            'cmd: <component.setStyle(\'block-w29jg\', \'height\', \'100%\')>',
            'cmd: <component.insertComponentIntoComponent("block-w29jg", "span", "text-yql1j")>',
            'cmd: <component.setStyle(\'text-yql1j\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-yql1j\', \'height\', \'30%\')>',
            'cmd: <component.setStyle(\'text-yql1j\', \'line-height\', \'100px\')>',
            'cmd: <component.setSlot(\'text-yql1j\', \'default\', {"format": "value","component": "text","code": "友情链接：友情链接一        友情链接二        友情链接三","payload": {},"valueType": "text","renderValue": "友情链接：友情链接一        友情链接二        友情链接三"})>',
            'cmd: <component.insertComponentIntoComponent("block-w29jg", "span", "text-lxw2m")>',
            'cmd: <component.setStyle(\'text-lxw2m\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-lxw2m\', \'height\', \'30%\')>',
            'cmd: <component.setStyle(\'text-lxw2m\', \'line-height\', \'100px\')>',
            'cmd: <component.setSlot(\'text-lxw2m\', \'default\', {"format": "value","component": "text","code": "联系我们： 电话-0771-6743211","payload": {},"valueType": "text","renderValue": "联系我们： 电话-0771-6743211"})>',
            'cmd: <component.insertComponentIntoComponent("block-w29jg", "span", "text-co2py")>',
            'cmd: <component.setStyle(\'text-co2py\', \'display\', \'block\')>',
            'cmd: <component.setStyle(\'text-co2py\', \'height\', \'30%\')>',
            'cmd: <component.setStyle(\'text-co2py\', \'line-height\', \'100px\')>',
            'cmd: <component.setSlot(\'text-co2py\', \'default\', {"format": "value","component": "text","code": "Copyright &#169 1998 - 2020 腾讯公司 版权所有","payload": {},"valueType": "text","renderValue": "Copyright &#169 1998 - 2020 腾讯公司 版权所有"})>'
        ].join('\n')
    }

    const handleGetDataSearchPageTemplate = () => {
        cmdMessage.value += [
            '',
            '# cmd',
            'You can refer to the following commands to generate a dataSearchPage, and You must return all the commands at once:',
            'cmd: <component.insert("bk-input", "input-mfp87")>',
            'cmd: <component.insert("widget-bk-table", "table-po49b")>'
        ].join('\n')
    }

    const handleGetDataAnalysisPageTemplate = () => {
        const pieOptions = JSON.stringify({
            'tooltip': {
                'enterable': true
            },
            'series': [
                {
                    'type': 'pie',
                    'color': [
                        '#3A84FF',
                        '#F27051',
                        '#FFB848',
                        '#FFE294',
                        '#85CCA8'
                    ],
                    'data': [
                        {
                            'value': 1233,
                            'name': '2023-01'
                        },
                        {
                            'value': 2458,
                            'name': '2023-02'
                        },
                        {
                            'value': 1115,
                            'name': '2023-03'
                        },
                        {
                            'value': 8222,
                            'name': '2023-04'
                        },
                        {
                            'value': 3,
                            'name': '2023-05'
                        }
                    ]
                }
            ]
        })
        // const barOptions = JSON.stringify({
        //     'tooltip': {
        //         'enterable': true
        //     },
        //     'legend': {
        //         'icon': 'rect',
        //         'bottom': '0',
        //         'itemWidth': 8,
        //         'itemHeight': 2,
        //         'data': [
        //             'issue数量'
        //         ]
        //     },
        //     'xAxis': {
        //         'data': [
        //             '2023-01',
        //             '2023-02',
        //             '2023-03',
        //             '2023-04',
        //             '2023-05'
        //         ]
        //     },
        //     'yAxis': {
        //         'axisLine': {
        //             'lineStyle': {
        //                 'width': 0
        //             }
        //         },
        //         'axisTick': {
        //             'show': false
        //         }
        //     },
        //     'grid': {
        //         'left': '6px',
        //         'right': '40px',
        //         'top': '20px',
        //         'bottom': '10%',
        //         'containLabel': true
        //     },
        //     'calculable': true,
        //     'barMaxWidth': 40,
        //     'series': [
        //         {
        //             'name': '数量',
        //             'type': 'bar',
        //             'color': [
        //                 '#3A84FF'
        //             ],
        //             'data': [
        //                 31232,
        //                 12312,
        //                 8412,
        //                 322,
        //                 32115
        //             ]
        //         }
        //     ]
        // })
        const lineOptions = JSON.stringify({
            'legend': {
                'icon': 'rect',
                'bottom': '0',
                'itemWidth': 8,
                'itemHeight': 2,
                'data': [
                    'issue数量'
                ]
            },
            'tooltip': {
                'enterable': true,
                'trigger': 'axis'
            },
            'calculable': true,
            'boundaryGap': [
                0,
                0.1
            ],
            'xAxis': [
                {
                    'boundaryGap': false,
                    'data': [
                        '2023-01',
                        '2023-02',
                        '2023-03',
                        '2023-04',
                        '2023-05'
                    ]
                }
            ],
            'yAxis': {
                'axisLine': {
                    'lineStyle': {
                        'width': 0
                    }
                },
                'axisTick': {
                    'show': false
                }
            },
            'grid': {
                'left': '6px',
                'right': '40px',
                'top': '20px',
                'bottom': '10%',
                'containLabel': true
            },
            'series': [
                {
                    'name': '第一组数据',
                    'type': 'line',
                    'color': [
                        '#3A84FF'
                    ],
                    'data': [
                        8569,
                        3214,
                        512,
                        8456,
                        5122
                    ]
                },
                {
                    'name': '第二组数据',
                    'type': 'line',
                    'color': [
                        '#F27051'
                    ],
                    'data': [
                        2578,
                        6323,
                        9975,
                        123,
                        2287
                    ]
                },
                {
                    'name': '第三组数据',
                    'type': 'line',
                    'color': [
                        '#FFB848'
                    ],
                    'data': [
                        9632,
                        7895,
                        5627,
                        1495,
                        879
                    ]
                },
                {
                    'name': '第四组数据',
                    'type': 'line',
                    'color': [
                        '#FFE294'
                    ],
                    'data': [
                        3478,
                        8882,
                        1112,
                        9628,
                        7777
                    ]
                }
            ]
        })
        const getContainBlockCMD = (componentId) => {
            return [
                `cmd: <component.insert(\'render-block\', \'${componentId}\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'height\', \'350px\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'width\', \'100%\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'margin-bottom\', \'20px\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'background\', \'#fff\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'padding\', \'20px\')>`
            ]
        }
        const getTitleCMD = (parentComponentId, componentId, text) => {
            return [
                `cmd: <component.insertComponentIntoComponent('${parentComponentId}', \'span\', \'${componentId}\')>`,
                `cmd: <component.setSlot(\'${componentId}\', \'default\', {"format": "value","component": "text","code": "${text}","payload": {},"valueType": "text","renderValue": "${text}"})>`,
                `cmd: <component.setStyle(\'${componentId}\', \'margin-left\', \'10px\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'margin-bottom\', \'10px\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'font-weight\', \'700\')>`,
                `cmd: <component.setStyle(\'${componentId}\', \'font-size\', \'16px\')>`
            ]
        }
        cmdMessage.value += [
            '',
            '# cmd',
            'You can refer to the following commands to generate a dataAnalysisPage, and You must return all the commands at once:',
            // 数据分布图
            ...getContainBlockCMD('block-jhy89'),
            // 数据分布图-title
            ...getTitleCMD('block-jhy89', 'text-jdh72', '数据分布图'),
            // 数据分布图-图表
            'cmd: <component.insertComponentIntoComponent("block-jhy89", "render-block", "block-hgg36")>',
            'cmd: <component.setStyle(\'block-hgg36\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'block-hgg36\', \'height\', \'280px\')>',
            'cmd: <component.setAlign(\'block-hgg36\', \'vertical\', \'align-vertical-top\')>',
            'cmd: <component.insertComponentIntoComponent("block-hgg36", "chart", "chart-w1wf1")>',
            `cmd: <component.setProp(\'chart-w1wf1\', \'options\', { code: ${pieOptions} })>`,
            'cmd: <component.setProp(\'chart-w1wf1\', \'width\', { code: \'400px\' })>',
            'cmd: <component.setProp(\'chart-w1wf1\', \'height\', { code: \'280\' })>',
            'cmd: <component.setStyle(\'chart-w1wf1\', \'width\', \'400px\')>',
            'cmd: <component.setStyle(\'chart-w1wf1\', \'height\', \'280px\')>',
            'cmd: <component.insertComponentIntoComponent("block-hgg36", "widget-bk-table", "table-wd13g")>',
            'cmd: <component.setStyle(\'table-wd13g\', \'width\', \'calc(100% - 420px)\')>',
            'cmd: <component.setStyle(\'table-wd13g\', \'flex\', \'1\')>',
            // // 数据趋势图
            // ...getContainBlockCMD('block-jpp8q'),
            // // 数据趋势图-title
            // ...getTitleCMD('block-jpp8q', 'text-wdf13', '数据趋势图'),
            // // 数据趋势图-图表
            // 'cmd: <component.insertComponentIntoComponent("block-jpp8q", "chart", "chart-as1dw2")>',
            // `cmd: <component.setProp(\'chart-as1dw2\', \'options\', { code: ${barOptions} })>`,
            // 'cmd: <component.setProp(\'chart-as1dw2\', \'width\', { code: \'100%\' })>',
            // 'cmd: <component.setProp(\'chart-as1dw2\', \'height\', { code: \'280\' })>',
            // 'cmd: <component.setStyle(\'chart-as1dw2\', \'width\', \'100%\')>',
            // 'cmd: <component.setStyle(\'chart-as1dw2\', \'height\', \'280px\')>',
            // 多组数据趋势图
            ...getContainBlockCMD('block-yhb2g'),
            // 多组数据趋势图-title
            ...getTitleCMD('block-yhb2g', 'text-jn76g', '多组数据趋势图'),
            // 多组数据趋势图-图表
            'cmd: <component.insertComponentIntoComponent("block-yhb2g", "chart", "chart-ijm6g")>',
            `cmd: <component.setProp(\'chart-ijm6g\', \'options\', { code: ${lineOptions} })>`,
            'cmd: <component.setProp(\'chart-ijm6g\', \'width\', { code: \'100%\' })>',
            'cmd: <component.setProp(\'chart-ijm6g\', \'height\', { code: \'280\' })>',
            'cmd: <component.setStyle(\'chart-ijm6g\', \'width\', \'100%\')>',
            'cmd: <component.setStyle(\'chart-ijm6g\', \'height\', \'280px\')>'
        ].join('\n')
    }

    const handleGetTemplate = (templateType) => {
        switch (templateType) {
            case 'homePage':
                handleGetHomePageTemplate()
                break
            case 'dataSearchPage':
                handleGetDataSearchPageTemplate()
                break
            case 'dataAnalysisPage':
                handleGetDataAnalysisPageTemplate()
                break
        }
    }

    const handleUpdatePageSetting = (key, value) => {
        const styleSetting = Object.assign({}, store.getters['page/pageDetail'].styleSetting, { [key]: value })
        store.commit('page/setPageDetail', {
            ...store.getters['page/pageDetail'],
            styleSetting
        })
        LC.pageStyle = styleSetting
    }

    return {
        handleGetTemplate,
        handleUpdatePageSetting
    }
}
