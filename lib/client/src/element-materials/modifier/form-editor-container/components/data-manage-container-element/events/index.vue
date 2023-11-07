<template>
    <div class="events-setting">
        <section class="choose-function">
            <div class="event-title">
                <span class="event-name" v-bk-tooltips="$t('点击组件时调用该事件函数')">click</span>
                <bk-switcher :value="eventConfig.enable" size="small" theme="primary" @change="handleEventConfigChange($event, 'enable')"></bk-switcher>
            </div>
            <bk-select :value="eventConfig.name" :placeholder="$t('请选择函数')" @selected="handleEventConfigChange($event, 'name')">
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
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'EventsSetting',
        props: {
            elementData: Object
        },
        computed: {
            eventConfig () {
                return this.elementData.events.click
            },
            functionList () {
                if (this.elementData.type === 'formDataButton') {
                    return [
                        { id: 'export', name: this.$t('导出') }
                    ]
                }
                return [
                    { id: 'rowDetail', name: this.$t('详情') },
                    { id: 'rowDelete', name: this.$t('删除') }
                ]
            }
        },
        methods: {
            handleEventConfigChange (val, type) {
                const elementData = cloneDeep(this.elementData)
                elementData.events.click[type] = val
                this.$emit('change', elementData)
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
