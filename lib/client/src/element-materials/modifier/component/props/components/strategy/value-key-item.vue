<template>
    <div>
        <bk-tag-input
            class="g-mb8 h32"
            trigger="focus"
            :max-data="1"
            :allow-create="true"
            :value="[defaultValue].filter(v => v)"
            :list="relevantDataOrigin.map(x => ({ id: x, name: x }))"
            @change="([val]) => changeParams(val)">
        </bk-tag-input>
    </div>
</template>

<script>
    export default {
        props: {
            defaultValue: {
                type: String,
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
                relevantDataOrigin: {}
            }
        },
        watch: {
            lastDataOrigin: {
                handler (val) {
                    this.relevantDataOrigin = Object.keys(val?.renderValue?.[0] || {})
                    // 数据源
                    if (val.valueType.includes('data-source') && val.payload?.sourceData?.dataSourceType === 'preview') {
                        const tables = this.$store.state?.dataSource?.tableList || []
                        const table = tables.find(table => table.tableName === val.payload.sourceData.tableName)
                        this.relevantDataOrigin = table.columns.map(column => column.name)
                    }
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            changeParams (val) {
                this.change(this.name, val || '', this.type)
            }
        }
    }
</script>
<style>

</style>
