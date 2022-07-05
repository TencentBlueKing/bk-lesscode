<template>
    <div class="table-cell-value">
        <span v-if="valueEmpty">--</span>
        <bk-button v-else-if="isOpenView" size="small" :text="true" @click="$emit('viewDetail', value.id)">查看</bk-button>
        <bk-button v-else-if="field.type === 'FILE'" size="small" :text="true">下载</bk-button>
        <a v-else-if="field.type === 'LINK'" style="color: #3a84ff;" :href="value[field.key]" target="_blank">{{ value[field.key] }}</a>
        <div v-else-if="field.type === 'IMAGE'">
            <img v-for="(item, index) in value[field.key]" :src="item" :key="index">
        </div>
        <span v-else>{{ parseValue(value[field.key]) }}</span>
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { isValEmpty } from '@/common/util'

    export default {
        name: 'tableCellValue',
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: [String, Number, Boolean, Array, Object]
        },
        computed: {
            valueEmpty () {
                return isValEmpty(this.value[this.field.key])
            },
            isOpenView () {
                return ['TABLE', 'RICHTEXT'].includes(this.field.type)
            }
        },
        methods: {
            parseValue (val) {
                if (this.field.type === 'DATETIME') {
                    return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
                }
                if (this.field.type === 'DATE') {
                    return dayjs(val).format('YYYY-MM-DD')
                }
                if (['SELECT', 'RADIO', 'CHECKBOX', 'INPUTSELECT', 'MULTISELECT'].includes(this.field.type)) {
                    return this.transValToName(val)
                }
                return val
            },
            transValToName (val) {
                let name = ''
                if (['API', 'WORKSHEET'].includes(this.field.source_type)) {
                    name = val
                } else if (['CHECKBOX', 'MULTISELECT'].includes(this.field.type)) {
                    const tempArr = []
                    this.field.choice.forEach((item) => {
                        val.split(',').forEach((val) => {
                            if (item.key === val) {
                                tempArr.push(item.name)
                            }
                        })
                        name = tempArr.join(',')
                    })
                } else {
                    this.field.choice.forEach(item => {
                        if (item.key === val) {
                            name = item.name
                        }
                    })
                }
                return name || '--'
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
