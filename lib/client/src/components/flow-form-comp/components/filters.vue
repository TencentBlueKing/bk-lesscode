<template>
    <div class="data-manage-filters">
        <bk-form class="filters-form" form-type="vertical">
            <div class="filter-form-item"
                v-for="(item, index) in filterFields"
                :key="index">
                <bk-form-item :label="item.name">
                    <!-- <bk-select
                        v-if="isSelectComp(item.type)"
                        v-model="localVal[item.key]"
                        style="background: #ffffff"
                        :placeholder="`请选择${item.name}`">
                    </bk-select> -->
                    <field-item
                        v-if="isSelectComp(item.type)"
                        style="background: #ffffff"
                        :placeholder="$t('请选择{0}', [item.name])"
                        :field="item"
                        :show-label="false"
                        :value="localVal[item.key]"
                        @change="localVal[item.key] = $event">
                    </field-item>
                    <bk-date-picker
                        v-else-if="['DATE', 'DATETIME'].includes(item.type)"
                        style="width: 100%;"
                        type="daterange"
                        format="yyyy-MM-dd HH:mm:ss"
                        :placeholder="$t('请输入{0}', [item.name])"
                        :value="localVal[item.key]"
                        @change="handleDateTypeValChange(item.key, $event)">
                    </bk-date-picker>
                    <bk-input
                        v-else
                        v-model="localVal[item.key]"
                        style="width: 100%;"
                        :placeholder="$t('请输入{0}', [item.name])"
                        :type="item.type === 'INT' ? 'number' : 'text'"
                    />
                </bk-form-item>
            </div>
        </bk-form>
        <div class="search-area">
            <bk-button style="margin-right: 4px;" theme="primary" @click="update">{{ $t('查询') }}</bk-button>
            <bk-button @click="handleReset">{{ $t('重置') }}</bk-button>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import FieldItem from '../form/fieldItem.vue'
    export default {
        name: 'Filters',
        components: {
            FieldItem
        },
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
            return {
                filterFields: [],
                localVal: {}
            }
        },
        watch: {
            value (val) {
                this.localVal = cloneDeep(val)
            },
            filters: {
                handler (val) {
                    this.setData()
                },
                immediate: true
            }
        },
        methods: {
            setData () {
                const filterFields = []
                const localVal = {}
                this.filters.forEach(key => {
                    let field = this.systemFields.find(item => item.key === key)
                    if (!field) {
                        field = this.fields.find(item => item.key === key)
                    }
                    if (field) {
                        const fieldCopy = cloneDeep(field)
                        // 选择值类型的字段统一用select组件来做筛选
                        if (this.isSelectComp(fieldCopy.type)) {
                            fieldCopy.type = ['MULTISELECT', 'CHECKBOX'].includes(fieldCopy.type) ? 'MULTISELECT' : 'SELECT'
                            fieldCopy.placeholder = this.$t('请选择{0}', [fieldCopy.name])
                        }
                        filterFields.push(fieldCopy)
                        localVal[fieldCopy.key] = key in this.value ? cloneDeep(this.value[key]) : ''
                    }
                })
                this.filterFields = filterFields
                this.localVal = localVal
            },
            isSelectComp (type) {
                return ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(type)
            },
            handleDateTypeValChange (key, val) {
                const value = []
                val.map(item => {
                    if (item !== '') {
                        value.push(item)
                    }
                })
                this.localVal[key] = value
            },
            handleReset () {
                Object.keys(this.localVal).forEach(key => {
                    this.localVal[key] = ''
                })
                this.update()
            },
            update () {
                this.$emit('change', { ...this.localVal })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@//css/mixins/scroller";

    .data-manage-filters {
        padding: 16px 4px;
        border-radius: 2px;
        background: #fafbfd;
    }
    .add-filter-area {
        padding: 20px 0;
        min-height: 82px;
        font-size: 12px;
        color: #63656e;
    }
    .add-filter-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        color: #979ba5;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
    }
    .field-list-wrapper {
        padding: 4px 0;
        width: 120px;
        max-height: 168px;
        overflow: auto;
        @mixin scroller;
        .field-item {
            padding: 0 12px;
            height: 32px;
            line-height: 32px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 12px;
            color: #63656e;
            cursor: pointer;
            &:hover {
                background: #e1ecff;
                color: #3a84ff;
            }
        }
    }
    .filters-form {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .filter-form-item {
            position: relative;
            padding: 8px;
            width: 330px;
        }
        .bk-form-item {
            margin: 0;
            width: 100%;
            & + .bk-form-item {
                margin-top: 0;
            }
        }
    }
    .search-area {
        padding: 8px 8px;
    }
</style>
