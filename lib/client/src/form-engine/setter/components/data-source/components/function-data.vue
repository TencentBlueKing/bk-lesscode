<template>
    <div class="api-data-source">
        <remote
            :payload="formData.payload.methodData"
            :default-value="''"
            :remote-validate="validate"
            :change="handleSelectFunction"
            :describe="describe">
        </remote>
        <select-key
            value-type="select-remote"
            :keys="describe.keys"
            :value-keys="formData.keys"
            :value="formData.returnedValue"
            :payload="formData.payload"
            @change="handleKeyValChange">
        </select-key>
    </div>
</template>
<script>
    import { computed, defineComponent, ref, watch } from '@vue/composition-api'
    import cloneDeep from 'lodash.clonedeep'
    import Remote from '@/element-materials/modifier/component/props/components/strategy/remote'
    import SelectKey from '@/element-materials/modifier/component/slots/components/common/select-key.vue'

    export default defineComponent({
        components: {
            Remote,
            SelectKey
        },
        props: {
            config: Object
        },
        setup(props, { emit }) {
            const formData = ref({})

            const describe = ref({
                val: [{ label: '选项1', value: 'XUANXIANG1' }, { label: '选项2', value: 'XUANXIANG2' }],
                keys: [{ id: 'id', label: '值', tips: '选项的值，不填取 id 字段' }, { id: 'name', label: '名称', tips: '选项展示的名称，不填取 name 字段' }]
            })

            watch(() => props.config, val => {
                formData.value = cloneDeep(val)
            }, { immediate: true })

            const validate = (val) => {
                if (!Array.isArray(val)) return '返回值需要是数组'
            }

            // 选择函数
            const handleSelectFunction = (name, val, type, methodData) => {
                console.log('selectFunction: ', val, methodData)
                formData.value.payload.methodData = methodData
                formData.value.returnedValue = val
                updateConfig()
            }

            // 字段映射修改
            const handleKeyValChange = (val) => {
                formData.value.keys = val
                updateConfig()
            }

            const updateConfig = () => {
                emit('update', formData.value)
            }

            return { describe, formData, validate, handleSelectFunction, handleKeyValChange }
        },
    })
</script>
