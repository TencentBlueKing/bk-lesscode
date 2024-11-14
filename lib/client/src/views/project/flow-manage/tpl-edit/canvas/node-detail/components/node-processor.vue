<template>
    <bk-form-item :label="$t('处理人')" property="processor" :required="true">
        <div class="processor-form-wrapper">
            <bk-select v-model="typeVal" class="select-item" :clearable="false" @change="change">
                <bk-option v-for="item in typeList" :key="item.id" :id="item.id" :name="item.name" />
            </bk-select>
            <member-select
                v-if="typeVal === 'CUSTOM'"
                v-model="usersVal"
                class="user-select select-item"
                @change="change" />
        </div>
    </bk-form-item>
</template>
<script>
    import { defineComponent, ref } from 'vue';
    import MemberSelect from '@/components/flow-form-comp/form/components/memberSelect.vue'

    export default defineComponent({
        name: 'NodeProcessor',
        components: {
            MemberSelect
        },
        props: {
            processor: {
                type: Object,
                default: () => ({
                    type: 'ALL',
                    users: ''
                })
            }
        },
        setup (props, { emit }) {
            const typeList = [
                { id: 'ALL', name: '不限' },
                { id: 'CREATOR', name: '提单人' },
                { id: 'CUSTOM', name: '个人' }
            ]

            const typeVal = ref(props.processor?.type || 'ALL')
            const users = props.processor?.users || ''
            const usersVal = ref(users.length > 0 ? users.split(',') : [])

            const change = (val) => {
                console.log('user change: ', val)
                emit('change', { type: typeVal.value, users: usersVal.value.join(',') })
            }

            return {
                typeList,
                typeVal,
                usersVal,
                change
            }
        }
    });
</script>
<style lang="postcss" scoped>
    .processor-form-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .select-item {
        flex: 1;
    }
    .user-select {
        margin-left: 10px;
    }
</style>