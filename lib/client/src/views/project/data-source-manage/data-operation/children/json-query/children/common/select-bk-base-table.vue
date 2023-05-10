<template>
    <section class="select-table">
        <span class="select-title">{{ $t('数据表') }}</span>
        <bk-select
            searchable
            :search-placeholder="$t('输入业务下的表名进行搜索（需要先展开业务）')"
            :class="{
                'select-main': true,
                'is-error': isError
            }"
            :show-empty="false"
            :value="tableName"
            @clear="handleChange"
        >
            <span
                v-bk-overflow-tips
                class="display-value"
                slot="trigger"
            >
                {{ tableName }}
                <i class="bk-select-angle bk-icon icon-angle-down"></i>
            </span>
            <bk-option-group
                v-for="bkBaseBiz in renderBkBaseBizList"
                :key="bkBaseBiz.bkBizId"
                :name="bkBaseBiz.bkBizName"
            >
                <span slot="group-name">
                    <i
                        v-if="isOpenIds.includes(bkBaseBiz.bkBizId)"
                        class="node-folder-icon mr5 bk-icon icon-down-shape"
                        @click="handleHideOptions(bkBaseBiz.bkBizId)"
                    ></i>
                    <span
                        v-else-if="isLoadingIds.includes(bkBaseBiz.bkBizId)"
                        class="mr5 span-loading"
                    ></span>
                    <i
                        v-else
                        class="node-folder-icon mr5 bk-icon icon-right-shape"
                        @click="handleShowOptions(bkBaseBiz.bkBizId)"
                    ></i>
                    <span>{{ bkBaseBiz.bkBizName }}</span>
                </span>
                <template v-if="isOpenIds.includes(bkBaseBiz.bkBizId)">
                    <bk-option
                        v-for="table in bkBaseBiz.tables"
                        :key="table.id"
                        :id="table.tableName"
                        :name="table.tableName"
                        @click.native="handleChange(table.tableName, table.bkBizId)"
                    >
                    </bk-option>
                    <bk-exception
                        v-if="bkBaseBiz.tables.length <= 0 && bkBaseBiz.loaded"
                        ext-cls="exception-wrap-item exception-part"
                        type="empty"
                        scene="part"
                    >
                        {{ $t('暂无数据') }} </bk-exception>
                </template>
            </bk-option-group>
        </bk-select>
        <i
            v-if="isError"
            v-bk-tooltips="{ content: $t('数据表是必填项') }"
            class="bk-icon icon-exclamation-circle-shape tooltips-icon"
        ></i>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        watch,
        ref,
        toRef,
        onBeforeUnmount
    } from '@vue/composition-api'
    import { useStore } from '@/store'
    import {
        ITable
    } from './select-table.vue'
    import validateContainer from '../composables/validate'
    import {
        isEmpty
    } from 'shared/util'

    export interface IBkBaseBiz {
        bkBizId: string
        bkBizName: string
        loaded: boolean,
        tables: ITable[]
    }

    export default defineComponent({
        props: {
            tableName: String,
            bkBaseBizList: Array as PropType<IBkBaseBiz[]>
        },

        setup (props, { emit }) {
            const store = useStore()
            const isError = ref(false)
            const isLoadingIds = ref([])
            const isOpenIds = ref([])
            const renderBkBaseBizList = toRef(props, 'bkBaseBizList')

            const handleHideOptions = (bkBizId) => {
                const index = isOpenIds.value.findIndex(isOpenId => isOpenId === bkBizId)
                isOpenIds.value.splice(index, 1)
            }

            const handleShowOptions = (bkBizId) => {
                const bkBaseBiz = renderBkBaseBizList.value.find(bkBaseBiz => bkBaseBiz.bkBizId === bkBizId)
                if (!bkBaseBiz.loaded) {
                    // 加载数据
                    isLoadingIds.value.push(bkBizId)
                    store
                        .dispatch('dataSource/getBkBaseTables', bkBizId)
                        .then((data) => {
                            // 展开
                            isOpenIds.value.push(bkBizId)
                            // 全局更新数据
                            bkBaseBiz.loaded = true
                            bkBaseBiz.tables = data?.list || []
                            emit('updataBizs', renderBkBaseBizList.value)
                        })
                        .finally(() => {
                            const index = isLoadingIds.value.findIndex(isLoadingId => isLoadingId === bkBizId)
                            isLoadingIds.value.splice(index, 1)
                        })
                } else {
                    // 直接展开
                    isOpenIds.value.push(bkBizId)
                }
            }

            const handleChange = (tableName = '', bkBizId = '') => {
                if (!isEmpty(tableName)) {
                    isError.value = false
                }
                emit('change', { tableName, bkBizId })
            }

            const validate = () => {
                if (isEmpty(props.tableName)) {
                    isError.value = true
                    return Promise.reject(new Error(window.i18n.t('数据表不能为空')))
                } else {
                    isError.value = false
                    return Promise.resolve()
                }
            }

            watch(
                () => props.bkBaseBizList,
                () => {
                    if (!props.bkBaseBizList?.some(biz => biz.tables?.some(table => table.tableName === props.tableName))) {
                        handleChange('')
                    }
                },
                {
                    immediate: true,
                    deep: true
                }
            )

            // 本组件需要注册校验方法
            validateContainer.register(validate)
            onBeforeUnmount(() => validateContainer.unRegister(validate))

            return {
                isError,
                isLoadingIds,
                isOpenIds,
                renderBkBaseBizList,
                handleHideOptions,
                handleShowOptions,
                handleChange,
                validate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-table {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        &:hover {
            .select-title {
                background: #EAEBF0;
            }
        }
        .select-title {
            width: 65px;
            background: #F5F7FA;
            border: 1px solid #C4C6CC;
            border-radius: 2px 0px 0px 2px;
            line-height: 30px;
            font-size: 12px;
            padding: 0 12px;
            text-align: center;
        }
        .select-main {
            background: #fff;
            width: calc(100% - 65px);
            max-width: calc(100% - 65px);
            margin-left: -1px;
            z-index: 5;
            /deep/ .bk-tooltip-ref {
                height: 30px;
            }
        }
        .is-error {
            border-color: #ff5656;
        }
        .icon-exclamation-circle-shape {
            cursor: pointer;
            position: absolute;
            z-index: 10;
            right: 8px;
            top: 8px;
            color: #ea3636;
        }
    }
    .display-value {
        display: inline-block;
        line-height: 30px;
        padding: 0 36px 0 10px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /deep/ .exception-wrap-item {
        .bk-exception-text {
            font-size: 12px;
            margin-top: -20px;
            margin-bottom: 10px;
            color: #979ba5;
        }
    }
    .node-folder-icon {
        cursor: pointer;
    }
    .span-loading {
        display: inline-block;
        width: 12px;
        &:before {
            content: "";
            display: inline-block;
            position: absolute;
            width: 16px;
            height: 16px;
            top: 8px;
            background-image: url('../../../../../../../../images/svg/loading.svg');
        }
    }
</style>
