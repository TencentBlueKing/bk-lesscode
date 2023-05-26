<template>
    <use-query-param
        v-bkloading="{ isLoading: fieldListLoading, zIndex: 4 }"
        :params="paramsTableList"
    >
        <template v-slot:default="slotProps">
            <template v-if="editable">
                <bk-select
                    v-if="useVariable"
                    v-model="slotProps.row.source"
                    behavior="simplicity"
                    style="width: 99px; margin-right: 4px"
                    :clearable="false"
                    @change="handleSourceChange($event, slotProps.row)">
                    <bk-option id="CUSTOM" :name="$t('自定义')"></bk-option>
                    <bk-option id="FIELD" :name="$t('引用变量')"></bk-option>
                </bk-select>
                <bk-select
                    v-if="slotProps.row.source === 'FIELD'"
                    v-model="localVal[slotProps.row.name]"
                    behavior="simplicity"
                    :placeholder="$t('请选择变量')"
                    style="width: 150px"
                    :searchable="true"
                    :clearable="false"
                    @change="change">
                    <bk-option v-for="field in fieldList" :key="field.key" :id="field.key" :name="field.name"></bk-option>
                </bk-select>
                <div v-else :style="useVariable ? 'width: 150px' : 'width: 100%'">
                    <bk-select
                        v-if="slotProps.row.type === 'boolean'"
                        v-model="localVal[slotProps.row.name]"
                        behavior="simplicity"
                        style="background: #fff"
                        @change="change">
                        <bk-option :id="true" name="true"></bk-option>
                        <bk-option :id="false" name="false"></bk-option>
                    </bk-select>
                    <bk-input
                        v-else
                        v-model="localVal[slotProps.row.name]"
                        behavior="simplicity"
                        :placeholder="$t('请输入参数值')"
                        :type="slotProps.row.type === 'number' ? 'number' : 'text'"
                        @change="change">
                    </bk-input>
                </div>
            </template>
            <span v-else>{{ localVal[slotProps.row.name] }}</span>
        </template>
    </use-query-param>
</template>
<script>
    import UseQueryParam from '@/components/api/use-query-param.vue'

    export default {
        name: 'GetRequestParams',
        components: {
            UseQueryParam
        },
        props: {
            flowId: Number,
            nodeId: Number,
            params: {
                type: Array,
                default: () => []
            },
            useVariable: {
                // 参数值是否支持引用变量
                type: Boolean,
                default: true
            },
            value: {
                type: Object,
                default: () => ({})
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                fieldList: [],
                fieldListLoading: false,
                localVal: { ...this.value },
                paramsTableList: this.transToTableList()
            }
        },
        watch: {
            value (val) {
                this.localVal = { ...val }
            },
            params () {
                this.paramsTableList = this.transToTableList()
            }
        },
        created () {
            if (this.useVariable) {
                this.getFields()
            }
        },
        methods: {
            async getFields () {
                try {
                    this.fieldListLoading = true
                    const params = {
                        workflow: this.flowId,
                        state: this.nodeId
                    }
                    const res = await this.$store.dispatch('nocode/flow/getNodeVars', params)
                    this.fieldList = res.map(item => {
                        const { key, name } = item
                        return { key: `\${params_${key}}`, name }
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.fieldListLoading = false
                }
            },
            transToTableList () {
                return this.params.map(item => {
                    return { ...item, source: /^\$\{params_.*\}$/.test(this.value[item.name]) ? 'FIELD' : 'CUSTOM' }
                })
            },
            handleSourceChange (val, param) {
                this.localVal[param.name] = ''
                this.change()
            },
            change () {
                this.$emit('change', { ...this.localVal })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.params-value {
  display: flex;
  align-items: center;
}
</style>
