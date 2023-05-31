<template>
    <div class="search-tag">
        <div v-for="tag in filterFields" :key="tag.key">
            <bk-tag closable @close="close(tag.key)" v-if="tagIsShow(localVal[tag.key])">{{`${tag.name}: ${transValToName(tag)}`}}</bk-tag>
        </div>
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'
    import dayjs from 'dayjs'
    export default {
        name: 'SearchTag',
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            filters: {
                type: Array,
                default: () => []
            },
            value: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            const filterFields = this.getInitData()
            return {
                filterFields,
                localVal: cloneDeep(this.value)
            }
        },
        methods: {
            getInitData () {
                const filterFields = []
                this.filters.forEach(key => {
                    let field = this.systemFields.find(item => item.key === key)
                    if (!field) {
                        field = this.fields.find(item => item.key === key)
                    }
                    if (field) {
                        filterFields.push(field)
                    }
                })
                return filterFields
            },
            tagIsShow (val) {
                return Array.isArray(val) ? val.some(i => i) : !!val
            },
            close (key) {
                this.localVal[key] = ''
                this.$emit('change', { ...this.localVal })
            },
            transValToName (field) {
                let name = ''
                const val = this.localVal[field.key]
                if (['API', 'WORKSHEET'].includes(field.source_type)) {
                    name = val
                } else if (['CHECKBOX', 'MULTISELECT'].includes(field.type)) {
                    const tempArr = []
                    field.choice.forEach((item) => {
                        val.split(',').forEach((val) => {
                            if (item.key === val) {
                                tempArr.push(item.name)
                            }
                        })
                        name = tempArr.join(',')
                    })
                } else if (['SELECT', 'RADIO', 'INPUTSELECT'].includes(field.type)) {
                    field.choice.forEach(item => {
                        if (item.key === val) {
                            name = item.name
                        }
                    })
                } else if (['DATE', 'DATETIME'].includes(field.type)) {
                    name = `${dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')} - ${dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')}`
                } else {
                    name = val
                }
                return name || '--'
            }
        }
    }
</script>

<style scoped lang="postcss">
.search-tag{
  padding: 12px 0;
  display: flex;
>>> .bk-tag  {
  margin-left: 0;
  margin-right: 8px;
}
}
</style>
