import _ from 'lodash'
import { uuid } from '@/common/util'
import { unitFilter } from 'shared/util.js'

import toJSON from './extends/to-json'
import active from './extends/active'
import activeClear from './extends/active-clear'
import toggleInteractive from './extends/toggle-interactive'
import appendChild from './extends/append-child'
import insertBefore from './extends/insert-before'
import insertAfter from './extends/insert-after'
import pasteNode from './extends/paste-node'
import removeChild from './extends/remove-child'
import cloneNode from './extends/clone-node'
import rerender from './extends/rerender'
import setRenderSlots from './extends/set-render-slots'
import setRenderEvents from './extends/set-render-events'
import setRenderProps from './extends/set-render-props'
import setRenderStyles from './extends/set-render-styles'
import setRenderDirectives from './extends/set-render-directives'
import setRenderAlign from './extends/set-render-align'
import setStyle from './extends/set-style'
import setProp from './extends/set-prop'
import setEvent from './extends/set-event'
import setAlign from './extends/set-align'
import setSlot from './extends/set-slot'
import mergeRenderEvents from './extends/merge-render-events'

import {
    notify,
    readonly
} from './helper/decorator'

import transformProps from './helper/transform-props'
import transformSlots from './helper/transform-slots'
import findParent from './helper/find-parent'
import flatneChildren from './helper/flatne-chilren'
import {
    findRelatedVariableFromRenderProps,
    findRelatedVariableFromRenderDirective,
    findRelatedVariableFromRenderSlot
} from './helper/find-related-variable'
import {
    findRelatedMethodFromRenderProps,
    findRelatedMethodFromRenderSlot,
    findRelatedMethodFromRenderEvent
} from './helper/find-related-method'
import validator from './helper/validator'
import { toHyphenate } from './helper/utils'

import getRoot from './static/get-root'
import getMaterial from './static/get-material'

import isLayoutType from './static/is-layout-type'

export let activeNode = null

