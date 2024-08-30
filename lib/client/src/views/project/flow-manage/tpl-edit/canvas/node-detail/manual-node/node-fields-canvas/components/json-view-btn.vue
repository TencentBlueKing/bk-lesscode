<template>
    <div class="json-view-btn">
        <bk-button @click="showDialog = true">{{ $t('查看JSON') }}</bk-button>
        <bk-dialog
            v-model="showDialog"
            :position="{ top: '10%', left: '10%' }"
            :show-mask="true"
            :mask-close="true"
            :auto-close="false"
            :close-icon="false"
            :draggable="false"
            render-directive="if"
            width="80%"
            header-position="left"
            ext-cls="code-json-dialog">
            <section class="vue-code">
                <json-view
                    ref="editDialog"
                    name="targetData"
                    type="json"
                    :show-input="false"
                    :default-value="[]"
                    :change="setImportData"
                    :dialog-title="$t('json数据将会覆盖当前已有页面内容')"/>
            </section>
    </bk-dialog>
    </div>
</template>
<script>
    import { defineComponent, ref, watch } from '@vue/composition-api'
    import JsonView from '@/element-materials/modifier/component/props/components/strategy/json-view.vue'
    import { circleJSON } from '@/common/util.js'


    export default defineComponent ({
        name: 'JsonViewBtn',
        components: {
            JsonView
        },
        props: {
            fields: {
                type: Array,
                default: () => []
            }
        },
        setup (props, { emit }) {
            const showDialog = ref(false)
            const codeData = ref(JSON.parse(JSON.stringify(props.fields)))

            watch(() => props.fields, (val) => {
                codeData.value = JSON.parse(JSON.stringify(val))
            })

            const setImportData = (name, data) => {
                if (data && Array.isArray(data)) {
                    codeData.value = circleJSON(data)
                    emit('update', codeData.value)
                }
            }

            return { showDialog, setImportData }
        }
    })
</script>
