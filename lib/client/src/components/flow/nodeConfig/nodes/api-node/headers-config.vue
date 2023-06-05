<template>
    <section class="headers-config">
        <div class="config-title">Headers</div>
        <div class="config-content">
            <div class="label-area">
                <div class="col-item col-key">{{ $t('参数名') }}</div>
                <div class="col-item col-val">{{ $t('值') }}</div>
                <div class="col-item col-desc">{{ $t('备注') }}</div>
                <div class="col-item col-opt">{{ $t('操作') }}</div>
            </div>
            <div v-for="(item, index) in headerList" class="header-config-item" :key="index">
                <div class="col-item col-key">
                    <bk-input :value="item.key" @change="handleChange(index, 'key', $event)"></bk-input>
                </div>
                <div class="col-item col-val">
                    <bk-input :value="item.value" @change="handleChange(index, 'value', $event)"></bk-input>
                </div>
                <div class="col-item col-desc">
                    <bk-input :value="item.desc" @change="handleChange(index, 'desc', $event)"></bk-input>
                </div>
                <div class="col-item col-opt">
                    <i class="bk-drag-icon bk-drag-add-fill opt-icon" @click="handleAddItem(index)"></i>
                    <i :class="['bk-drag-icon bk-drag-reduce-fill opt-icon', { disabled: headerList.length === 1 }]" @click="handleDelItem(index)"></i>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'HeadersConfig',
        props: {
            headers: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                headerList: []
            }
        },
        watch: {
            headers: {
                handler (val) {
                    this.headerList = val.length > 0 ? cloneDeep(val) : [{ key: '', value: '', desc: '' }]
                },
                immediate: true
            }
        },
        methods: {
            handleAddItem (index) {
                this.headerList.splice(index + 1, 0, { key: '', value: '', desc: '' })
            },
            
            handleDelItem (index) {
                this.headerList.splice(index, 1)
                this.triggerUpdate()
            },
            handleChange (index, key, value) {
                this.headerList[index][key] = value
                this.triggerUpdate()
            },
            triggerUpdate () {
                this.$emit('update', cloneDeep(this.headerList))
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .headers-config {
        margin-top: 24px;
        background: #fafbfd;
    }
    .config-title {
        padding-left: 20px;
        height: 42px;
        line-height: 42px;
        font-size: 12px;
    }
    .config-content {
        .label-area {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-left: 20px;
            height: 42px;
            line-height: 42px;
            font-size: 12px;
            color: #63656e;
            background: #f0f1f5;
        }
    }
    .header-config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 20px;
        height: 50px;
    }
    .col-item {
        &:not(:last-child) {
            margin-right: 10px;
        }
    }
    .col-key {
        width: 240px;
    }
    .col-val {
        width: 400px;
    }
    .col-desc {
        flex: 1;
    }
    .col-opt {
        display: flex;
        align-items: center;
        width: 45px;
        .opt-icon {
            margin-right: 4px;
            font-size: 14px;
            color: #c4c6cc;
            cursor: pointer;
            &:not(.disabled):hover {
                color: #979ba5;
            }
            &.disabled {
                color: #dcdee5;
                cursor: not-allowed;
            }
        }
    }
</style>
