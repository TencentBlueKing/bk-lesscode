<template>
    <section>
        <group
            class="setting-group"
            :show-border-top="true"
            group-name="页面样式配置">
            <template>
                <section>
                    <div class="setting-label">
                        <span>最小宽度</span>：
                    </div>
                    <div class="setting-content">
                        <size-input :value="minWidth.value" @change="handleItemChange('minWidth', 'value', $event)" style="width: 100%">
                            <div style="padding: 8px 4px;">
                                <size-unit :value="minWidth.unit" @change="handleItemChange('minWidth', 'unit', $event)"></size-unit>
                            </div>
                        </size-input>
                    </div>
                </section>
                <section>
                    <div class="setting-label">
                        <span>背景色</span>：
                    </div>
                    <div class="setting-content">
                        <bk-color-picker
                            :value="styleSetting.backgroundColor"
                            style="width: 100%;"
                            @change="updateStyleSetting('backgroundColor', $event)" />
                    </div>
                </section>
            </template>
        </group>
        <margin-padding :value="styleSetting" :change="updateStyleSetting">
        </margin-padding>
    </section>
</template>

<script>
    import marginPadding from '../../../component/styles/strategy/margin-padding'
    import Group from '@/components/ui/group'
    import SizeInput from '@/components/modifier/icon-size-input'
    import SizeUnit from '@/components/modifier/size-unit'
    import { mapGetters } from 'vuex'
    import { splitValueAndUnit } from '@/common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'
    import LC from '@/element-materials/core'

    export default {
        components: {
            marginPadding,
            Group,
            SizeInput,
            SizeUnit
        },
        mixins: [defaultUnitMixin],
        data () {
            return {
                minWidth: {
                    value: '',
                    unit: ''
                }
                // styleFields: [
                //     {
                //         id: 'minWidth',
                //         name: '最小宽度'
                //     },
                //     {
                //         id: 'backgroundColor',
                //         name: '背景色'
                //     }
                // ]
            }
        },
        computed: {
            ...mapGetters('page', {
                platform: 'platform',
                page: 'pageDetail'
            }),
            styleSetting () {
                console.log(this.page.styleSetting, 'page style')
                return this.page.styleSetting || {}
            }
        },
        created () {
            this.minWidth.value = splitValueAndUnit('value', this.page.styleSetting?.minWidth)
            this.minWidth.unit = splitValueAndUnit('unit', this.page.styleSetting?.minWidth) || this.defaultUnit
        },
        methods: {
            updateStyleSetting (key, value) {
                console.log(key, value, 8899)
                const styleSetting = Object.assign({}, this.page.styleSetting, { [key]: value })
                this.$store.commit('page/setPageDetail', {
                    ...this.page,
                    styleSetting
                })
                LC.pageStyle = styleSetting
            },
            handleItemChange (key, field, val) {
                this[key][field] = val
                let value = ''
                if (this[key].value) {
                    value = this[key].value + this[key].unit
                }
                this.updateStyleSetting(key, value)
            }
        }
    }
</script>
