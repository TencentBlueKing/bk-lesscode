<template>
    <section class="select-table">
        <span class="select-title" v-enClass="'overflowhidden-oh'" :title="$t('数据表')">{{ $t('数据表') }}</span>
        <bk-select
            :class="{
                'select-main': true,
                'is-error': isError
            }"
            :value="tableName"
            @change="handleChange"
        >
            <bk-option v-for="table in tableList"
                :key="table.id"
                :id="table.tableName"
                :name="table.tableName">
            </bk-option>
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
        onBeforeUnmount
    } from '@vue/composition-api'
    import {
        IColumn
    } from './select-field.vue'
    import validateContainer from '../composables/validate'
    import {
        isEmpty
    } from 'shared/util'

    export interface ITable {
        id: string
        tableName: string
        columns: IColumn[]
        bkBizId?: string
    }

    export default defineComponent({
        props: {
            tableName: String,
            tableList: Array as PropType<ITable[]>
        },

        setup (props, { emit }) {
            const isError = ref(false)

            const handleChange = (val) => {
                if (!isEmpty(val)) {
                    isError.value = false
                }
                emit('change', val)
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
                () => props.tableList,
                () => {
                    if (!props.tableList?.find(table => table.tableName === props.tableName)) {
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
</style>
