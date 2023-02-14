<template>
    <div class="events-setting">
        <section class="choose-function">
            <div class="event-title">
                <span class="event-name" v-bk-tooltips="'点击组件时调用该事件函数'">click</span>
                <bk-switcher :value="eventConfig.enable" size="small" @change="handleEventConfigChange($event, 'enable')"></bk-switcher>
            </div>
            <bk-select :value="eventConfig.name" placeholder="请选择函数" @selected="handleEventConfigChange($event, 'name')">
                <bk-option
                    v-for="item in functionList"
                    :key="item.id"
                    :id="item.id"
                    :name="item.name">
                </bk-option>
            </bk-select>
        </section>
    </div>
</template>
<script>
    import { mapState, mapMutations } from 'vuex'
    import { cloneDeep } from 'lodash'
    export default {
        name: 'EventsSetting',
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            eventConfig () {
                return this.selectedComp.data.events.click
            },
            functionList () {
                if (this.selectedComp.type === 'buttons') {
                    return [
                        { id: 'export', name: '导出' }
                    ]
                }
                return [
                    { id: 'rowDetail', name: '详情' },
                    { id: 'rowDelete', name: '删除' }
                ]
            }
        },
        methods: {
            ...mapMutations('nocode/dataManage', ['setPageConfig']),
            handleEventConfigChange (val, type) {
                const pageConfig = cloneDeep(this.pageConfig)
                const compList = (this.activeNode ? pageConfig[this.activeNode] : pageConfig)
                const comp = compList[this.selectedComp.type].find(item => item.id === this.selectedComp.data.id)
                comp.events.click[type] = val
                this.setPageConfig(pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .choose-function {
        margin: 0 10px;
        padding: 8px;
        background: #f0f1f5;
        border-radius: 2px;
    }
    .event-title {
        display: flex;
        align-items: center;
        margin: 4px 0 8px;
        color: #63656e;
        .event-name {
            margin-right: 10px;
            border-bottom: 1px dashed #979ba5;
            cursor: pointer;
        }
    }
    .bk-select {
        background: #ffffff;
    }
</style>
