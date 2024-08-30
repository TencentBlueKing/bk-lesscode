<template>
    <div class="render-fields-canvas">
        <div id="form-layout-container-comp"></div>
    </div>
</template>
<script>
    /**
     * 表单渲染组件按照bk-lesscode-render的封装格式编写，支持vue2/3，需要在bk-lesscode-render环境下使用
     */
    import {
        h,
        render,
        destory,
        framework
    } from 'bk-lesscode-render'
    import 'bk-lesscode-render/dist/index.css'
    import { i18nConfig } from '@/locales/i18n.js'
    import router from '@/router'
    import WidgetFormLayout from '@/form-engine/layout/index'

    export default {
        name: 'RenderFieldsCanvas',
        props: {
            type: String,
            fields: {
                type: Array,
                default: () => []
            }
        },
        mounted () {
            render({
                component: h({
                    component: WidgetFormLayout,
                    on: {
                        update: this.update,
                        activeField: this.activeField
                    }
                }),
                props: {
                    fields: this.fields,
                    dataSource: { type: this.type },
                    emptyTips: window.i18n.t('请拖入表单编辑器控件')
                },
                selector: '#form-layout-container-comp',
                router: framework === 'vue2' ? router : null,
                i18nConfig
            })
        },
        beforeDestroy () {
            destory()
        },
        methods: {
            update (list) {
                this.$emit('update', list)
            },
            activeField (field) {
                this.$emit('selected', field)
            }
        }
    }
</script>
<style lang="postcss">
    .render-fields-canvas {
        padding: 20px;
        height: 100%;
        background: #ffffff;
        overflow: auto;
        .bkform-engine-field-widget {
            margin-bottom: 0;
            .rich-text-container {
                pointer-events: none;
            }
        }
    }
</style>
