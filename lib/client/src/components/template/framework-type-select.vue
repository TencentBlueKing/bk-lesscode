<template>
    <bk-select
        v-model="frameworkTypeVal"
        :clearable="false"
        ext-cls="framework-select"
        @change="handleChange">
        <bk-option v-for="option in frameworkTypeList"
            :key="option.id"
            :id="option.id"
            :name="option.name">
        </bk-option>
    </bk-select>
</template>
<script>
    import { ref, watch, defineComponent } from 'vue'

    export default defineComponent({
        props: {
            type: {
                type: String,
                default: 'all'
            }
        },
        setup (_, { emit }) {
            const frameworkTypeList = [
                {
                    id: 'all',
                    name: window.i18n.t('全部')
                },
                {
                    id: 'vue2',
                    name: window.i18n.t('vue2')
                },
                {
                    id: 'vue3',
                    name: window.i18n.t('vue3')
                }
            ]
            const frameworkTypeVal = ref('all')
            watch(() => _.type, () => {
                frameworkTypeVal.value = _.type
            })
            
            const handleChange = (framework) => {
                emit('update:type', framework)
                emit('filter')
            }
            return {
                frameworkTypeList,
                frameworkTypeVal,
                handleChange
            }
        }
    })
</script>

<style lang="postcss"  scoped>
    .framework-select {
        width: 90px;
        background: #fff;
        display: inline-block;
        margin-right: 8px;
    }
</style>
