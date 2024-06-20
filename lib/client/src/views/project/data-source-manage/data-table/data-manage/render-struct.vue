<template>
    <article>
        <section class="table-section">
            <h5 class="section-title">{{ $t('基础信息') }}</h5>
            <info-table :basic-info="activeTable" :is-edit="false"></info-table>
        </section>

        <section class="table-section">
            <h5 class="section-title">
                {{ $t('字段配置') }} <bk-link
                    v-if="['preview', 'third-part'].includes(environment.key)"
                    theme="primary"
                    class="title-link"
                    @click="goToStruct"
                >{{ $t('设计表结构') }}</bk-link>
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
    import {
        useRoute,
        useRouter
    } from '@/router'

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
        setup (props) {
            const route = useRoute()
            const router = useRouter()
            const projectId = route.params.projectId
            const thirdPartDBId = route.query.thirdPartDBId
            const tab = route.query.tab

            const goToStruct = () => {
                const query = {
                    tableName: props.activeTable.tableName,
                    thirdPartDBId,
                    tab
                }
                router.push({
                    name: 'editTable',
                    query
                })
            }
            return {
                projectId,
                thirdPartDBId,
                goToStruct
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
