<template>
    <div
        v-if="isShow && Object.keys(filerConfig).length"
        class="modifier-slot">
        <template v-for="(group, indexKey) in slotGroupList">
            <div v-if="hasGroupSlot(group)" :key="indexKey">
                <div class="group-name" @click="toggleShowGroupSlot(group, indexKey)">
                    <span>{{ group.label || group.value }}</span>
                    <i
                        :class="{
                            'bk-icon icon-angle-down': true,
                            close: !group.isDisplay
                        }"
                    ></i>
                </div>
                <div v-if="group.isDisplay" class="group-bt">
                    <div class="mar-lr">
                        <template v-for="(item, key) in group.groupSlots">
                            <renderSlot
                                :key="key"
                                :name="key"
                                :last-value="lastSlots[key]"
                                :describe="item"
                                :component-id="componentId"
                                @on-change="handleChange" />
                        </template>
                    </div>
                </div>
            </div>
            <template v-else>
                <div class="mar-lr" :key="indexKey">
                    <renderSlot
                        :name="indexKey"
                        :last-value="lastSlots[indexKey]"
                        :describe="group"
                        :is-has-group="false"
                        :component-id="componentId"
                        @on-change="handleChange" />
                </div>
            </template>
        </template>
    </div>
</template>

<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import renderSlot from './render-slot.vue'
    import { encodeRegexp } from '../../component/utils'
    import { isEmpty } from '@/common/util'
    export default {
        components: {
            renderSlot
        },
        props: {
            keyword: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                isShow: true,
                lastSlots: {}
            }
        },
        computed: {
            filerConfig () {
                const reg = new RegExp(encodeRegexp(this.keyword), 'i')
                return Object.keys(this.config).filter(configName => {
                    return reg.test(window.i18n.t(this.config[configName]?.displayName) + `${this.config[configName].type.length <= 1 ? `(${this.config[configName]?.type[0]})` : ''}`)
                }).reduce((result, key) => {
                    result[key] = this.config[key]
                    return result
                }, {})
            },
            slotGroupList () {
                if (this.keyword.length) {
                    return this.filerConfig
                } else {
                    const groups = this.componentNode?.material?.groups || []
                    const slotGroups = []
                    Object.keys(this.filerConfig).reduce((pre, cur) => {
                        // 该插槽无法用 值 变量 表达式
                        if (this.filerConfig[cur].type.includes('remote')) {
                            const aGroup = {
                                value: cur,
                                label: this.filerConfig[cur]?.displayName,
                                isDisplay: true,
                                groupSlots: {}
                            }
                            aGroup.groupSlots[cur] = this.filerConfig[cur]
                            pre.push(aGroup)
                        } else {
                            const groupVal = this.filerConfig[cur]?.belongGroup || 'defSlot'
                            const groupItem = pre.find(item => item.value === groupVal)
                            if (!pre?.length || !groupItem) {
                                const aGroup = {
                                    value: groupVal,
                                    label: groupVal === 'defSlot' ? this.filerConfig[cur]?.displayName || '默认插槽' : groups.find(item => item.value === groupVal)?.label,
                                    isDisplay: true,
                                    groupSlots: {}
                                }
                                aGroup.groupSlots[cur] = this.filerConfig[cur]
                                pre.push(aGroup)
                            }
                            if (groupItem) {
                                groupItem.isDisplay ??= true
                                groupItem.groupSlots ??= {}
                                groupItem.groupSlots[cur] = this.filerConfig[cur]
                            }
                        }
                        return pre
                    }, slotGroups)
                    return slotGroups
                }
            },
            hasGroupSlot () {
                return (group) => {
                    if (isEmpty(group.groupSlots)) {
                        return false
                    }
                    if (!Object.keys(group.groupSlots).length) {
                        return false
                    }
                    return true
                }
            }
        },
        created () {
            this.isInnerChange = false
            this.componentNode = LC.getActiveNode()
            // 布局类型的组件不支持 slot 配置
            if (this.componentNode.layoutType) {
                this.isShow = false
                return
            }
            const {
                componentId,
                material,
                renderSlots,
                layoutSlotType
            } = this.componentNode
            const slotConfig = material.slots || {}
            this.componentId = componentId
            
            this.config = Object.keys(slotConfig).reduce((result, slotName) => {
                // slot 支持拖拽就不支持配置
                if (_.has(layoutSlotType, slotName)) {
                    return result
                }
                const config = slotConfig[slotName]
                if (config.name?.includes('layout') || config.display !== 'hidden') {
                    result[slotName] = config
                }
                return result
            }, {})
            this.lastSlots = Object.freeze(_.cloneDeep(renderSlots))

            const updateCallback = _.debounce((event) => {
                if (event.target.componentId !== this.componentId) {
                    return
                }
                if (this.isInnerChange) {
                    this.isInnerChange = false
                    return
                }

                this.lastSlots = Object.freeze(_.cloneDeep(this.componentNode.renderSlots))
            }, 100)

            LC.addEventListener('setRenderSlots', updateCallback)
            LC.addEventListener('setSlot', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('setRenderSlots', updateCallback)
                LC.removeEventListener('setSlot', updateCallback)
            })
        },

        methods: {
            handleChange: _.throttle(function (slotName, slotData) {
                this.lastSlots = Object.freeze({
                    ...this.lastSlots,
                    [slotName]: slotData
                })
                this.isInnerChange = true
                this.componentNode.setRenderSlots(slotData, slotName)
            }, 60),
            toggleShowGroupSlot (group) {
                group.isDisplay = !group.isDisplay
                this.$forceUpdate()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .modifier-slot {
        .group-name {
            display: flex;
            justify-content: space-between;
            align-items: center;
            line-height: 40px;
            border-bottom: 1px solid #F5F7FA;
            cursor: pointer;
            margin: 0 10px;
            & > span:first-child {
                font-size: 12px;
                font-weight: 700;
                color: #313238;
            }
            i {
                font-size: 22px;
            }
            .icon-angle-down {
                cursor: pointer;
                font-size: 20px;
                margin-left: -5px;
                margin-right: 3px;
                transition: transform 200ms;
                &.close {
                    transform: rotate(-90deg);
                }
            }
        }
        .group-bt {
            border-bottom: 1px solid #EAEBF0;
        }
        .mar-lr{
            margin: 0 10px;
        }
    }
</style>
