<template>
    <div class="choose-flow-action">
        <div class="label-select">
            <div class="label">
                <span>{{ $t('流程') }}</span>
            </div>
            <bk-select
                v-model="copyEventValue.flow.id"
                :searchable="true"
                :loading="loading"
                @change="change">
                <bk-option
                    v-for="flow in flowList"
                    :key="flow.id"
                    :id="flow.id"
                    :name="flow.name">
                    <div class="flow-name-wrapper">
                        <span v-bk-overflow-tips class="flow-name">{{ flow.name }}</span>
                        <span v-if="flow.deployed === 0" class="status-tag">{{ $t('未部署') }}</span>
                    </div>
                </bk-option>
            </bk-select>
        </div>
        <div class="label-select">
            <div class="label">{{ $t('操作') }}</div>
            <bk-select v-model="copyEventValue.flow.actionName" @change="change">
                <bk-option id="createAndExecuteTask" :name="$t('执行流程')" />
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
        overflow: hidden;
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
            .desc-line {
                border-bottom: 1px dashed #63656e ;
            }
        }
        .bk-select {
            flex: 1;
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            background: #ffffff;
        }
    }
    .flow-name-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .flow-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .status-tag {
            flex-shrink: 0;
            padding: 2px 4px;
            line-height: 1;
            font-size: 12px;
            color: #fe9c00;
            border: 1px solid #fe9c00;
            border-radius: 2px;
            transform: scale(0.83, 0.83);
        }
    }
</style>
