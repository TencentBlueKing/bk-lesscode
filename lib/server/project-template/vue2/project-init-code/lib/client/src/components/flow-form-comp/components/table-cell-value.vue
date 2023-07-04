<template>
    <div class="table-cell-value">
        <span v-if="valueEmpty">--</span>
        <!--        <bk-button v-else-if="isOpenView" size="small" :text="true" @click="$emit('viewDetail', value.id)">查看</bk-button>-->
        <bk-button v-else-if="isOpenTable" size="small" :text="true" @click="$emit('viewTable', { field,value: value[field.key] })">查看</bk-button>
        <bk-button v-else-if="isOpenRichText" size="small" :text="true" @click="$emit('viewRichText', value[field.key])">查看</bk-button>
        <bk-button v-else-if="field.type === 'FILE'" size="small" :text="true">下载</bk-button>
        <div v-else-if="isShowName">
            <div v-if="field.isDisplayTag && transValToTagArray(value[field.key]).length > 0" class="tag-container">
                <span
                    v-for="(tag ,index) in transValToTagArray(value[field.key])"
                    :key="`${tag}_${index}`"
                    class="table-cell-tag"
                    v-bk-tooltips="{
                        content: transValToTagArray(value[field.key]).map(i => i.name).join(','),
                        placements: ['top'],
                        extCls: 'custom-tooltip',
                        maxWidth: 400
                    }"
                    :style="{ 'background-color': tag.color }">
                    {{tag.name}}
                </span>
            </div>
            <span v-else>{{ transValToName( value[field.key]) }}</span>
        </div>
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
            },
            isShowName () {
                return ['SELECT', 'RADIO', 'CHECKBOX', 'INPUTSELECT', 'MULTISELECT'].includes(this.field.type)
            },
            isOpenTable () {
                return this.field.type === 'TABLE'
            },
            isOpenRichText () {
                return this.field.type === 'RICHTEXT'
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
            },
            transValToTagArray (val) {
                const name = []
                if (['API', 'WORKSHEET'].includes(this.field.source_type)) {
                    name.push(val)
                } else if (['CHECKBOX', 'MULTISELECT'].includes(this.field.type)) {
                    this.field.choice.forEach((item) => {
                        val.split(',').forEach((val) => {
                            if (item.key === val) {
                                name.push({ name: item.name, color: item.color })
                            }
                        })
                    })
                } else {
                    this.field.choice.forEach(item => {
                        if (item.key === val) {
                            name.push({ name: item.name, color: item.color })
                        }
                    })
                }
                return name.length > 0 ? name : []
            }
        }
    }
</script>
<style lang="postcss" scoped>
.tag-container{
  display: flex;
  overflow: hidden;
}
.table-cell-tag{
  border-radius: 2px;
  display: block;
  font-size: 12px;
  width: 68px;
  height: 22px;
  color:#FFFFFF;
  line-height: 22px;
  text-align: center;
  margin-right: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}
.bk-button-text.bk-button-small{
  padding: 0 !important;
}
</style>
