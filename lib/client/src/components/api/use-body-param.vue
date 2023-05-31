<template>
    <div class="post-request-params">
        <bk-table
            size="small"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            :data="paramsTableData">
            <bk-table-column :label="$t('名称')" min-width="120">
                <template slot-scope="props">
                    <div class="key" :style="{ marginLeft: `${props.row.level * 15}px` }">
                        <i
                            v-if="'extend' in props.row"
                            :class="['bk-icon', 'icon-right-shape', 'fold-icon', { extend: props.row.extend }]"
                            @click="handleParamExtend(props.row)">
                        </i>
                        {{ props.row.key }}
                    </div>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('类型')" property="type" width="80"></bk-table-column>
            <bk-table-column :label="$t('必须')" width="60">
                <template slot-scope="props">
                    {{ props.row.is_necessary ? $t('是') : $t('否') }}
                </template>
            </bk-table-column>
            <bk-table-column show-overflow-tooltip :label="$t('备注')" width="100">
                <template slot-scope="props">
                    <span :title="props.row.description">{{ props.row.description || '--' }}</span>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_参数值')" width="250">
                <template slot-scope="props">
                    <div class="params-value">
                        <slot v-bind:row="props.row"></slot>
                    </div>
                </template>
            </bk-table-column>
        </bk-table>
    </div>
</template>
<script>
    import { transSchemeToList } from '@/components/render-nocode/common/apiScheme'

    export default {
        name: 'useBodyParam',
        props: {
            params: {
                type: Object,
                default: () => ({})
            },
            editable: {
                type: Boolean,
                default: true
            },
            value: {
                type: Object
            }
        },
        data () {
            const list = []
            transSchemeToList(this.params, list)
            const paramsList = this.getParamsList(list)
            return {
                paramsList,
                paramsTableData: paramsList.slice(0)
            }
        },
        watch: {
            params (val) {
                const list = []
                transSchemeToList(val, list)
                const paramsList = this.getParamsList(list)
                this.paramsList = paramsList
                this.paramsTableData = paramsList.slice(0)
            }
        },
        methods: {
            // 拍平层级后的数据增加source、value、paramPath
            getParamsList (list) {
                return list.map(item => {
                    let value = ''
                    let source = ''
                    let paramPath = []
                    const canSetValue = this.editable && !['object', 'array'].includes(item.type)
                    if (canSetValue) {
                        paramPath = this.getParamPath(item, list)
                        value = paramPath.reduce((acc, crt) => acc[crt], this.value)
                        source = /^\$\{params_.*\}$/.test(item.value) ? 'FIELD' : 'CUSTOM'
                    }
                    return { ...item, value, source, canSetValue, paramPath }
                })
            },
            // 获取字段路径
            getParamPath (param, list) {
                let path = [param.key]
                if (param.parentId) {
                    const parentParam = list.find(item => item.id === param.parentId)
                    const parentPath = this.getParamPath(parentParam, list)
                    if (parentParam.type === 'array') {
                        parentPath.push(0)
                    }
                    path = [...parentPath, ...path]
                }
                return path
            },
            // 请求参数展开、收起
            handleParamExtend (prop) {
                prop.extend = !prop.extend
                if (prop.extend) {
                    // 展开
                    const index = this.paramsList.findIndex(item => item.id === prop.id)
                    const list = []
                    this.paramsList.slice(index + 1).some(item => {
                        if (item.level > prop.level) {
                            const parentParam = this.paramsList.find(p => p.id === item.parentId)
                            if (parentParam.extend) {
                                list.push(item)
                            }
                            return false
                        }
                        return true
                    })
                    this.paramsTableData.splice(index + 1, 0, ...list)
                } else {
                    // 收起
                    let num = 0
                    const index = this.paramsTableData.findIndex(item => item.id === prop.id)
                    this.paramsTableData.slice(index + 1).some(item => {
                        if (item.level > prop.level) {
                            num += 1
                            return false
                        }
                        return true
                    })
                    this.paramsTableData.splice(index + 1, num)
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
.key {
  position: relative;

  .fold-icon {
    position: absolute;
    top: 6px;
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
