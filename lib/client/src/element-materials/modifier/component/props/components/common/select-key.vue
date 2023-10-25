<template>
    <section>
        <div
            class="g-prop-sub-title g-mb4 select-key"
        >
            <span
                class="subline"
                v-bk-tooltips="{
                    content: $t('可以设置字段的映射关系，来做数据转换。注意：值改变下拉选项会自动改变'),
                    placements: ['left-start'],
                    boundary: 'window',
                    maxWidth: 400
                }"
            >
                {{ $t('字段映射') }}
            </span>
        </div>
        <template v-for="key in keys">
            <div
                class="g-prop-sub-title g-mb4 g-mt8 subline"
                :key="key.id + 'label'"
                v-bk-tooltips="{
                    content: $t(key.tips),
                    placements: ['left-start'],
                    boundary: 'window',
                    maxWidth: 400
                }"
            >{{ $t(key.label) }}</div>
            <bk-tag-input
                class="g-mb8 h32"
                trigger="focus"
                :max-data="1"
                :allow-create="true"
                :key="key.id"
                :value="[valueKeys[key.id]].filter(v => v)"
                :loading="isLoading"
                :list="options.map(x => ({ id: x, name: x }))"
                @change="([val]) => changeParams(key.id, val)">
            </bk-tag-input>
        </template>
    </section>
</template>

<script>
    export default {
        props: {
            keys: {
                type: Array,
                default: () => ([])
            },
            value: {
                type: [Object, Array],
                default: () => ([])
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            valueKeys: {
                type: Object,
                default: () => ({})
            },
            valueType: {
                type: String
            },
            payload: {
                type: Object
            },
            type: {
                type: String
            },
            name: {
                type: String
            }
        },
        data () {
            return {
                options: [],
                valueKeyTypeValueMemo: {}
            }
        },
        computed: {
            listenChange () {
                const { value, type, payload } = this
                return { value, type, payload }
            }
        },
        watch: {
            listenChange: {
                handler (newVal, oldVal) {
                    this.options = Object.keys(this.value?.[0] || {})
                    // 数据源
                    if (this.valueType.includes('data-source') && this.payload?.sourceData?.dataSourceType === 'preview') {
                        const tables = this.$store.state?.dataSource?.tableList || []
                        const table = tables.find(table => table.tableName === this.payload.sourceData.tableName)
                        this.options = table.columns.map(column => column.name)
                    }
                    if (newVal.value) {
                        this.valueChange()
                    }
                },
                immediate: true,
                deep: true
            }
           
        },
        methods: {
            changeParams  (key, value) {
                this.$emit('changeVal', 'valueKeys', Object.assign(this.valueKeys, { [key]: value }))
                this.valueChange()
            },
            valueChange () {
                if (Object.keys(this.valueKeys).length === 0) {
                    return
                }
                const list = JSON.parse(JSON.stringify(this.value))
                const val = list.map(item => this.processChildren(item, this.valueKeys))
                this.$emit('change', this.name, val, this.valueType, this.payload, false)
            },
            processChildren (obj, valueKeys) {
                if (obj.children && Array.isArray(obj.children)) {
                    obj.children = obj.children.map(child => this.processChildren(child, valueKeys))
                }
                // 对当前对象进行处理
                const newObj = { ...obj }
                for (const key in valueKeys) {
                    newObj[key] = valueKeys[key] ? obj[valueKeys[key]] : obj[key]
                }

                return newObj
            }

        }
    }

</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";
    .select-key {
        display: block;
        margin-top: 14px;
    }
    .inline-block {
        display: inline-block;
    }
    .subline {
        cursor: pointer;
        border-bottom: 1px dashed #63656E;
    }
    .h32 {
        height: 32px;
    }
    .display-value {
        @mixin ellipsis 100%, inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
</style>
