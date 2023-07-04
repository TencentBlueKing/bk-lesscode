<template>
    <bk-table
        class="g-hairless-table"
        :header-border="false"
        :header-cell-style="{ background: '#f0f1f5' }"
        :outer-border="false"
        :data="columns"
    >
        <bk-table-column :label="$t('table_字段名称')" prop="name" show-overflow-tooltip></bk-table-column>
        <bk-table-column :label="$t('table_字段类型')" prop="type"></bk-table-column>
        <bk-table-column :label="$t('table_主键')" prop="primary" :formatter="boolFormatter"></bk-table-column>
        <bk-table-column :label="$t('长度')" prop="length"></bk-table-column>
        <bk-table-column :label="$t('table_小数点')" prop="scale"></bk-table-column>
        <bk-table-column :label="$t('索引')" prop="index" :formatter="boolFormatter"></bk-table-column>
        <bk-table-column :label="$t('table_唯一性约束')" prop="unique" :formatter="boolFormatter"></bk-table-column>
        <bk-table-column :label="$t('可空')" prop="nullable" :formatter="boolFormatter"></bk-table-column>
        <bk-table-column :label="$t('默认值')" prop="default" :formatter="defaultFormatter" show-overflow-tooltip></bk-table-column>
        <bk-table-column :label="$t('备注')" prop="comment" show-overflow-tooltip></bk-table-column>
        <empty-status slot="empty"></empty-status>
    </bk-table>
</template>

<script lang="ts">
    import {
        defineComponent
    } from '@vue/composition-api'
    import {
        BASE_COLUMNS
    } from 'shared/data-source/constant'

    export default defineComponent({
        props: {
            columns: Array
        },

        setup () {
            const baseColumns = BASE_COLUMNS()

            const boolFormatter = (row, column, cellValue, index) => {
                const valMap = {
                    true: window.i18n.t('是')
                }
                return valMap[cellValue] || window.i18n.t('否')
            }

            const defaultFormatter = (row, column, cellValue, index) => {
                const baseColumn = baseColumns.find((baseColumn) => baseColumn.name === row.name)
                return baseColumn?.default || cellValue
            }

            return {
                boolFormatter,
                defaultFormatter
            }
        }
    })
</script>
