<template>
    <section class="custom-buttons">
        <bk-button
            v-for="button in buttons.slice(0, 4)"
            v-bind="getProperties(button)"
            :loading="button.loading"
            :key="button.id"
            @click="handleClick(button)">
            {{ button.name }}
        </bk-button>
        <bk-dropdown-menu
            v-if="buttons.length > 4"
            ref="dropdown"
            @show="isDropdownShow = true"
            @hide="isDropdownShow = false">
            <div class="more-buttons-trigger" slot="dropdown-trigger">
                更多
                <i :class="['bk-icon icon-angle-down angle-icon', { 'active': isDropdownShow }]"></i>
            </div>
            <ul class="more-btns-list" slot="dropdown-content">
                <li v-for="button in buttons.slice(4)" :key="button.id" class="button-item" @click="handleClick(button)">{{ button.name }}</li>
            </ul>
        </bk-dropdown-menu>
    </section>
</template>
<script>
    import * as XLSX from 'xlsx'

    export default {
        name: 'CustomButtons',
        props: {
            tableName: String,
            nodeName: String,
            buttons: Array,
            fields: {
                type: Array,
                default: () => []
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            tableConfig: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                isDropdownShow: false,
                tableDataLoading: false
            }
        },
        computed: {
            colFields () {
                const list = []
                this.tableConfig.forEach(key => {
                    let field = this.systemFields.find(item => item.key === key)
                    if (!field) {
                        field = this.fields.find(item => item.key === key)
                    }
                    if (field) {
                        list.push(field)
                    }
                })
                return list
            }
        },
        methods: {
            getProperties (button) {
                const props = {}
                Object.keys(button.props).forEach(key => {
                    props[key] = button.props[key].val
                })
                return props
            },
            async exportData (button) {
                try {
                    this.tableDataLoading = true
                    const params = {
                        fields: this.tableConfig
                    }
                    button.loading = true
                    const res = await this.$http.post(`/nocode/filterTableData/keys/tableName/${this.tableName}`, params)
                    const list = res.data.list
                    const header = this.tableConfig.map(key => {
                        const field = this.colFields.find(item => item.key === key)
                        return field.name || ''
                    })
                    const body = []
                    list.forEach(item => {
                        const row = []
                        this.tableConfig.forEach(key => {
                            for (const [rowKey, value] of Object.entries(item)) {
                                if (key === rowKey) {
                                    row.push(value)
                                }
                            }
                        })
                        body.push(row)
                    })

                    const wb = XLSX.utils.book_new()
                    const ws = XLSX.utils.aoa_to_sheet([header, ...body])
                    XLSX.utils.book_append_sheet(wb, ws)
                    XLSX.writeFile(wb, `${this.nodeName || this.tableName}.xlsx`)
                } catch (e) {
                    console.log(e.message || e)
                } finally {
                    this.tableDataLoading = false
                    button.loading = false
                }
            },
            handleClick (button) {
                if (button.events.click?.name === 'export') {
                    this.exportData(button)
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .custom-buttons {
        display: flex;
        align-items: center;
        .bk-button {
            margin-right: 8px;
        }
    }
    .more-buttons-trigger {
        margin-right: 8px;
        padding: 0 8px 0 16px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #63656e;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
        .angle-icon {
            display: inline-block;
            font-size: 20px;
            transition: transform .3s cubic-bezier(.4, 0, .2, 1);
            &.active {
                transform: rotate(-180deg);
            }
        }
    }
    .more-btns-list {
        .button-item {
            padding: 0 16px;
            height: 32px;
            line-height: 32px;
            font-size: 14px;
            color: #63656e;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
                background: #f0f1f5;
            }
        }
    }
</style>
