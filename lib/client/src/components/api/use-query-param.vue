<template>
    <bk-table
        size="small"
        :outer-border="false"
        :header-border="false"
        :header-cell-style="{ background: '#f0f1f5' }"
        :data="params">
        <bk-table-column :label="$t('名称')" prop="name" min-width="180"></bk-table-column>
        <bk-table-column :label="$t('必选')" width="60">
            <template slot-scope="props">
                {{ props.row.require ? $t('是') : $t('否') }}
            </template>
        </bk-table-column>
        <bk-table-column show-overflow-tooltip :label="$t('备注')" min-width="50">
            <template slot-scope="props">
                <span :title="props.row.desc">{{ props.row.desc || '--' }}</span>
            </template>
        </bk-table-column>
        <bk-table-column :label="$t('table_参数值')" width="290" fixed="right">
            <template slot-scope="props">
                <div class="params-value">
                    <slot v-bind:row="props.row"></slot>
                </div>
            </template>
        </bk-table-column>
    </bk-table>
</template>
<script>
    export default {
        name: 'useQueryParam',
        props: {
            params: {
                type: Array,
                default: () => []
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
