<template>
    <div class="manual-node-config">
        <form-section :title="$t('基础配置')">
            <bk-form
                ref="basicFormRef"
                form-type="vertical"
                :rules="rules"
                :model="nodeData">
                <node-name :value="nodeData.config.name" @change="handleChange('name', $event)" />
                <node-processor :processor="nodeData.config.processor" @change="handleChange('processor', $event)" />
            </bk-form>
        </form-section>
        <form-section :title="$t('表单配置')">
            <form-binding-config :config="nodeData.config" />
        </form-section>
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
            detail: {
                type: Object,
                default: () => ({})
            }
        },
        setup(props, { emit }) {
            const rules = {}

            const nodeData = ref(JSON.parse(JSON.stringify(props.detail)))
            const basicFormRef = ref(null)

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
                handleChange,
                validate
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-form {
        width: 656px;
    }
</style>
