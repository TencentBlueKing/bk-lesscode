<template>
    <section class="options-content">
        <div class="option-item" v-for="(key, index ) in describe.keys" :key="index">
            <div
                class="g-prop-sub-title g-mb4"
                :key="index + 'label'"
                v-bk-tooltips="{
                    content: $t(key.tips),
                    placements: ['left-start'],
                    boundary: 'window',
                    maxWidth: 400
                }"
            >{{ $t(key.label) }}</div>
            <bk-tag-input
                v-if="key.type === 'tag-input'"
                trigger="focus"
                :max-data="1"
                :allow-create="true"
                :key="index"
                :value="[defaultValue[key.label]].filter(v => v)"
                :list="relevantDataOrigin.map(x => ({ id: x, name: x }))"
                @change="([val]) => changeParams(val, key.label)">
            </bk-tag-input>
            <bk-switcher
                v-if="key.type === 'boolean'"
                :key="index"
                :value="defaultValue[key.label]"
                size="small"
                theme="primary"
                @change="val => changeParams(val, key.label)">
            </bk-switcher>
            <bk-input
                v-if="key.type === 'input'"
                :key="index"
                :value="defaultValue[key.label]"
                @change="val => changeParams(val, key.label)" />
        </div>
    </section>
</template>

<script>
    export default {
        props: {
            defaultValue: {
                type: Object,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            describe: {
                type: Object,
                required: true
            },
            change: {
                type: Function,
                required: true
            },
            lastDataOrigin: {
                type: Object,
                require: true
            }
        },
        data () {
            return {
                objectDefault: {},
                relevantDataOrigin: {},
                keys: []
            }
        },
        watch: {
            lastDataOrigin: {
                handler (val) {
                    this.relevantDataOrigin = Object.keys(val?.renderValue?.[0] || {})
                    // 数据源
                    if (val.valueType.includes('data-source') && val.payload?.sourceData?.dataSourceType === 'preview') {
                        const tables = this.store.state?.dataSource?.tableList || []
                        const table = tables.find(table => table.tableName === val.payload.sourceData.tableName)
                        this.relevantDataOrigin = table.columns.map(column => column.name)
                    }
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            trigger (value) {
                this.change(this.name, value, this.type, this.payload)
            },
            changeParams (val, key) {
                this.trigger({
                    ...this.defaultValue,
                    [key]: val
                })
            }
        }
    }
</script>
<style lang='postcss'>
    .options-content {
        margin: 0 6px;
        padding: 8px 4px;
        background-color: #F0F1F5;
        border-radius: 2px;
        &:hover{
            box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
        }
        .option-item {
            display: flex;
            flex-direction: column;
            font-size: 12px;
            margin: 0 2px 4px 2px;
        }
    }
</style>
