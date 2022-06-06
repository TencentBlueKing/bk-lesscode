<template>
    <section>
        <bk-tab
            class="tab-main"
            type="unborder-card"
            :active.sync="activeTab"
            :label-height="42"
        >
            <bk-tab-panel
                v-for="(panel, index) in panels"
                v-bind="panel"
                :key="index">
            </bk-tab-panel>
        </bk-tab>
        <component
            class="tab-component"
            :is="activeTab"
            :scheme="editScheme"
            :disable-edit-root="disableEditRoot"
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
        getDefaultApiParamEditScheme,
        API_PARAM_TYPES,
        parseObjectValue2EditScheme,
        parseEditScheme2JsonScheme
    } from 'shared/api'
    import DynamicObject from './dynamic-object.vue'
    import PreviewObject from './preview-object.vue'

    export default defineComponent({
        components: {
            DynamicObject,
            PreviewObject
        },

        props: {
            param: Object,
            disableEditRoot: Boolean
        },

        setup (props, { emit }) {
            const panels = [
                { name: 'dynamic-object', label: '模板' },
                { name: 'preview-object', label: '预览' }
            ]
            const activeTab = ref('dynamic-object')
            const editScheme = ref({})

            const validate = () => {
                return new Promise((resolve, reject) => {
                    try {
                        const jsonScheme = parseEditScheme2JsonScheme(editScheme.value)
                        resolve(jsonScheme)
                    } catch (err) {
                        reject(err.message || err)
                    }
                })
            }

            const handleChange = (scheme) => {
                editScheme.value = scheme
                validate().then((jsonScheme) => {
                    emit('change', jsonScheme)
                })
            }

            watch(
                () => props.param,
                () => {
                    const scheme = getDefaultApiParamEditScheme({
                        name: 'root',
                        type: API_PARAM_TYPES.OBJECT.VAL
                    })
                    editScheme.value = parseObjectValue2EditScheme(props.param, scheme)
                },
                {
                    immediate: true
                }
            )

            return {
                panels,
                activeTab,
                editScheme,
                validate,
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
