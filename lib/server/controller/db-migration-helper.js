/* eslint-disable no-unused-vars */

import { walkGrid, uuid } from '../util'
import { METHODS_WITHOUT_DATA, parseValue2UseScheme } from '../../shared/api'
import { getConnection, getRepository, IsNull } from 'typeorm'
import ApiMigraion from '../model/entities/api-migration'
import Project from '../model/entities/project'
import ProjectVersion from '../model/entities/project-version'
import { logger } from '../logger'
import { initResources } from '../initResources'
import Page from '../model/entities/page'
import PageTemplate from '../model/entities/page-template'
import PageTemplateCategory from '../model/entities/page-template-category'
import Layout from '../model/entities/layout'
import LayoutInst from '../model/entities/layout-inst'
import ProjectFuncGroup from '../model/entities/project-func-group'
import FuncGroup from '../model/entities/func-group'
import Func from '../model/entities/func'
import ApiCategory from '../model/entities/api-category'
import Form from '../model/entities/form'
import DataTable from '../model/entities/data-table'
import { IAM_PROVIDER_HOST } from '../conf/iam'
import { IAM_APP_PERM_RESOURCE_TYPE_ID, IAM_APP_PERM_INSTANCE_SELECTION_ID, IAM_ACTION_TYPE, IAM_APP_PERM_BUILDIN_ACTION } from '../../shared/constant.js'
import IamAppPerm from '../model/entities/iam-app-perm'
import IamAppPermAction from '../model/entities/iam-app-perm-action'
import Api from '../model/entities/api'

// 将函数名称写到这个数组里，函数会自动执行，返回成功则后续不会再执行
// ** 注意： walkGrid方法已经失效，请勿再使用此方法刷数据 **
const apiArr = [
    'setDefaultPageTemplateCategory',
    'updateCardSlot',
    'fixCardsSlots',
    'templateCardsSlots',
    'setProjectMobileLayoutInst',
    'syncPageData',
    'syncFuncData',
    'modifyPageData0518',
    'syncFuncParams',
    'initPageTemplateAndFuncMarket',
    'updateFormTableName',
    'transformBkTable',
    'transformEventAndSelect',
    'transformTemplateEventAndSelect',
    'updateLayoutThemeData',
    'newTransformFuncParams',
    'insertLayoutTypeInLayoutInst',
    'initIamAppPermData',
    'modifySelectKeys',
    'updateBkChartRemoteOption',
    'updateFunctionUrl'
]

export const executeApi = async () => {
    const apiRecords = await getRepository(ApiMigraion).find()
    apiArr.forEach(async api => {
        if (!apiRecords.find(item => item.name === api)) {
            const res = await getRepository(ApiMigraion).save([{ name: api }])
            const id = res[0] && res[0].id
            // eslint-disable-next-line no-eval
            const result = await eval(`${api}('${api}')`)
            if (result && result.code === 0) {
                console.log(result.message)
            } else {
                console.log(result.message)
                const deleteRes = await getRepository(ApiMigraion).delete({ id })
                console.log(deleteRes, 'delete')
            }
        }
    })
}

/**
 * 为老项目设置页面模板的默认类别
 */
async function setDefaultPageTemplateCategory (apiName) {
    const projectRepo = getRepository(Project)
    try {
        await getConnection().transaction(async transactionalEntityManager => {
            const projectList = await projectRepo.find()

            const PageTemplateCategoryList = projectList.map(project => {
                const { id, createTime, updateTime, createUser, updateUser } = project
                return {
                    name: global.i18n.t('默认分类'),
                    belongProjectId: id,
                    createTime,
                    updateTime,
                    createUser,
                    updateUser
                }
            })
            await transactionalEntityManager.save(PageTemplateCategory, PageTemplateCategoryList)
        })
        return {
            code: 0,
            message: `${apiName}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${apiName}: ${err.message || err}`
        }
    }
}

