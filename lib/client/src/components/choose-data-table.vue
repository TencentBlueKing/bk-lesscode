<template>
    <section>
        <bk-select
            searchable
            :value="value"
            :loading="isLoadingList"
            @selected="handleSelectTable"
            @toggle="handleToggleSelect"
            @clear="handleClearTable"
        >
            <bk-option v-for="table in tableList"
                :key="table.tableName"
                :id="table.tableName"
                :name="table.tableName">
            </bk-option>
            <div slot="extension" @click="handleCreate" style="cursor: pointer;">
                <i class="bk-icon icon-plus-circle"></i>新增
            </div>
        </bk-select>
        <bk-button
            class="mt10"
            theme="primary"
            size="small"
            :disabled="!value"
            :loading="isLoading"
            @click="handleSelectTable(value)"
        >获取数据</bk-button>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        onBeforeMount
    } from '@vue/composition-api'
    import { messageError } from '@/common/bkmagic'
    import store from '@/store'
    import router from '@/router'

    export default defineComponent({
        props: {
            value: String
        },

        setup (props, { emit }) {
            const isLoading = ref(false)
            const isLoadingList = ref(false)
            const projectId = router?.currentRoute?.params?.projectId
            const tableList = ref([])

            const handleSelectTable = (tableName) => {
                isLoading.value = true
                const queryData = {
                    projectId,
                    environment: 'preview',
                    tableName
                }
                store.dispatch('dataSource/getOnlineTableDatas', queryData).then((data) => {
                    const table = tableList.value.find((table) => table.tableName === tableName)
                    emit('update:value', tableName)
                    emit('choose', { tableName, data, table })
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    isLoading.value = false
                })
            }

            const handleToggleSelect = (isOpen) => {
                if (isOpen) {
                    getTableList()
                }
            }

            const getTableList = () => {
                isLoadingList.value = true
                store.dispatch('dataSource/list', { projectId }).then((data) => {
                    tableList.value = data.list || []
                }).finally(() => {
                    isLoadingList.value = false
                })
            }

            const handleCreate = () => {
                window.open(`/project/${projectId}/data-source-manage/`, '_blank')
            }

            const handleClearTable = () => {
                emit('clear')
            }

            onBeforeMount(() => {
                getTableList()
                // 初始化的时候，需要同步获取最新的表数据
                if (props.value) {
                    handleSelectTable(props.value)
                }
            })

            return {
                isLoading,
                isLoadingList,
                tableList,
                handleSelectTable,
                handleCreate,
                handleToggleSelect,
                handleClearTable
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .icon-plus-circle {
        display: inline-block;
        vertical-align: baseline;
        font-size: 12px;
        margin-right: 4px;
    }
</style>
