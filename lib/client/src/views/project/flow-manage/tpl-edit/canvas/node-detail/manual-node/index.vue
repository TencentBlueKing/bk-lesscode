<template>
    <div class="manual-node-config">
        <bk-form
            ref="basicFormRef"
            form-type="vertical"
            :rules="rules"
            :model="nodeData.config">
            <form-section :title="$t('基础配置')">
                <node-name :value="nodeData.config.name" @change="handleChange('name', $event)" />
                <node-processor :processor="nodeData.config.processor" @change="handleChange('processor', $event)" />
            </form-section>
            <form-section :title="$t('表单配置')">
                <bk-form-item>
                    <form-binding-config :nodes="nodes" :config="nodeData.config" @update="handleUpdateBinding" />
                </bk-form-item>
            </form-section>
        </bk-form>
    </div>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'
    import FormSection from '../components/form-section.vue'
    import NodeName from '../components/node-name.vue'
    import NodeProcessor from '../components/node-processor.vue'
    import FormBindingConfig from './form-binding-config/index.vue'

    export default defineComponent({
        name: 'ManualNodeConfig',
        components: {
            FormSection,
            NodeName,
            NodeProcessor,
            FormBindingConfig
        },
        props: {
            nodes: {
                type: Array,
                default: () => []
            },
            detail: {
                type: Object,
                default: () => ({})
            }
        },
        setup(props, { emit }) {
            const rules = {
                name: [
                    {
                        required: true,
                        message: window.i18n.t('必填项'),
                        trigger: 'blur'
                    }
                ]
            }

            const nodeData = ref(JSON.parse(JSON.stringify(props.detail)))
            const basicFormRef = ref(null)

            const handleUpdateBinding = ({ formType, formId }) => {
                nodeData.value.config.formType = formType
                nodeData.value.config.formId = formId
                emit('change', nodeData.value)
            }

            const handleChange = (key, val) => {
                nodeData.value.config[key] = val
                console.log('nodeData: ', nodeData.value)
                emit('change', nodeData.value)
            }

            const validate = () => {
                return new Promise((resolve, reject) => {
                    basicFormRef.value.validate().then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }

            return {
                rules,
                nodeData,
                basicFormRef,
                handleUpdateBinding,
                handleChange,
                validate
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-form-item {
        width: 656px;
    }
</style>
