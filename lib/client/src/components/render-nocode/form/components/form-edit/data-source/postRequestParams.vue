<template>
    <use-body-param
        :params="params"
        :editable="editable"
        :value="localVal"
    >
        <template v-slot:default="slotProps">
            <template v-if="slotProps.row.canSetValue">
                <bk-select
                    v-if="useVariable"
                    v-model="slotProps.row.source"
                    behavior="simplicity"
                    style="width: 99px; margin-right: 4px"
                    :clearable="false"
                    @change="handleValueChange('', slotProps.row.paramPath)">
                    <bk-option id="CUSTOM" :name="$t('自定义')"></bk-option>
                    <bk-option id="FIELD" :name="$t('引用变量')"></bk-option>
                </bk-select>
                <bk-select
                    v-if="slotProps.row.source === 'FIELD'"
                    v-model="slotProps.row.value"
                    behavior="simplicity"
                    :placeholder="$t('请选择变量')"
                    style="width: 110px"
                    :searchable="true"
                    @change="handleValueChange($event, slotProps.row.paramPath)">
                    <bk-option v-for="field in fieldList" :key="field.key" :id="field.key" :name="field.name"></bk-option>
                </bk-select>
                <template v-else>
                    <bk-input
                        v-if="['string', 'number'].includes(slotProps.row.type)"
                        v-model="slotProps.row.value"
                        behavior="simplicity"
                        :placeholder="$t('请输入参数值')"
                        style="width: 110px"
                        :type="slotProps.row.type === 'number' ? 'number' : 'text'"
                        @change="handleValueChange($event, slotProps.row.paramPath)">
                    </bk-input>
                    <bk-select
                        v-if="slotProps.row.type === 'boolean'"
                        v-model="slotProps.row.value"
                        @change="handleValueChange($event, slotProps.row.paramPath)">
                        <bk-option :id="true" name="true"></bk-option>
                        <bk-option :id="false" name="false"></bk-option>
                    </bk-select>
                </template>
            </template>
            <span v-else>{{ slotProps.row.value }}</span>
        </template>
    </use-body-param>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import UseBodyParam from '@/components/api/use-body-param.vue'

    export default {
        name: 'PostRequestParams',
        components: {
            UseBodyParam
        },
        props: {
            flowId: Number,
            nodeId: Number,
            params: {
                type: Object,
                default: () => ({})
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
                localVal: cloneDeep(this.value),
                fieldList: [],
                fieldListLoading: false
            }
        },
        watch: {
            value (val) {
                this.localVal = cloneDeep(val)
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
            handleValueChange (val, paramPath) {
                const pathLen = paramPath.length
                paramPath.reduce((acc, crt, index) => {
                    if (index === pathLen - 1) {
                        acc[crt] = val
                    }
                    return acc[crt]
                }, this.localVal)
                this.$emit('change', cloneDeep(this.localVal))
            }
        }
    }
</script>
<style lang="postcss" scoped>
.key {
  position: relative;

  .fold-icon {
    position: absolute;
    top: 2px;
    left: -15px;
    display: inline-block;
    color: #c0c4cc;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      color: #3a84ff;
    }

    &.extend {
      transform: rotate(90deg);
    }
  }
}

.params-value {
  display: flex;
  align-items: center;
}
</style>
