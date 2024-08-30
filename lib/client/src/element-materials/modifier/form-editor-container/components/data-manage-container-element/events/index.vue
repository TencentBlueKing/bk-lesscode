<template>
    <div class="events-setting">
        <section class="choose-function">
            <div class="event-title">
                <span class="event-name" v-bk-tooltips="$t('点击组件时调用该事件的行为')">click</span>
                <bk-switcher v-model="formData.enable" size="small" theme="primary" @change="update"></bk-switcher>
            </div>
            <div class="label">事件行为</div>
            <bk-select :value="formData.name" @selected="handleEventNameChange">
                <bk-option
                    v-for="item in functionList"
                    :key="item.id"
                    :id="item.id"
                    :name="item.name">
                </bk-option>
            </bk-select>
            <template v-if="formData.name === 'rowJump'">
                <div class="label">跳转链接</div>
                <bk-input v-model="formData.config.url" @change="update" />
            </template>
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
        data () {
            return {
                formData: cloneDeep(this.elementData.events.click)
            }
        },
        computed: {
            functionList () {
                if (this.elementData.type === 'formDataButton') {
                    return [
                        { id: 'export', name: this.$t('导出') }
                    ]
                }
                return [
                    { id: 'rowDetail', name: this.$t('详情') },
                    { id: 'rowDelete', name: this.$t('删除') },
                    { id: 'rowJump', name: this.$t('跳转') }
                ]
            }
        },
        watch: {
            elementData (val) {
                this.formData = cloneDeep(val.events.click)
            }
        },
        methods: {
            handleEventNameChange (val) {
                if (this.formData.config) {
                    this.formData.config.url = ''
                } else {
                    // 旧数据不存在config字段
                    this.formData = Object.assign({}, this.formData, { config: { url: '' } })
                }
                this.formData.name = val
                this.update();
            },
            update () {
                const elementData = cloneDeep(this.elementData)
                elementData.events.click = this.formData
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
    .label {
        margin-top: 12px;
        font-size: 12px;
        line-height: 20px;
    }
</style>