export default class Node {
    constructor ({
        name = '',
        type = '',
        props = {},
        // directives = [],
        slots = {},
        renderStyles = {},
        renderProps = {}
    }) {
        const uid = uuid()
        // ??????????????????????????? false???????????????????????????????????????????????? true
        this._isMounted = false
        // ?????????????????????????????????????????????
        this.$elm = null
            
        this.tabPanelActive = 'props' // ??????tab???????????????
        this.componentId = `${name}-${uid}`
        this.renderKey = uuid()
        this.renderSlotKey = uuid() // ?????? slot ??????????????????????????? slot
        this.name = name
        this.type = type
        this.renderStyles = renderStyles
        this.renderProps = transformProps(props, renderProps, type)
        this.renderSlots = transformSlots(slots)
        this.renderDirectives = []
        this.renderEvents = {}
        this.renderAlign = {}
        // ??????????????????????????????
        this.interactiveShow = false
        // ???????????????
        this.isInteractiveComponent = false
        // ????????????
        this.isComplexComponent = false
        // ???????????????
        this.isCustomComponent = false
        // ???????????????
        this.isActived = false
    }
    /**
     * @desc ??????????????????
     * @returns { Boolean }
     */
    get root () {
        return this.type === 'root'
    }
    /**
     * @desc ?????? material ??????
     * @returns { Object }
     */
    get material () {
        return getMaterial(this.type)
    }
    /**
     * @desc ?????????????????????
     * @returns { Boolean }
     */
    get layoutType () {
        return isLayoutType(this.type)
    }
    /**
     * @desc ?????????slot????????????
     * @returns { Boolean }
     */
    get layoutSlot () {
        const material = getMaterial(this.type)
        if (!material) {
            return true
        }
        for (const slotName in material.slots) {
            const slot = material.slots[slotName]
            const slotComponentNameArr = Array.isArray(slot.name) ? slot.name : [slot.name]
            if (slotComponentNameArr.includes('layout')) {
                return true
            }
        }
        return false
    }
    /**
     * @desc ??????????????? slot ??? layout ??????
     * @returns { Boolean }
     */
    get layoutSlotType () {
        const material = getMaterial(this.type)
        const memo = {}
        if (!material) {
            return memo
        }
        
        for (const slotName in material.slots) {
            const {
                name,
                type
            } = material.slots[slotName]
            const slotComponentNameArr = Array.isArray(name) ? name : [name]
            if (slotComponentNameArr.includes('layout')) {
                memo[slotName] = type[0]
            }
        }
        return memo
    }
    /**
     * @desc css ??????
     * @returns { Object }
     */
    get style () {
        const style = {}
        Object.keys(this.renderStyles).forEach(key => {
            if (key === 'customStyle') {
                return
            }
            style[toHyphenate(key)] = unitFilter(this.renderStyles[key])
        })
        const {
            customStyle = {}
        } = this.renderStyles
        
        Object.keys(customStyle).forEach(key => {
            style[toHyphenate(key)] = customStyle[key]
        })
        
        return Object.seal(style)
    }
    /**
     * @desc ?????? props
     * @returns { Object }
     */
    get prop () {
        const props = Object.keys(this.renderProps).reduce((result, propKey) => {
            const renderValue = this.renderProps[propKey].renderValue
            if (renderValue !== '') {
                result[propKey] = this.renderProps[propKey].renderValue
            }
            return result
        }, {})
        // ????????? v-model?????????????????????
        this.renderDirectives.forEach(directive => {
            if (directive.type === 'v-model') {
                props[directive.prop] = directive.renderValue
            }
        })
        return Object.seal(_.cloneDeep(props))
    }
    /**
     * @desc ?????? slot
     * @returns { Object }
     */
    get slot () {
        const slot = Object.keys(this.renderSlots).reduce((result, key) => {
            result[key] = this.renderSlots[key]
            return result
        }, {})
        return Object.seal(slot)
    }
    get align () {
        const align = {
            horizontal: '',
            vertical: ''
        }
        Object.keys(this.renderAlign).forEach(direction => {
            align[direction] = this.renderAlign[direction]
        })
        return align
    }
    /**
     * @desc ?????????
     * @returns { Node }
     */
    get parentNode () {
        const root = getRoot()
        return findParent(root, this.componentId)
    }
    /**
     * @desc ????????????????????????????????? slot ????????????
     * @returns { Array  }
     */
    get children () {
        return flatneChildren(this)
    }
    /**
     * @desc ????????????
     * @returns { Object }
     */
    get variable () {
        const propRelatedVariableMap = findRelatedVariableFromRenderProps(this.renderProps)
        const directiveRelatedVariableMap = findRelatedVariableFromRenderDirective(this.renderDirectives)
        const slotRelatedVariableMap = this.layoutType ? {} : findRelatedVariableFromRenderSlot(this.renderSlots)
        return Object.seal(Object.assign({}, propRelatedVariableMap, directiveRelatedVariableMap, slotRelatedVariableMap))
    }
    /**
     * @desc ????????????
     * @returns { Object }
     */
    get method () {
        const eventRelatedMethodMap = findRelatedMethodFromRenderEvent(this.renderEvents)
        const propRelatedVariableMap = findRelatedMethodFromRenderProps(this.renderProps)
        const slotRelatedVariableMap = this.layoutType ? {} : findRelatedMethodFromRenderSlot(this.renderSlots)
        return Object.seal(Object.assign({}, eventRelatedMethodMap, propRelatedVariableMap, slotRelatedVariableMap))
    }
    /**
     * @desc ?????????????????????????????????
     * @returns { String }
     */
    get errorStack () {
        return validator(this)
    }
    /**
     * @desc ?????????????????????
     * @param {Element} elm
     */
    mounted (elm) {
        this._isMounted = true
        this.$elm = elm
    }
    /**
     * @desc ??????????????? JSON ??????
     * @returns { Boolean }
     */
    toJSON () {
        return toJSON(this)
    }
    /**
     * @desc ??????????????????
     * @param { String } key ?????????
     * @param { Any } value ?????????
     * @returns { Node }
     */
    @readonly
    @notify
    setProperty (key, value) {
        const setKeyList = [
            'tabPanelActive',
            'isInteractiveComponent',
            'interactiveShow',
            'isCustomComponent',
            'isComplexComponent'
        ]
        if (setKeyList.includes(key)) {
            this[key] = value
        }
    }

    /**
     * @desc ????????????
     * @returns { Node }
     */
    @readonly
    @notify
    active () {
        if (activeNode && activeNode !== this) {
            activeNode.activeClear()
        }
        active(this)
        activeNode = this
        return this
    }
    /**
     * @desc ??????????????????
     * @returns { Node }
     */
    @readonly
    @notify
    activeClear () {
        activeClear(this)
        activeNode = null
        return this
    }
    
    /**
     * @desc ????????????????????????????????????
     * @param { Boolean } state
     * @returns { Node }
     */
     @readonly
     @notify
    toggleInteractive (state) {
        toggleInteractive(this, state)
        return this
    }
    /**
     * @desc ??????????????????
     * @returns { Node }
     */
    @readonly
    @notify
     rerender () {
         rerender(this)
         return this
     }