async function updateCardSlot () {
    try {
        const pageRepository = getRepository(Page)
        const allPageData = await pageRepository.find()
        allPageData.forEach(page => {
            let targetData = []
            try {
                targetData = (typeof page.content) === 'string' ? JSON.parse(page.content) : page.content
            } catch (err) {
                targetData = []
            }
            if (!targetData || targetData === 'null') {
                logger.warn('targetData does not exist or is \'null\'')
                targetData = []
            }

            (targetData || []).forEach((grid, index) => {
                const callBack = (component) => {
                /** renderSlots如果没有header，证明是旧数据，应该格式化其结构 */
                    if (component.type === 'bk-card' && component.renderSlots.header === undefined) {
                        const originValue = component.renderProps.title.val
                        component.renderProps['disable-header-style'] = { 'type': 'hidden', 'val': true, 'payload': {}, 'attrs': [] }
                        component.renderSlots = {
                            'default': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {

                                    },
                                    'renderStyles': {
                                        'height': '200px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [

                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    'componentId': 'free-layout-247bde35'
                                }
                            },
                            'header': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {
                                        'no-response': true
                                    },
                                    'renderStyles': {
                                        'height': '50px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [
                                                        {
                                                            'componentId': 'text-28a11b0c',
                                                            'tabPanelActive': 'styles',
                                                            'renderKey': 'dcadd06d',
                                                            'name': 'text',
                                                            'type': 'span',
                                                            'renderProps': {
                                                                'inFreeLayout': {
                                                                    'val': true
                                                                },
                                                                'title': {
                                                                    'type': 'string',
                                                                    'val': '',
                                                                    'payload': {

                                                                    },
                                                                    'attrs': [

                                                                    ]
                                                                }
                                                            },
                                                            'renderStyles': {
                                                                'display': 'inline-block',
                                                                'fontSize': '16px',
                                                                'textAlign': 'center',
                                                                'top': '12px',
                                                                'left': '7px'
                                                            },
                                                            'renderEvents': {

                                                            },
                                                            'interactiveShow': false,
                                                            'isComplexComponent': false,
                                                            'renderDirectives': [

                                                            ],
                                                            'renderSlots': {
                                                                'default': {
                                                                    'name': 'text',
                                                                    'type': 'text',
                                                                    'displayName': global.i18n.t('文本配置'),
                                                                    'val': originValue,
                                                                    'regExp': {

                                                                    },
                                                                    'regErrorText': global.i18n.t('文本配置不能为空')
                                                                }
                                                            },
                                                            'isCustomComponent': false
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    'componentId': 'free-layout-653078f9',
                                    'renderKey': '8bf3d94e'
                                }
                            },
                            'footer': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {

                                    },
                                    'renderStyles': {
                                        'height': '50px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [

                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                walkGrid(targetData, grid, callBack, callBack, index)
            })
            page.content = JSON.stringify(targetData)
            page.updateBySystem = true
        })

        await pageRepository.save(allPageData)
        return {
            code: 0,
            message: global.i18n.t('card存量数据更新成功')
        }
    } catch (error) {
        return {
            code: -1,
            message: error.message || error,
            data: null
        }
    }
}

async function fixCardsSlots () {
    try {
        const pageRepository = getRepository(Page)
        const allPageData = await pageRepository.find()
        allPageData.forEach(page => {
            let targetData = []
            try {
                targetData = (typeof page.content) === 'string' ? JSON.parse(page.content) : page.content
            } catch (err) {
                targetData = []
            }
            if (!targetData || targetData === 'null') {
                logger.warn('targetData does not exist or is \'null\'')
                targetData = []
            }

            (targetData || []).forEach((grid, index) => {
                const callBack = (component) => {
                /** 对card的componentId做唯一处理 */
                    if (component.type === 'bk-card') {
                        const slots = component.renderSlots
                        const headerSlot = slots.header.val.renderSlots.default.val[0].children[0]
                        slots.default.val.componentId = `free-layout-${uuid()}`
                        slots.header.val.componentId = `free-layout-${uuid()}`
                        slots.footer.val.componentId = `free-layout-${uuid()}`
                        if (headerSlot) {
                            headerSlot.componentId = `text-${uuid()}`
                            headerSlot.renderStyles.textAlign = 'left'
                        }
                    }
                }
                walkGrid(targetData, grid, callBack, callBack, index)
            })
            page.content = JSON.stringify(targetData)
            page.updateBySystem = true
        })

        await pageRepository.save(allPageData)
        return {
            code: 0,
            message: global.i18n.t('card修复成功')
        }
    } catch (error) {
        console.log(error)
        return {
            code: -1,
            message: error.message || error,
            data: null
        }
    }
}

async function templateCardsSlots () {
    try {
        const templateRepository = getRepository(PageTemplate)
        const allTemplateData = await templateRepository.find()

        allTemplateData.forEach(template => {
            let targetData = {}
            try {
                targetData = JSON.parse(template.content || '{}')
                if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                    targetData = {}
                }
            } catch (err) {
                targetData = {}
            }
            const targetList = [targetData]

            targetList.forEach((grid, index) => {
                const callBack = (component) => {
                /** renderSlots如果没有header，证明是旧数据，应该格式化其结构 */
                    if (component.type === 'bk-card' && component.renderSlots.header === undefined) {
                        const originValue = component.renderProps.title.val
                        component.renderProps['disable-header-style'] = { 'type': 'hidden', 'val': true, 'payload': {}, 'attrs': [] }
                        component.renderSlots = {
                            'default': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {

                                    },
                                    'renderStyles': {
                                        'height': '200px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [

                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    'componentId': `free-layout-${uuid()}`
                                }
                            },
                            'header': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {
                                        'no-response': true
                                    },
                                    'renderStyles': {
                                        'height': '50px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [
                                                        {
                                                            'componentId': `text-${uuid()}`,
                                                            'tabPanelActive': 'styles',
                                                            'renderKey': 'dcadd06d',
                                                            'name': 'text',
                                                            'type': 'span',
                                                            'renderProps': {
                                                                'inFreeLayout': {
                                                                    'val': true
                                                                },
                                                                'title': {
                                                                    'type': 'string',
                                                                    'val': '',
                                                                    'payload': {

                                                                    },
                                                                    'attrs': [

                                                                    ]
                                                                }
                                                            },
                                                            'renderStyles': {
                                                                'display': 'inline-block',
                                                                'fontSize': '16px',
                                                                'textAlign': 'center',
                                                                'top': '12px',
                                                                'left': '7px'
                                                            },
                                                            'renderEvents': {

                                                            },
                                                            'interactiveShow': false,
                                                            'isComplexComponent': false,
                                                            'renderDirectives': [

                                                            ],
                                                            'renderSlots': {
                                                                'default': {
                                                                    'name': 'text',
                                                                    'type': 'text',
                                                                    'displayName': global.i18n.t('文本配置_0'),
                                                                    'val': originValue,
                                                                    'regExp': {

                                                                    },
                                                                    'regErrorText': global.i18n.t('文本配置不能为空_0')
                                                                }
                                                            },
                                                            'isCustomComponent': false
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    'componentId': `free-layout-${uuid()}`
                                }
                            },
                            'footer': {
                                'name': 'layout',
                                'type': 'free-layout',
                                'display': 'hidden',
                                'val': {
                                    'name': 'free-layout',
                                    'type': 'free-layout',
                                    'slotName': '',
                                    'slotContainer': true,
                                    'renderProps': {

                                    },
                                    'renderStyles': {
                                        'height': '50px',
                                        'pointer-events': 'auto'
                                    },
                                    'renderEvents': {

                                    },
                                    'renderDirectives': [

                                    ],
                                    'renderSlots': {
                                        'default': {
                                            'type': 'free-layout-item',
                                            'val': [
                                                {
                                                    'children': [

                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    'componentId': `free-layout-${uuid()}`
                                }
                            }
                        }
                    }
                }
                walkGrid(targetList, grid, callBack, callBack, index)
            })

            template.content = JSON.stringify(targetList[0])
            template.updateBySystem = true
        })

        await templateRepository.save(allTemplateData)
        return {
            code: 0,
            message: global.i18n.t('模板card旧数据更新成功')
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error.message || error,
            data: null
        }
    }
}

const checkPageDataVersion = (data) => {
    if (data.length < 1) {
        return 'v2'
    }
    const rootLayout = data.slice(-1)[0]
    if (!rootLayout.renderSlots) {
        return 'v0'
    }
    if (rootLayout.type === 'render-grid') {
        return rootLayout.renderSlots.default.hasOwnProperty('val') ? 'v1' : 'v2'
    } else if (rootLayout.type === 'bk-sideslider') {
        return rootLayout.renderSlots.content.hasOwnProperty('val') ? 'v1' : 'v2'
    } else if (rootLayout.type === 'free-layout') {
        return rootLayout.renderSlots.default.hasOwnProperty('val') ? 'v1' : 'v2'
    } else if (rootLayout.type === 'bk-dialog') {
        return rootLayout.renderSlots.default.hasOwnProperty('val') ? 'v1' : 'v2'
    }
    return 'v2'
}

const tansformPageData = (parentNode, data) => {
    return data.map((curDataNode, index) => {
        if (!curDataNode) {
            return null
        }
        curDataNode.complex = Boolean(curDataNode.isComplexComponent)
        curDataNode.interactive = ['bk-sideslider', 'bk-dialog'].includes(curDataNode.type)
        curDataNode.custom = Boolean(curDataNode.isCustomComponent)

        if (curDataNode.type === 'render-grid') {
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.default
                && curDataNode.renderSlots.default.val) {
                const columnList = curDataNode.renderSlots.default.val
                curDataNode.renderSlots = {
                    default: []
                }
                const spanNums = columnList.reduce((result, item) => {
                    const span = item.span || 1
                    return result + span
                }, 0)
                columnList.forEach((columnItem, index) => {
                    const uid = `${uuid()}${index}`
                    const span = columnItem.span || 1
                    const columnData = {
                        tabPanelActive: 'props',
                        componentId: `column-${uid}`,
                        name: 'render-column',
                        type: 'render-column',
                        renderStyles: {
                            paddingTop: '5px',
                            paddingRight: '5px',
                            paddingBottom: '5px',
                            paddingLeft: '5px',
                            minHeight: '80px',
                            width: `${span / spanNums * 100}%`
                        },
                        renderProps: {
                            span: {
                                format: 'value',
                                code: span,
                                valueType: 'number',
                                payload: {},
                                renderValue: span
                            }
                        },
                        renderSlots: {
                            default: tansformPageData(curDataNode, columnItem.children)
                        },
                        renderDirectives: [],
                        renderEvents: {},
                        complex: false,
                        interactive: false,
                        custom: false
                    }
                    curDataNode.renderSlots.default.push(columnData)
                })
            }
        } else if (curDataNode.type === 'widget-form') {
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.default
                && curDataNode.renderSlots.default.val) {
                const formItemList = curDataNode.renderSlots.default.val
                curDataNode.renderSlots = {
                    default: []
                }
                formItemList.forEach((formItem) => {
                    const formItemData = {
                        tabPanelActive: 'props',
                        componentId: formItem.componentId,
                        name: 'form-item',
                        type: 'widget-form-item',
                        renderStyles: formItem.renderStyles,
                        renderProps: Object.keys(formItem.renderProps || {}).reduce((result, name) => {
                            const {
                                type,
                                val
                            } = formItem.renderProps[name]
                            result[name] = {
                                format: 'value',
                                code: val,
                                payload: {},
                                valueType: type,
                                renderValue: val
                            }
                            return result
                        }, {}),
                        renderSlots: {
                            default: tansformPageData(curDataNode, formItem.renderSlots.default.val)
                        },
                        renderDirectives: [],
                        renderEvents: {},
                        complex: false,
                        interactive: false
                    }
                    // console.log('from print form item == ', formItemData)
                    curDataNode.renderSlots.default.push(formItemData)
                })
            }
        } else if (curDataNode.type === 'free-layout') {
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.default
                && Array.isArray(curDataNode.renderSlots.default.val)) {
                const freelayoutItem = curDataNode.renderSlots.default.val[0] || []
                let freelayoutSlot = []
                if (freelayoutItem && freelayoutItem.children) {
                    freelayoutSlot = tansformPageData(curDataNode, freelayoutItem.children)
                }
                curDataNode.renderSlots = {
                    default: freelayoutSlot
                }
            }
        } else if (curDataNode.type === 'bk-sideslider') {
            curDataNode.interactive = true
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.content
                && curDataNode.renderSlots.content.val) {
                const child = curDataNode.renderSlots.content.val
                curDataNode.renderSlots = {
                    content: tansformPageData(curDataNode, [child])[0]
                }
            }
        } else if (curDataNode.type === 'bk-dialog') {
            curDataNode.interactive = true
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.default
                && curDataNode.renderSlots.default.val) {
                const child = curDataNode.renderSlots.default.val
                curDataNode.renderSlots = {
                    default: tansformPageData(curDataNode, [child])[0]
                }
            }
        } else if (curDataNode.type === 'bk-card') {
            if (curDataNode.renderSlots) {
                const renderSlots = curDataNode.renderSlots
                curDataNode.renderSlots = {
                    header: tansformPageData(curDataNode, [renderSlots.header.val])[0],
                    default: tansformPageData(curDataNode, [renderSlots.default.val])[0],
                    footer: tansformPageData(curDataNode, [renderSlots.footer.val])[0]
                }
            }
        } else if (curDataNode.type === 'el-card') {
            if (curDataNode.renderSlots
                && curDataNode.renderSlots.default
                && curDataNode.renderSlots.default.val) {
                const child = curDataNode.renderSlots.default.val
                curDataNode.renderSlots = {
                    default: tansformPageData(curDataNode, [child])[0]
                }
            }
        }

        // 转换 renderStyles
        if (['render-grid', 'free-layout'].includes(curDataNode.type)) {
            if (index < data.length - 1) {
                curDataNode.renderStyles = {
                    marginBottom: '10px',
                    ...curDataNode.renderStyles
                }
            }
        } else {
            if (parentNode.type === 'render-grid') {
                curDataNode.renderStyles = {
                    marginTop: '5px',
                    marginRight: '5px',
                    marginBottom: '5px',
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                    ...curDataNode.renderStyles
                }
            }
        }
        if (curDataNode.type === 'bk-button' && parentNode.type === 'widget-form') {
            curDataNode.renderStyles = {
                display: 'inline-block',
                margin: '',
                marginLeft: index > 0 ? '10px' : '',
                ...curDataNode.renderStyles
            }
        }

        // 转换 renderProps
        const origanlRenderProps = curDataNode.renderProps || {}
        curDataNode.renderProps = Object.keys(origanlRenderProps).reduce((result, propName) => {
            const prop = origanlRenderProps[propName]
            let renderValue = prop.val
            if (prop.type !== 'string' && renderValue === '') {
                renderValue = undefined
            }

            if (propName === 'no-response') {
                // fix: 老数据 renderProps.no-response 格式不规范的问题
                result[propName] = {
                    format: 'value',
                    code: prop,
                    payload: {},
                    valueType: 'boolean',
                    renderValue: prop
                }
            } else {
                const valueType = Array.isArray(prop.type) ? prop.type[0] : prop.type
                result[propName] = {
                    format: 'value',
                    code: prop.val,
                    payload: prop.payload || {},
                    valueType,
                    renderValue
                }
            }

            return result
        }, {})
        // prop 还需要解析 renderDirectives 中 v-bind 的关联数据
        ;(curDataNode.renderDirectives || []).forEach(directive => {
            if (directive.type === 'v-bind'
                && directive.val
                 && curDataNode.renderProps[directive.prop]) {
                const renderProp = origanlRenderProps[directive.prop]
                const valueType = Array.isArray(renderProp.type) ? renderProp.type[0] : renderProp.type
                curDataNode.renderProps[directive.prop] = {
                    format: directive.valType,
                    code: directive.val,
                    payload: {},
                    valueType,
                    renderValue: renderProp.val
                }
            }
        })

        // 转换 renderDirectives
        curDataNode.renderDirectives = (curDataNode.renderDirectives || []).reduce((result, directive) => {
            const {
                type,
                prop = '',
                val,
                valType = 'value'
            } = directive
            if (type !== 'v-bind') {
                result.push({
                    type,
                    prop,
                    format: valType,
                    code: val
                })
            }
            return result
        }, [])

        // 非布局类型的组件需要转换 renderSlots
        if (![
            'render-grid',
            'free-layout',
            'widget-form',
            'widget-form-item',
            'bk-sideslider',
            'bk-dialog',
            'bk-card',
            'el-card'
        ].includes(curDataNode.type)) {
            curDataNode.renderSlots = Object.keys(curDataNode.renderSlots || {}).reduce((result, slotName) => {
                const slotData = curDataNode.renderSlots[slotName]
                let format = 'value'
                let code = slotData.val
                const renderValue = code
                const component = slotData.name
                const valueType = slotData.type
                const payload = slotData.payload || {}
                if (slotData.payload
                     && slotData.payload.variableData
                      && slotData.payload.variableData.valType
                      && slotData.payload.variableData.valType !== 'value') {
                    format = slotData.payload.variableData.valType
                    code = slotData.payload.variableData.val
                }
                result[slotName] = {
                    format,
                    component,
                    code,
                    payload,
                    valueType,
                    renderValue
                }
                return result
            }, {})
        }

        // fix: img 配置 type 问题
        if (curDataNode.type === 'img') {
            curDataNode.type = 'bk-image'
        }

        return curDataNode
    })
}

export async function syncPageData () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                const dataVersion = checkPageDataVersion(targetData)
                if (dataVersion === 'v0') {
                    targetData = []
                } else if (dataVersion === 'v1') {
                    try {
                        targetData = tansformPageData({ type: 'root' }, targetData)
                    } catch (error) {
                        console.dir(error)
                        return Promise.reject(new Error(`error page ==== ${pageData.id}`))
                    }
                }

                return transactionalEntityManager.update(Page, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })
            const templateTaskList = pageTemplateList.map(templateData => {
                let targetData = []
                try {
                    targetData = JSON.parse(templateData.content || '{}')
                    if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                        targetData = {}
                    }
                } catch (err) {
                    targetData = {}
                }
                targetData = [targetData]
                const dataVersion = checkPageDataVersion(targetData)
                if (dataVersion === 'v1') {
                    try {
                        targetData = tansformPageData({ type: 'template' }, targetData)
                    } catch (error) {
                        console.dir(error)
                        return Promise.reject(new Error(`error template ==== ${templateData.id}`))
                    }

                    return transactionalEntityManager.update(PageTemplate, {
                        id: templateData.id
                    }, {
                        content: JSON.stringify(targetData[0]),
                        updateTime: templateData.updateTime,
                        updateUser: templateData.updateUser
                    })
                } else {
                    return Promise.resolve()
                }
            })
            await Promise.all([...taskList, ...templateTaskList])
        })
        return {
            code: 0,
            message: `sync page data success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

export async function fixPageData (ctx) {
    try {
        const traverse = (childDataList) => {
            if (childDataList.length < 1) {
                return
            }
            childDataList.forEach(childData => {
                if (!childData) {
                    return
                }
                if (childData && childData.type === 'bk-dialog') {
                    if (childData.renderSlots
                        && childData.renderSlots.default
                        && childData.renderSlots.default.val) {
                        const child = childData.renderSlots.default.val
                        // console.log('\n\n\n\n\n\n\n\n ===============')
                        // console.dir(tansformPageData(childData, [child]))
                        childData.renderSlots = {
                            default: tansformPageData(childData, [child])[0]
                        }
                    }
                    return
                }
                if ([
                    'root',
                    'render-grid',
                    'render-column',
                    'free-layout',
                    'widget-form',
                    'widget-form-item'
                ].includes(childData.type)) {
                    // 布局类型的组件
                    // slot 的值类型 Array
                    traverse(childData.renderSlots.default)
                } else {
                    // slot 为布局类型组件
                    // slot 的值类型为 Node
                    Object.keys(childData.renderSlots).forEach(slotName => {
                        const slotData = childData.renderSlots[slotName]
                        if (Object.prototype.toString.call(slotData) === '[object Object]') {
                            if (slotData.componentId && slotData.type) {
                                traverse([slotData])
                            }
                        }
                    })
                }
            })
        }
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                const dataVersion = checkPageDataVersion(targetData)
                if (dataVersion === 'v2') {
                    try {
                        traverse(targetData)
                    } catch (error) {
                        console.dir(error)
                        return Promise.reject(new Error(`error page ==== ${pageData.id}`))
                    }
                    return transactionalEntityManager.update(Page, {
                        id: pageData.id
                    }, {
                        content: JSON.stringify(targetData),
                        updateTime: pageData.updateTime,
                        updateUser: pageData.updateUser
                    })
                } else {
                    return Promise.resolve()
                }
            })
            const templateTaskList = pageTemplateList.map(templateData => {
                let targetData = {}
                try {
                    targetData = JSON.parse(templateData.content || '{}')
                    if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                        targetData = {}
                    }
                } catch (err) {
                    targetData = {}
                }

                const dataVersion = checkPageDataVersion([targetData])
                if (dataVersion === 'v2') {
                    try {
                        traverse([targetData])
                    } catch (error) {
                        console.dir(error)
                        return Promise.reject(new Error(`error template ==== ${templateData.id}`))
                    }

                    return transactionalEntityManager.update(PageTemplate, {
                        id: templateData.id
                    }, {
                        content: JSON.stringify(targetData),
                        updateTime: templateData.updateTime,
                        updateUser: templateData.updateUser
                    })
                } else {
                    return Promise.resolve()
                }
            })
            await Promise.all([...taskList, ...templateTaskList])
        })
        ctx.send({
            code: 0,
            message: `fix page data sunccess：${(new Date()).toString()}`,
            data: null
        })
    } catch (error) {
        console.dir(error)
        ctx.send({
            code: -1,
            message: error,
            data: null
        })
    }
}

/**
 *  layout表新增mobile布局模板, layoutInst表,为历史项目增加移动端空白模板实例
 */
async function setProjectMobileLayoutInst (apiName) {
    const layoutRepo = getRepository(Layout)
    try {
        await getConnection().transaction(async transactionalEntityManager => {
            // 更新布局模板类型
            const layoutUpdateList = (await layoutRepo.find()).map(layout => {
                return {
                    id: layout.id,
                    layoutType: 'PC'
                }
            })
            await transactionalEntityManager.save(Layout, layoutUpdateList)
            // 创建布局模板基本信息记录
            const mobileLayout = layoutRepo.create({
                layoutType: 'MOBILE',
                defaultPath: '/mobile/',
                defaultName: global.i18n.t('空白布局'),
                defaultCode: 'mobileEmptyView',
                type: 'mobile-empty',
                defaultContent: JSON.stringify({}),
                createUser: 'admin',
                updateUser: 'admin'
            })
            const res = await transactionalEntityManager.save(mobileLayout)

            const layoutId = res && res.id

            const projectList = await getRepository(Project).find()

            // 先给项目列表的默认版本插一条移动端空白路由数据
            const layoutInstList = projectList.map(project => {
                const { id, createUser, updateUser } = project

                return {
                    content: JSON.stringify({}),
                    layoutId,
                    projectId: id,
                    routePath: '/mobile/',
                    isDefault: 1,
                    showName: global.i18n.t('空白布局_0'),
                    layoutCode: 'mobileEmptyView',
                    createUser,
                    updateUser
                }
            })

            const projectVersionList = await getRepository(ProjectVersion).find()
            const versionLayoutInstList = projectVersionList.map(project => {
                const { id, projectId, createUser, updateUser } = project

                return {
                    content: JSON.stringify({}),
                    layoutId,
                    projectId,
                    versionId: id,
                    routePath: '/mobile/',
                    isDefault: 1,
                    showName: global.i18n.t('空白布局_1'),
                    layoutCode: 'mobileEmptyView',
                    createUser,
                    updateUser
                }
            })
            const finalList = layoutInstList.concat(versionLayoutInstList)
            await transactionalEntityManager.save(LayoutInst, finalList)
        })
        return {
            code: 0,
            message: `${apiName}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${apiName}: ${err.message || err}`
        }
    }
}

async function syncFuncData () {
    try {
        const funcRepository = getRepository(Func)
        const funcList = await funcRepository.find({
            projectId: IsNull()
        })

        const funcGroupRepository = getRepository(FuncGroup)
        const funcGroupList = await funcGroupRepository.find({
            projectId: IsNull()
        })

        const projectFuncGroupRepository = getRepository(ProjectFuncGroup)
        const projectFuncGroupList = await projectFuncGroupRepository.find()
        const funcGroupProjectMap = projectFuncGroupList.reduce((acc, cur) => {
            acc[cur.funcGroupId] = cur.projectId
            return acc
        }, {})

        const versionGroupMap = projectFuncGroupList.reduce((acc, cur) => {
            acc[cur.funcGroupId] = cur.versionId
            return acc
        }, {})

        await getConnection().transaction(async transactionalEntityManager => {
            const funcTaskList = funcList.map(funcData => {
                return transactionalEntityManager.update(Func, {
                    id: funcData.id
                }, {
                    projectId: funcGroupProjectMap[funcData.funcGroupId],
                    versionId: versionGroupMap[funcData.funcGroupId],
                    updateTime: funcData.updateTime,
                    updateUser: funcData.updateUser
                })
            })
            const groupTaskList = funcGroupList.map(funcGroupData => {
                return transactionalEntityManager.update(FuncGroup, {
                    id: funcGroupData.id
                }, {
                    projectId: funcGroupProjectMap[funcGroupData.id],
                    versionId: versionGroupMap[funcGroupData.id],
                    updateTime: funcGroupData.updateTime,
                    updateUser: funcGroupData.updateUser
                })
            })
            await Promise.all([...funcTaskList, ...groupTaskList])
        })
        return {
            code: 0,
            message: `fix func data success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

async function modifyPageData0518 () {
    try {
        const modifyData = (node) => {
            if (Array.isArray(node)) {
                node.forEach(modifyData)
            } else if (Object.prototype.toString.apply(node) === '[object Object]') {
                Object.keys(node).forEach((key) => {
                    const nodeValue = node[key]
                    if (key === 'renderEvents') {
                        const eventKeys = Object.keys(nodeValue)
                        eventKeys.forEach((eventKey) => {
                            const eventValue = nodeValue[eventKey]
                            if (typeof eventValue === 'string') {
                                nodeValue[eventKey] = {
                                    methodCode: eventValue,
                                    params: []
                                }
                            }
                        })
                    } else {
                        modifyData(nodeValue)
                    }
                })
            }
        }
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                modifyData(targetData)

                return transactionalEntityManager.update(Page, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })
            const templateTaskList = pageTemplateList.map(templateData => {
                let targetData = []
                try {
                    targetData = JSON.parse(templateData.content || '{}')
                    if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                        targetData = {}
                    }
                } catch (err) {
                    targetData = {}
                }
                targetData = [targetData]

                modifyData(targetData)

                return transactionalEntityManager.update(PageTemplate, {
                    id: templateData.id
                }, {
                    content: JSON.stringify(targetData[0]),
                    updateTime: templateData.updateTime,
                    updateUser: templateData.updateUser
                })
            })
            await Promise.all([...taskList, ...templateTaskList])
        })
        return {
            code: 0,
            message: `sync page data success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

// 远程函数生成 api
async function syncFuncParams () {
    try {
        const funcRepository = getRepository(Func)
        const funcList = await funcRepository.find()

        const projectRepository = getRepository(Project)
        const projectList = await projectRepository.find()

        const categoryRepository = getRepository(ApiCategory)
        const categoryList = await categoryRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            // 生成默认分类
            const categoryTaskList = projectList.map((project) => {
                if (!categoryList.find(category => category.name === global.i18n.t('默认分类_0') && category.projectId === project.id)) {
                    const categoryEntity = categoryRepository.create({
                        name: global.i18n.t('默认分类_1'),
                        projectId: project.id,
                        versionId: project.versionId
                    })
                    return transactionalEntityManager.save(categoryEntity)
                } else {
                    return Promise.resolve()
                }
            })
            const funcTaskList = funcList.map(funcItem => {
                if (funcItem.funcType === 1) {
                    const httpData = {}
                    if (funcItem.funcApiData && !funcItem.apiQuery && !funcItem.apiBody) {
                        const funcApiData = funcItem.funcApiData.replace(/\{\{([^\{\}]+)\}\}/g, '\"$&\"')
                        try {
                            const apiData = JSON.parse(funcApiData)
                            if (METHODS_WITHOUT_DATA.includes(funcItem.funcMethod)) {
                                // 构造 scheme
                                httpData.apiQuery = []
                                Object.keys(apiData).forEach((key) => {
                                    httpData.apiQuery.push(parseValue2UseScheme(apiData[key], key))
                                })
                            } else {
                                // 构造 scheme
                                httpData.apiBody = parseValue2UseScheme(apiData)
                            }
                        } catch (error) {
                            console.log(`${funcItem.id} 存在不符合规范的 funcApiData，未转换为相应的模型，请手动修改 api`)
                        }
                        // 更新 query or body
                        return transactionalEntityManager.update(Func, {
                            id: funcItem.id
                        }, {
                            updateTime: funcItem.updateTime,
                            updateUser: funcItem.updateUser,
                            ...httpData
                        })
                    } else {
                        return Promise.resolve()
                    }
                } else {
                    return Promise.resolve()
                }
            })
            await Promise.all([...categoryTaskList, ...funcTaskList])
        })
        return {
            code: 0,
            message: `同步远程函数为 api success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

// 初始化官方页面模板和函数市场内容
async function initPageTemplateAndFuncMarket () {
    try {
        await initResources({
            pageTemplate: {
                importList: ['template-banner', 'template-announcement', 'template-footer', 'template-form', 'template-nav-horizontal', 'template-nopermission', 'template-product-feature', 'template-step', 'template-tab-simplified', 'template-tab', 'template-table-customcol', 'template-table-demo', 'template-table-displaycol', 'template-table-filtersort', 'template-table-localpagination', 'template-table-nopagination', 'template-table-search', 'template-tree', 'mobile-template-h5', 'mobile-template-itemshow', 'mobile-template-tabchange']
            },
            func: {
                importList: ['market-func-1.json']
            }
        })
        return {
            code: 0,
            message: global.i18n.t('初始化页面模板和函数市场成功')
        }
    } catch (error) {
        return {
            code: -1,
            message: global.i18n.t('初始化页面模板和函数市场失败: {{n}}', { n: error }),
            data: null
        }
    }
}

// 将form表的dataSourceId替换成对应的tableName
async function updateFormTableName () {
    try {
        const formList = await getRepository(Form).createQueryBuilder('form')
            .leftJoinAndSelect(DataTable, 'dataTable', 'form.dataSourceId = dataTable.id')
            .select(['form.*', 'dataTable.tableName as newTableName'])
            .getRawMany()
        await getConnection().transaction(async transactionalEntityManager => {
            const formTaskList = formList.map(form => {
                return transactionalEntityManager.update(Form, {
                    id: form.id
                }, {
                    tableName: form.newTableName
                })
            })
            await Promise.all([...formTaskList])
        })
        return {
            code: 0,
            message: global.i18n.t('form表tableName更新成功')
        }
    } catch (error) {
        return {
            code: -1,
            message: global.i18n.t('form表tableName更新失败: {{n}}', { n: error }),
            data: null
        }
    }
}

async function transformBkTable () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                const modifyTableType = (node) => {
                    if (node?.type === 'bk-table') {
                        node.type = 'widget-bk-table'
                    }
                    const renderSlots = node?.renderSlots || {}
                    Object.keys(renderSlots).forEach((key) => {
                        const renderSlot = Array.isArray(renderSlots[key]) ? renderSlots[key] : [renderSlots[key]]
                        renderSlot.forEach(modifyTableType)
                    })
                }
                targetData.forEach(modifyTableType)
                return transactionalEntityManager.update(Page, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })
            await Promise.all([...taskList])
        })
        return {
            code: 0,
            message: `transformBkTable success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

async function transformEventAndSelect () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                const modifyData = (node) => {
                    // update event
                    const renderEvents = node?.renderEvents || {}
                    Object
                        .keys(renderEvents)
                        .forEach((renderEventKey) => {
                            const renderEvent = renderEvents[renderEventKey]
                            if (typeof renderEvent === 'string') {
                                renderEvents[renderEventKey] = {
                                    enable: true,
                                    methodCode: renderEvent,
                                    params: []
                                }
                            } else {
                                renderEvents[renderEventKey] = {
                                    ...renderEvent,
                                    enable: true
                                }
                            }
                        })
                    // update select
                    if (node?.component === 'bk-option') {
                        if (node.valueType === 'remote') {
                            node.valueType = 'select-remote'
                        }
                        if (node?.payload?.sourceData?.params) {
                            node.payload.sourceData.keys = node.payload.sourceData.params
                        }
                    }
                    const renderSlots = node?.renderSlots || {}
                    Object.keys(renderSlots).forEach((key) => {
                        const renderSlot = Array.isArray(renderSlots[key]) ? renderSlots[key] : [renderSlots[key]]
                        renderSlot.forEach(modifyData)
                    })
                }
                targetData.forEach(modifyData)
                return transactionalEntityManager.update(Page, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })
            await Promise.all([...taskList])
        })
        return {
            code: 0,
            message: `transformEventAndSelect success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

async function transformTemplateEventAndSelect () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find()

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find()

        await getConnection().transaction(async transactionalEntityManager => {
            const modifyData = (node) => {
                // update event
                const renderEvents = node?.renderEvents || {}
                Object
                    .keys(renderEvents)
                    .forEach((renderEventKey) => {
                        const renderEvent = renderEvents[renderEventKey]
                        if (typeof renderEvent === 'string') {
                            renderEvents[renderEventKey] = {
                                enable: true,
                                methodCode: renderEvent,
                                params: []
                            }
                        } else {
                            renderEvents[renderEventKey] = {
                                ...renderEvent,
                                enable: true
                            }
                        }
                    })
                // update select
                if (node?.component === 'bk-option') {
                    if (node.valueType === 'remote') {
                        node.valueType = 'select-remote'
                    }
                    if (node?.payload?.sourceData?.params) {
                        node.payload.sourceData.keys = node.payload.sourceData.params
                    }
                }
                const renderSlots = node?.renderSlots || {}
                Object.keys(renderSlots).forEach((key) => {
                    const renderSlot = Array.isArray(renderSlots[key]) ? renderSlots[key] : [renderSlots[key]]
                    renderSlot.forEach(modifyData)
                })
            }

            const taskList = pageList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '[]')
                    if (!Array.isArray(targetData)) {
                        targetData = []
                    }
                } catch (err) {
                    targetData = []
                }
                targetData.forEach(modifyData)
                return transactionalEntityManager.update(Page, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })

            const tempTaskList = pageTemplateList.map(pageData => {
                let targetData = []
                try {
                    targetData = JSON.parse(pageData.content || '{}')
                    if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                        targetData = {}
                    }
                } catch (err) {
                    targetData = {}
                }
                targetData = [targetData]
                targetData.forEach(modifyData)
                return transactionalEntityManager.update(PageTemplate, {
                    id: pageData.id
                }, {
                    content: JSON.stringify(targetData[0]),
                    updateTime: pageData.updateTime,
                    updateUser: pageData.updateUser
                })
            })
            await Promise.all([...taskList, ...tempTaskList])
        })
        return {
            code: 0,
            message: `transformTemplateEventAndSelct success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error,
            data: null
        }
    }
}

async function updateLayoutThemeData () {
    try {
        const layoutInstList = await getRepository(LayoutInst).createQueryBuilder('layout_inst')
            .leftJoinAndSelect(Layout, 'layout', 'layout_inst.layoutId = layout.id')
            .select(['layout_inst.*', 'layout.type as type'])
            .where('layout.type NOT IN ("empty", "mobile-empty")')
            .getRawMany()
        const updateList = []
        await getConnection().transaction(async transactionalEntityManager => {
            layoutInstList.map(layoutInst => {
                const newContent = layoutInst.content
                if (newContent) {
                    const newContentObj = JSON.parse(newContent) || {}
                    const theme = (newContentObj.theme || '').toLowerCase()
                    const isWhiteTheme = theme === '#ffffff'
                    let themeConfig = {}
                    if (theme && theme !== '#182132') {
                        if (layoutInst.type === 'left-right') {
                            themeConfig = {
                                sideMenuBackground: isWhiteTheme ? theme : '#1a1a1a',
                                sideMenuTheme: isWhiteTheme ? '#3c96ff' : theme
                            }
                        } else if (layoutInst.type === 'top-bottom') {
                            themeConfig = {
                                topMenuBackground: theme,
                                topMenuTheme: isWhiteTheme ? '#1a1a1a' : '#ffffff'
                            }
                        } else if (layoutInst.type === 'complex') {
                            themeConfig = {
                                sideMenuBackground: isWhiteTheme ? '#ffffff' : '#1a1a1a',
                                sideMenuTheme: isWhiteTheme ? '#3c96ff' : theme,
                                topMenuBackground: isWhiteTheme ? '#ffffff' : theme,
                                topMenuTheme: isWhiteTheme ? '#1a1a1a' : '#ffffff'
                            }
                        }
                        Object.assign(newContentObj, { themeConfig })
                        updateList.push({
                            id: layoutInst.id,
                            content: JSON.stringify(newContentObj)
                        })
                    }
                }
            })
            const taskList = updateList.map(inst => {
                return transactionalEntityManager.update(LayoutInst, {
                    id: inst.id
                }, {
                    content: inst.content
                })
            })
            await Promise.all([...taskList])
        })
        return {
            code: 0,
            message: global.i18n.t('layoutInst表themeConfig更新成功')
        }
    } catch (err) {
        console.log('update layoutTheme error: ', err)
        return {
            code: -1,
            message: 'update layoutTheme error: '
        }
    }
}

async function newTransformFuncParams () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content', 'lifeCycle']
        })

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content']
        })

        const modifyData = (node) => {
            // update renderProps
            const renderProps = node?.renderProps || {}
            Object
                .keys(renderProps)
                .forEach((renderPropKey) => {
                    const renderProp = renderProps[renderPropKey]
                    if (['select-data-source', 'table-data-source', 'data-source'].includes(renderProp.valueType)
                            && renderProp?.payload?.sourceData
                            && renderProp?.payload?.sourceData?.dataSourceType !== 'bk-base'
                    ) {
                        renderProp.payload.sourceData.dataSourceType = 'preview'
                    }

                    if (renderProp?.payload?.params?.length) {
                        renderProp.payload.params.forEach((param) => {
                            if (param.code === undefined) {
                                param.code = ''
                                param.format = 'value'
                            }
                        })
                    }

                    if (renderProp.valueType === 'table-data-source' && renderProp?.payload?.sourceData) {
                        renderProp.payload.sourceData.showOperationColumn = renderProp.payload.sourceData.dataSourceType === 'preview'
                    }
                })
            // update renderEvents
            const renderEvents = node?.renderEvents || {}
            Object
                .keys(renderEvents)
                .forEach((renderEventKey) => {
                    const renderEvent = renderEvents[renderEventKey]
                    if (renderEvent?.params?.length) {
                        renderEvent.params.forEach((param) => {
                            if (param.code === undefined) {
                                param.code = ''
                                param.format = 'value'
                            }
                        })
                    }
                })

            // update current slot
            if (node?.payload?.methodData?.params?.length) {
                node.payload.methodData.params.forEach((param) => {
                    if (param.code === undefined) {
                        param.code = ''
                        param.format = 'value'
                    }
                })
            }
            // 更新子节点
            const renderSlots = node?.renderSlots || {}
            Object.keys(renderSlots).forEach((key) => {
                const renderSlot = renderSlots[key]
                if (['select-data-source', 'table-data-source', 'data-source'].includes(renderSlot.valueType)
                    && renderSlot?.payload?.sourceData
                    && renderSlot?.payload?.sourceData?.dataSourceType !== 'bk-base'
                ) {
                    renderSlot.payload.sourceData.dataSourceType = 'preview'
                }
                // 更新子节点
                const renderSlotList = Array.isArray(renderSlot) ? renderSlot : [renderSlot]
                renderSlotList.forEach(modifyData)
            })
        }

        for (const key in pageList) {
            const pageData = pageList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '[]')
                if (!Array.isArray(targetData)) {
                    targetData = []
                }
            } catch (err) {
                targetData = []
            }
            targetData.forEach(modifyData)
            // update lifeCycle
            let lifeCycle = {}
            try {
                lifeCycle = JSON.parse(pageData.lifeCycle || '{}')
            } catch (error) {
                lifeCycle = {}
            }
            Object.keys(lifeCycle).forEach((lifeCycleKey) => {
                let methodData = lifeCycle[lifeCycleKey]
                if (typeof methodData === 'string' && methodData) {
                    methodData = {
                        methodCode: methodData
                    }
                }
                methodData?.params?.forEach((param) => {
                    if (param.code === undefined) {
                        param.code = ''
                        param.format = 'value'
                    }
                })
                lifeCycle[lifeCycleKey] = methodData
            })
            await pageRepository.update(pageData.id, {
                content: JSON.stringify(targetData),
                lifeCycle: JSON.stringify(lifeCycle),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }

        for (const key in pageTemplateList) {
            const pageData = pageTemplateList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '{}')
                if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                    targetData = {}
                }
            } catch (err) {
                targetData = {}
            }
            targetData = [targetData]
            targetData.forEach(modifyData)
            await PageTemplateRepository.update(pageData.id, {
                content: JSON.stringify(targetData[0]),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }
        return {
            code: 0,
            message: `newTransformFuncParams success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error
        }
    }
}
async function insertLayoutTypeInLayoutInst () {
    try {
        const layoutInstRepo = getRepository(LayoutInst)
        const layoutInstList = await layoutInstRepo.find()
        layoutInstList.forEach(layout => {
            layout.layoutType = layout.routePath.includes('mobile') ? 'MOBILE' : 'PC'
        })
        await layoutInstRepo.save(layoutInstList)
        return {
            code: 0,
            message: global.i18n.t('layoutInst更新成功,添加layoutType列')
        }
    } catch (error) {
        return {
            code: -1,
            message: error.message || error,
            data: null
        }
    }
}

