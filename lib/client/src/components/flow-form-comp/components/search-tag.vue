<template>
    <div class="search-tag">
        <div v-for="tag in filterFields" :key="tag.key">
            <bk-tag closable @close="close(tag.key)" v-if="tagIsShow(localVal[tag.key])">{{`${tag.name}: ${localVal[tag.key]}`}}</bk-tag>
        </div>
    </div>
</template>

<script>
    import { deepClone } from '../form/util'

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
                localVal: deepClone(this.value)
            }
        },
        fields: {
            value (val) {
                this.localVal = deepClone(val)
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
                this.$emit('update:value', { ...this.localVal })
            }
        }
    }
</script>

<style scoped lang="postcss">
.search-tag{
  padding: 12px;
  display: flex;
}
</style>
