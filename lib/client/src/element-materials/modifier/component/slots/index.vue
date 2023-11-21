<template>
    <div
        v-if="isShow && Object.keys(filerConfig).length"
        class="modifier-slot">
        <renderSlot
            v-for="(slotConfig, slotName) in filerConfig"
            :key="slotName"
            :name="slotName"
            :last-value="lastSlots[slotName]"
            :describe="slotConfig"
            :component-id="componentId"
            @on-change="handleChange" />
    </div>
</template>

<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import renderSlot from './render-slot.vue'
    import { encodeRegexp } from '../../component/utils'
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
            }, 60)
        }
    }
</script>

<style lang="postcss" scoped>
    .modifier-slot {
        margin: 0 10px;
    }
</style>