    /**
     * @desc ???????????????
     * @param { Node } child
     * @param { String } slotName
     * @returns { Node }
     */
    @readonly
    @notify
    appendChild (child, slotName = 'default') {
        appendChild(this, child, slotName)
        return this
    }

    /**
     * @desc ??? referenceNode ???????????????????????????
     * @param { Node } newNode
     * @param { Node } referenceNode newNode ??????????????????????????????
     * @returns { Node }
     */
    @readonly
    @notify
    insertBefore (newNode, referenceNode) {
        insertBefore(this, newNode, referenceNode)
        return this
    }

    /**
     * @desc ??? referenceNode ???????????????????????????
     * @param { Node } newNode
     * @param { Node } referenceNode newNode ??????????????????????????????
     * @returns { Node }
     */
    @readonly
    @notify
    insertAfter (newNode, referenceNode) {
        insertAfter(this, newNode, referenceNode)
        return this
    }

    @readonly
    @notify
    pasteNode (child) {
        pasteNode(this, child)
        return this
    }

    /**
     * @desc ???????????????
     * @param { Node } child
     * @returns { Node }
     */
    @readonly
    @notify
    removeChild (child) {
        if (activeNode && activeNode === child) {
            activeNode.activeClear()
        }
        removeChild(this, child)
        
        return this
    }

    /**
     * @desc clone ??????
     * @param { Boolean } deep ????????????????????????,?????????true,???????????????????????????????????????????????????,?????????false,???????????????????????????.
     * @returns { Node }
     */
     @readonly
     @notify
    cloneNode (deep) {
        return cloneNode(this, deep)
    }

    /**
     * @desc ??????style
     * @param { Object } styles
     * @returns { Node }
     */
    @readonly
    @notify
     setRenderStyles (styles = {}) {
         setRenderStyles(this, styles)
         return this
     }

    /**
     * @desc ??????slot
     * @param { Object } slots
     * @param { String } slotName
     * @returns { Node }
     */
    @readonly
    @notify
    setRenderSlots (slots, slotName = 'default') {
        this.renderSlotKey = uuid()
        setRenderSlots(this, slots, slotName)
        return this
    }

    /**
     * @desc ????????????
     * @param { Array } events
     * @returns { Node }
     */
    @readonly
    @notify
    setRenderEvents (events = {}) {
        setRenderEvents(this, events)
        return this
    }

    /**
     * @desc ????????????
     * @param { Object } props
     * @returns { Node }
     */
    @readonly
    @notify
    setRenderProps (props = {}) {
        setRenderProps(this, props)
        return this
    }

    /**
     * @desc ????????????
     * @param { Array } directives
     * @returns { Node }
     */
    @readonly
    @notify
    setRenderDirectives (directives = []) {
        setRenderDirectives(this, directives)
        return this
    }
    /**
     * @desc ??????????????????
     * horizontal: align-horizontal-left, align-horizontal-center, align-horizontal-right
     * vertical: align-vertical-top, align-vertical-center, align-vertical-right
     * @param { Object } align
     * @returns { Node }
     */
     @readonly
     @notify
    setRenderAlign (align) {
        setRenderAlign(this, align)
        return this
    }
    /**
     * @desc ?????? style
     * @param { String | Object } params1
     * @param { Number | String } params2
     * @returns { Node }
     */
    @readonly
    @notify
     setStyle (params1, params2) {
         setStyle(this, params1, params2)
         return this
     }
    /**
     * @desc ?????? prop
     * @param { String | Object } params1
     * @param { Object } params2
     * @returns { Node }
     */
    @readonly
    @notify
    setProp (params1, params2) {
        setProp(this, params1, params2)
        return this
    }
    /**
     * @desc ?????? align
     * @param { String | Object } params1
     * @param { Number | String } params2
     * @returns { Node }
     */
     @readonly
     @notify
    setAlign (params1, params2) {
        setAlign(this, params1, params2)
        return this
    }
    /**
     * @desc ?????? event
     * @param { String | Object } params1
     * @param { Object | null } params2
     * @returns { Node }
     */
    @readonly
    @notify
     setEvent (params1, params2) {
         setEvent(this, params1, params2)
         return this
     }
     /**
     * @desc ?????? style
     * @param { Object | String } params1
     * @param { String } params2
     * @returns { Node }
     */
    @readonly
    @notify
    setSlot (param1, param2) {
        this.renderSlotKey = uuid()
        setSlot(this, param1, param2)
        return this
    }
    /**
     * @desc ??????????????????
     * @param { Array } events
     * @returns { Node }
     */
    @readonly
    @notify
    mergeRenderEvents (events = {}) {
        mergeRenderEvents(this, events)
        return this
    }
}
