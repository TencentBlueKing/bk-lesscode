<template>
    <section>
        <bk-tab
            class="tab-main"
            type="unborder-card"
            :active.sync="activeTab"
            :label-height="42"
            @tab-change="calcRenderComponent"
        >
            <bk-tab-panel
                v-for="(panel, index) in panels"
                v-bind="panel"
                :key="index">
            </bk-tab-panel>
        </bk-tab>
        <component
            class="tab-component"
            ref="componentRef"
            :is="renderComponent"
            :edit-scheme="editScheme"
            @change="handleChange"
        />
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        parseJsonScheme2EditScheme,
        parseEditScheme2JsonScheme
    } from 'shared/api'
    import DynamicObject from './children/dynamic-object.tsx'
    import DynamicArray from './children/dynamic-array.tsx'
    import PreviewObject from './children/preview-object.tsx'

    export default defineComponent({
        components: {
            DynamicObject,
            DynamicArray,
            PreviewObject
        },

        props: {
            param: [Object, Array]
        },

        setup (props, { emit }) {
            const panels = [
                { name: 'edit', label: '模板' },
                { name: 'preview', label: '预览' }
            ]
            const activeTab = ref('edit')
            const renderComponent = ref(null)
            const editScheme = ref()
            const componentRef = ref(null)

            const calcRenderComponent = () => {
                if (activeTab.value === 'edit') {
                    renderComponent.value = Array.isArray(props.param) ? DynamicArray : DynamicObject
                } else {
                    renderComponent.value = PreviewObject
                }
            }

            const validate = () => {
                return new Promise((resolve, reject) => {
                    componentRef
                        .value
                        .validate()
                        .then(() => {
                            resolve(getJsonScheme())
                        })
                        .catch((err) => {
                            reject(err.content || err)
                        })
                })
            }

            const handleChange = (scheme) => {
                editScheme.value = scheme
                emit('change', getJsonScheme())
            }

            const getJsonScheme = () => {
                let jsonScheme
                if (Array.isArray(editScheme.value)) {
                    jsonScheme = editScheme.value.map(parseEditScheme2JsonScheme)
                } else {
                    jsonScheme = parseEditScheme2JsonScheme(editScheme.value)
                }
                return jsonScheme
            }

            watch(
                () => props.param,
                () => {
                    editScheme.value = parseJsonScheme2EditScheme(props.param)
                    calcRenderComponent()
                },
                {
                    immediate: true
                }
            )

            return {
                panels,
                activeTab,
                renderComponent,
                editScheme,
                componentRef,
                validate,
                calcRenderComponent,
                handleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .tab-main {
        width: 200px;
        /deep/ .bk-tab-section {
            padding: 0;
        }
        /deep/ .bk-tab-header {
            height: 42px;
            background-image: none !important;
            .bk-tab-label-list {
                height: 42px !important;
                .bk-tab-label-item {
                    line-height: 42px !important;
                }
            }
        }
    }
    .tab-component {
        margin-top: 16px;
    }
</style>
