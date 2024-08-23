<template>
    <div class="choose-flow-action">
        <div class="label-select">
            <div class="label">{{ $t('流程') }}</div>
            <bk-select
                v-model="copyEventValue.flow.id"
                :searchable="true"
                :loading="loading"
                @change="change">
                <bk-option
                    v-for="flow in flowList"
                    :key="flow.id"
                    :id="flow.id"
                    :name="flow.name" />
            </bk-select>
        </div>
        <div class="label-select">
            <div class="label">{{ $t('操作') }}</div>
            <bk-select v-model="copyEventValue.flow.actionName" @change="change">
                <bk-option id="createTask" :name="$t('创建任务')" />
                <bk-option id="createAndExcute" :name="$t('创建并执行任务')" />
            </bk-select>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'ChooseFlowAction',
        props: {
            eventValue: Object
        },
        data () {
            return {
                loading: true,
                copyEventValue: {},
                flowList: []
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        created () {
            this.copyEventValue = JSON.parse(JSON.stringify(this.eventValue))
            if (!this.eventValue?.flow) {
                this.copyEventValue.flow = {
                    id: '',
                    taskId: '',
                    actionName: ''
                }
            }
            this.getFlowList()
        },
        methods: {
            async getFlowList () {
                this.loading = true
                const res = await this.$store.dispatch('flow/tpl/getTplList', { projectId: this.projectId })
                this.flowList = res.list
                this.loading = false
            },
            change () {
                this.$emit('change', {
                    ...this.copyEventValue,
                    flow: this.copyEventValue.flow
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .label-select {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .label {
            padding: 0 15px;
            height: 32px;
            line-height: 32px;
            min-width: 80px;
            text-align: center;
            font-size: 12px;
            color: #63656e;
            background: #f2f4f8;
            border: 1px solid #c4c6cc;
        }
        .bk-select {
            flex: 1;
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            background: #ffffff;
        }
    }
</style>
