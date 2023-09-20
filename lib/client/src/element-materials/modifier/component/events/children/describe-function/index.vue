<template>
    <section>
        <RenderAI @plus-action="handlePlusActionByAI" />
        <span class="describe-title">
            {{ $t('事件行为') }}
            <span class="describe-sub-title">
                （{{ $t('可根据生成效果继续编辑，行为将按顺序执行') }}）
            </span>
        </span>
        <component
            v-for="renderAction,index in eventValue.actions || []"
            class="mt8"
            :key="index"
            :is="componentMap[renderAction.type]"
            :action="renderAction"
            @change="(action) => handleChangeAction(action, index)"
            @delete="() => handleDeleteAction(index)"
        />
        <bk-link
            theme="primary"
            icon="bk-icon icon-plus-circle"
            class="plus-event-icon"
            @click="handlePlusAction"
        >{{$t('添加事件行为')}}</bk-link>
    </section>
</template>

<script>
    import RenderAI from './render-ai.vue'
    import RenderComponent from './render-component.vue'
    import RenderLink from './render-link.vue'
    import RenderMethod from './render-method.vue'
    import RenderVariable from './render-variable.vue'
    import {
        EVENT_ACTION_TYPE
    } from 'shared/function/constant'

    export default {
        components: {
            RenderAI
        },
        props: {
            eventValue: Object
        },
        data () {
            return {
                copyEventValue: {},
                componentMap: {
                    [EVENT_ACTION_TYPE.COMPONENT]: RenderComponent,
                    [EVENT_ACTION_TYPE.LINK]: RenderLink,
                    [EVENT_ACTION_TYPE.METHOD]: RenderMethod,
                    [EVENT_ACTION_TYPE.VARIABLE]: RenderVariable
                }
            }
        },
        created () {
            this.copyEventValue = JSON.parse(JSON.stringify(this.eventValue))
            if (!this.copyEventValue?.actions) {
                this.copyEventValue.actions = []
            }
        },
        methods: {
            handleChangeAction (action, index) {
                this.copyEventValue.actions.splice(index, 1, action)
                this.$emit('change', {
                    ...this.copyEventValue,
                    actions: this.copyEventValue.actions
                })
            },

            handleDeleteAction (index) {
                this.copyEventValue.actions.splice(index, 1)
                this.$emit('change', {
                    ...this.copyEventValue,
                    actions: this.copyEventValue.actions
                })
            },

            handlePlusAction () {
                this.copyEventValue.actions.push({
                    type: EVENT_ACTION_TYPE.COMPONENT,
                    id: '',
                    value: [{
                        key: '',
                        value: ''
                    }]
                })
                this.$emit('change', {
                    ...this.copyEventValue,
                    actions: this.copyEventValue.actions
                })
            },

            handlePlusActionByAI (action) {
                this.copyEventValue.actions.push(action)
                this.$emit('change', {
                    ...this.copyEventValue,
                    actions: this.copyEventValue.actions
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .plus-event-icon {
        margin: 8px 0;
        ::v-deep .bk-link-text {
            font-size: 12px;
        }
    }
    .describe-title {
        font-size: 12px;
        color: #313238;
        display: block;
        .describe-sub-title {
            color: #979BA5;
        }
    }
    .mt8 {
      margin-top: 8px;
    }
</style>
