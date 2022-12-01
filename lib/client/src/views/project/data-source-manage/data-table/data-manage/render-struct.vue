<template>
    <article>
        <section class="table-section">
            <h5 class="section-title">基础信息</h5>
            <info-table :basic-info="activeTable" :is-edit="false"></info-table>
        </section>

        <section class="table-section">
            <h5 class="section-title">
                字段配置
                <bk-link
                    v-if="environment.key === 'preview'"
                    :href="`/project/${projectId}/data-source-manage/edit-table?tableName=${activeTable.tableName}`"
                    target="_blank"
                    theme="primary"
                    class="title-link"
                >设计表结构</bk-link>
            </h5>
            <show-column-table :columns="activeTable.columns"></show-column-table>
        </section>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType
    } from '@vue/composition-api'
    import infoTable from '../common/info-table.vue'
    import showColumnTable from '../common/show-column-table.vue'
    import { useRoute } from '@/router'

    interface ITable {
        tableName: string,
        columns: any[]
    }

    export default defineComponent({
        components: {
            infoTable,
            showColumnTable
        },
        props: {
            activeTable: Object as PropType<ITable>,
            environment: Object as PropType<{ key: string, name: string }>
        },
        setup () {
            const route = useRoute()
            const projectId = route.params.projectId
            return {
                projectId
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .table-section {
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(25,25,41,0.1);
        padding: 16px 24px 25px;
        margin-bottom: 23px;
        .section-title {
            font-weight: 700;
            text-align: left;
            color: #313238;
            line-height: 19px;
            font-size: 14px;
            margin: 0 0 12px;
        }
        .title-link {
            font-weight: normal;
            vertical-align: baseline;
            margin-left: 5px;
        }
    }
</style>
