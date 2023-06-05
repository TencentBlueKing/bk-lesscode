<template>
    <section>
        <style-layout
            :title="$t('页面样式配置')">
            <template>
                <style-item :name="$t('最小宽度')" type="vertical">
                    <size-input :value="minWidth.value" @change="handleItemChange('minWidth', 'value', $event)" style="width: 100%">
                        <size-unit :value="minWidth.unit" @change="handleItemChange('minWidth', 'unit', $event)"></size-unit>
                    </size-input>
                </style-item>
                <style-item :name="$t('背景色')" type="vertical">
                    <bk-color-picker
                        :value="styleSetting.backgroundColor"
                        style="width: 100%;"
                        @change="updateStyleSetting('backgroundColor', $event)" />
                </style-item>
            </template>
        </style-layout>
        <style-layout
            :title="$t('字体预设')"
            :tips="$t('可以设置字体的显示偏好设置，如不设置，则默认使用系统默认字体')"
        >
            <i slot="header" class="bk-drag-icon bk-drag-undo-2" @click.stop="handleReset" v-bk-tooltips="{ content: $t('重置属性值') }"></i>
            <template>
                <style-item name="font-family" type="vertical">
                    <bk-input
                        type="textarea"
                        :value="fontFamily"
                        :rows="3"
                        @change="updateStyleSetting('fontFamily', $event)" />
                </style-item>
            </template>
        </style-layout>
        <margin-padding :value="styleSetting" :change="updateStyleSetting">
        </margin-padding>
    </section>
</template>

<script>
    import marginPadding from '../../../component/styles/strategy/margin-padding'
    import StyleLayout from '@/element-materials/modifier/component/styles/layout/index'
    import StyleItem from '@/element-materials/modifier/component/styles/layout/item'
    import SizeInput from '@/components/modifier/icon-size-input'
    import SizeUnit from '@/components/modifier/size-unit'
    import { mapGetters } from 'vuex'
    import { splitValueAndUnit } from '@/common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'
    import LC from '@/element-materials/core'

    export default {
        components: {
            marginPadding,
            StyleLayout,
            StyleItem,
            SizeInput,
            SizeUnit
        },
        mixins: [defaultUnitMixin],
        data () {
            return {
                minWidth: {
                    value: '',
                    unit: ''
                },
                defaultFontFamily: '-apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,Helvetica Neue,Arial,sans-serif',
                fontFamily: ''
            }
        },
        computed: {
            ...mapGetters('page', {
                platform: 'platform',
                page: 'pageDetail'
            }),
            styleSetting () {
                return this.page.styleSetting || {}
            }
        },
        created () {
            this.minWidth.value = splitValueAndUnit('value', this.page.styleSetting?.minWidth)
            this.minWidth.unit = splitValueAndUnit('unit', this.page.styleSetting?.minWidth) || this.defaultUnit
            if (this.page.styleSetting?.fontFamily) {
                this.fontFamily = this.page.styleSetting?.fontFamily
            } else {
                this.fontFamily = this.defaultFontFamily
            }
        },
        methods: {
            handleReset () {
                this.fontFamily = this.defaultFontFamily
                this.updateStyleSetting('fontFamily', this.fontFamily)
            },
            updateStyleSetting (key, value) {
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