/**
 * 初始化应用权限模型数据
 * 由于只有默认的页面访问操作是关联资源的，因此在初始化数据时就可以把应用注册到权限中心的数据生成
 * 包括系统、资源类型以及实例视图的数据
 */
async function initIamAppPermData (apiName) {
    // IamAppPerm
    // IamAppPermAction
    const projectRepo = getRepository(Project)
    try {
        await getConnection().transaction(async transactionalEntityManager => {
            const projectList = await projectRepo.find()

            const iamAppPermList = projectList.map(project => {
                const { id, projectCode, projectName } = project
                // 权限中心系统 id, 全局唯一, 只允许小写字母开头、包含小写字母、数字、下划线(_)和连接符(-), 最长 32 个字符.
                const systemId = `lesscode_${id}_${projectCode}`.substr(0, 32)
                return {
                    projectId: id,
                    systemId: systemId,
                    systemName: global.i18n.t('蓝鲸可视化开发平台-{{n}}', { n: projectName }),
                    systemNameEn: `lesscode-${projectCode}`,
                    systemDesc: global.i18n.t('蓝鲸可视化开发平台-{{n}}', { n: projectName }),
                    systemDescEn: `lesscode-${projectCode}`,
                    systemClients: systemId,
                    systemProviderConfig: {
                        host: IAM_PROVIDER_HOST,
                        auth: 'basic',
                        healthz: ''
                    },
                    deployed: 0,
                    resourceTypeId: IAM_APP_PERM_RESOURCE_TYPE_ID,
                    resourceTypeName: global.i18n.t('页面'),
                    resourceTypeNameEn: 'Page',
                    resourceTypeDesc: global.i18n.t('页面是...'),
                    resourceTypeDescEn: 'page is a ...',
                    resourceTypeProviderConfig: {
                        path: `/api/iam/resource-app-perm?projectId=${id}`
                    },

                    instanceSelectionId: IAM_APP_PERM_INSTANCE_SELECTION_ID,
                    instanceSelectionName: global.i18n.t('页面视图'),
                    instanceSelectionNameEn: 'Page List',
                    instanceSelectionResourceTypeChain: [
                        {
                            // 系统 ID
                            system_id: systemId,
                            // 资源类型 ID
                            id: IAM_APP_PERM_RESOURCE_TYPE_ID
                        }
                    ],
                    createUser: project.createUser,
                    updateUser: project.updateUser
                }
            })
            await transactionalEntityManager.save(IamAppPerm, iamAppPermList)

            const iamAppPermActionList = projectList.map(project => {
                const { id } = project
                const iamAppPerm = iamAppPermList.find(item => item.projectId === id) || { id: -1 }
                return {
                    iamAppPermId: iamAppPerm.id,
                    projectId: id,
                    actionId: IAM_APP_PERM_BUILDIN_ACTION,
                    actionName: global.i18n.t('页面访问'),
                    actionNameEn: 'View Page',
                    actionDesc: global.i18n.t('访问页面的操作权限'),
                    actionDescEn: 'The permissions to access the page',
                    actionType: IAM_ACTION_TYPE.view[0],
                    actionRelatedResourceId: [],
                    createUser: project.createUser,
                    updateUser: project.updateUser
                }
            })
            await transactionalEntityManager.save(IamAppPermAction, iamAppPermActionList)
        })
        return {
            code: 0,
            message: `${apiName}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${apiName}: ${err.message || err}`
        }
    }
}

