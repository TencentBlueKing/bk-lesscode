<template>
    <monaco
        language="sql"
        height="500"
        :value="sql"
        @change="handleSqlChange"
    >
        <span
            slot="title"
            class="sql-title"
        >SQL 编辑器（仅支持 SELECT 查询语句）</span>
    </monaco>
</template>

<script>
    import { defineComponent } from '@vue/composition-api'
    import Monaco from '@/components/monaco.vue'
    import {
        isEmpty
    } from 'shared/util'

    export default defineComponent({
        components: {
            Monaco
        },

        props: {
            sql: {
                type: String,
                default: ''
            }
        },

        setup (props, { emit }) {
            const handleSqlChange = (val) => {
                emit('change', val)
            }

            const validate = () => {
                if (isEmpty(props.sql)) {
                    return Promise.reject(new Error('Sql 语句不能为空'))
                } else if (!/;$/.test(props.sql?.trim())) {
                    return Promise.reject(new Error('Sql 语句不完整，需要是【;】号结尾'))
                } else {
                    return Promise.resolve()
                }
            }

            return {
                validate,
                handleSqlChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .sql-title {
        margin-left: 25px;
        color: #C4C6CC;
        font-size: 14px;
    }
</style>