// eslint-disable-next-line no-unused-vars
async function updateRemoteOption (type) {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content', 'lifeCycle']
        })

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content']
        })

        const modifyData = (node) => {
            // update renderProps
            const renderProps = node?.renderProps || {}
            if (node.type === type && renderProps.remoteOptions?.payload?.methodCode) {
                renderProps.options = { ...renderProps.remoteOptions, ...{ 'buildInVariableType': 'SYSTEM' } }
            }

            // 更新子节点
            const renderSlots = node?.renderSlots || {}
            Object.keys(renderSlots).forEach((key) => {
                const renderSlot = renderSlots[key]
                // 更新子节点
                const renderSlotList = Array.isArray(renderSlot) ? renderSlot : [renderSlot]
                renderSlotList.forEach(modifyData)
            })
        }
        for (const key in pageList) {
            const pageData = pageList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '[]')
                if (!Array.isArray(targetData)) {
                    targetData = []
                }
            } catch (err) {
                targetData = []
            }
            targetData.forEach(modifyData)
            await pageRepository.update(pageData.id, {
                content: JSON.stringify(targetData),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }

        for (const key in pageTemplateList) {
            const pageData = pageTemplateList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '{}')
                if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                    targetData = {}
                }
            } catch (err) {
                targetData = {}
            }
            targetData = [targetData]
            targetData.forEach(modifyData)
            await PageTemplateRepository.update(pageData.id, {
                content: JSON.stringify(targetData[0]),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }
        return {
            code: 0,
            message: `更新${type} options成功：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error
        }
    }
}

function updateBkChartRemoteOption () {
    updateRemoteOption('bk-charts')
}

// 改变 select key 结构
async function modifySelectKeys () {
    try {
        const pageRepository = getRepository(Page)
        const pageList = await pageRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content']
        })

        const PageTemplateRepository = getRepository(PageTemplate)
        const pageTemplateList = await PageTemplateRepository.find({
            select: ['id', 'updateTime', 'updateUser', 'content']
        })

        const modifyData = (node) => {
            // update renderProps
            const renderSlots = node?.renderSlots || {}
            Object
                .keys(renderSlots)
                .forEach((renderSlotKey) => {
                    const renderSlot = renderSlots[renderSlotKey]
                    if (renderSlot.valueType === 'select-remote') {
                        renderSlot.keyOptions = []
                        renderSlot.valueKeys = {
                            id: renderSlot?.payload?.methodData?.keys?.idKey || 'id',
                            name: renderSlot?.payload?.methodData?.keys?.nameKey || 'id'
                        }
                        renderSlot.payload = {
                            methodData: {
                                methodCode: renderSlot?.payload?.methodData?.methodCode,
                                params: renderSlot?.payload?.methodData?.params
                            },
                            customVariableCode: renderSlot?.payload?.customVariableCode || ''
                        }
                    }

                    if (renderSlot.valueType === 'select-data-source') {
                        renderSlot.keyOptions = renderSlot?.payload?.sourceData?.columns || []
                        renderSlot.valueKeys = {
                            id: renderSlot?.payload?.sourceData?.keys?.idKey || 'id',
                            name: renderSlot?.payload?.sourceData?.keys?.nameKey || 'id'
                        }
                        renderSlot.payload = {
                            sourceData: {
                                tableName: renderSlot?.payload?.sourceData?.tableName,
                                dataSourceType: renderSlot?.payload?.sourceData?.dataSourceType
                            },
                            customVariableCode: renderSlot?.payload?.customVariableCode || ''
                        }
                    }
                })

            // 更新子节点
            Object.keys(renderSlots).forEach((key) => {
                const renderSlot = renderSlots[key]
                const renderSlotList = Array.isArray(renderSlot) ? renderSlot : [renderSlot]
                renderSlotList.forEach(modifyData)
            })
        }

        for (const key in pageList) {
            const pageData = pageList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '[]')
                if (!Array.isArray(targetData)) {
                    targetData = []
                }
            } catch (err) {
                targetData = []
            }
            targetData.forEach(modifyData)
            await pageRepository.update(pageData.id, {
                content: JSON.stringify(targetData),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }

        for (const key in pageTemplateList) {
            const pageData = pageTemplateList[key]
            let targetData = []
            try {
                targetData = JSON.parse(pageData.content || '{}')
                if (Object.prototype.toString.call(targetData) !== '[object Object]') {
                    targetData = {}
                }
            } catch (err) {
                targetData = {}
            }
            targetData = [targetData]
            targetData.forEach(modifyData)
            await PageTemplateRepository.update(pageData.id, {
                content: JSON.stringify(targetData[0]),
                updateTime: pageData.updateTime,
                updateUser: pageData.updateUser
            })
        }
        return {
            code: 0,
            message: `modifySelectKeys success：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error
        }
    }
}

// eslint-disable-next-line no-unused-vars
async function updateFunctionUrl () {
    try {
        const funcRepository = getRepository(Func)
        const funcList = await funcRepository.find()

        const apiRepository = getRepository(Api)
        const apiList = await apiRepository.find()

        const modifyData = (apiChoosePath, projectId) => {
            const projectApiList = apiList.filter(api => api.projectId === projectId)
            if (apiChoosePath?.[0]?.id === 'lesscode-api') {
                const api = projectApiList.find(api => api.name === apiChoosePath?.[2]?.name)
                if (api) {
                    apiChoosePath[2].code = api.code
                }
            }
            return apiChoosePath
        }
        for (const key in funcList) {
            const funcData = funcList[key]
            const apiChoosePath = modifyData(funcData.apiChoosePath, funcData.projectId)
            await funcRepository.update(funcData.id, {
                apiChoosePath,
                updateTime: funcData.updateTime,
                updateUser: funcData.updateUser
            })
        }
        return {
            code: 0,
            message: `更新函数成功：${(new Date()).toString()}`,
            data: null
        }
    } catch (error) {
        console.dir(error)
        return {
            code: -1,
            message: error
        }
    }
}
