<template>
    <bk-dialog
        header-position="left"
        :value="show"
        :width="600"
        :title="$t('配置公式')"
        :esc-close="false"
        :auto-close="false"
        :close-icon="false"
        @confirm="handleConfirm"
        @cancel="close">
        <div class="formula-edit-content">
            <div class="field-side">
                <div class="search-wrapper">
                    <bk-input
                        v-model="searchStr"
                        size="small"
                        :disabled="disabled"
                        :placeholder="$t('输入引用字段名')"
                        :right-icon="'bk-icon icon-search'">
                    </bk-input>
                </div>
                <div class="field-list">
                    <div
                        v-for="(item, index) in filterFieldBySearch"
                        class="field-item"
                        :key="index"
                        @click="addFormula(item)">
                        {{ item.name }}
                    </div>
                </div>
            </div>
            <div class="compute-region">
                <div class="header-wrapper">
                    <div class="symbols">
                        <div
                            class="symbol-item"
                            v-for="(item, index) in symbolChar"
                            :key="index"
                            @click="handleSymbolClick(item)">
                            {{ item.name }}
                        </div>
                    </div>
                    <div class="action-btns">
                        <bk-button
                            text
                            title="primary"
                            size="small"
                            :disabled="disabled"
                            @click="handleDel">
                            {{ $t('删除') }}
                        </bk-button>
                        <bk-button
                            text
                            size="small"
                            :disabled="disabled"
                            @click="handleReset">
                            {{ $t('重置') }}
                        </bk-button>
                    </div>
                </div>
                <div class="formula-content">{{ formulaStr }}</div>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    export default {
        name: 'formulaDialog',
        props: {
            show: Boolean,
            disabled: Boolean,
            list: {
                type: Array,
                default: () => []
            },
            formula: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                searchStr: '',
                localFormula: this.formula.slice(),
                symbolChar: [
                    { key: '+', name: '+' },
                    { key: '-', name: '-' },
                    { key: '*', name: '*' },
                    { key: '/', name: '/' },
                    { key: '(', name: '(' },
                    { key: ')', name: ')' }
                ]
            }
        },
        computed: {
            filterFieldBySearch () {
                if (!this.searchStr) {
                    return this.list
                }
                return this.list.filter(item => {
                    return item.name.toLowerCase().includes(this.searchStr.toLowerCase())
                })
            },
            formulaStr () {
                return this.localFormula.reduce((str, crt) => {
                    str += ` ${crt.name}`
                    return str
                }, '')
            }
        },
        watch: {
            show (val) {
                if (val) {
                    this.localFormula = this.formula.slice()
                }
            }
        },
        methods: {
            handleSymbolClick (char) {
                const { length } = this.getFormulaInfo()
                if (length > 0) {
                    this.addFormula(char)
                }
            },
            // 增加公式计算项
            addFormula (option) {
                const { lastChar } = this.getFormulaInfo()
                if (!lastChar || this.validateFormula(option.key, lastChar)) {
                    this.localFormula.push(option)
                }
            },
            // 获取公式信息
            getFormulaInfo () {
                const length = this.localFormula.length
                const lastChar = this.localFormula[length - 1]?.name
                return { length, lastChar }
            },
            // 条件限制配置公式
            validateFormula (char, lastChar) {
                let isValid = false
                const chars = ['+', '-', '*', '/']
                switch (lastChar) {
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                        if (!chars.includes(char) && char !== ')') {
                            isValid = true
                        }
                        break
                    case '(':
                        if (!['*', '/', ')'].includes(char)) {
                            isValid = true
                        }
                        break
                    default:
                        if ([...chars, ')'].includes(char)) {
                            isValid = true
                        }
                        break
                }
                return isValid
            },
            handleDel () {
                this.localFormula.pop()
            },
            handleReset () {
                this.localFormula = []
            },
            handleConfirm () {
                this.$emit('confirm', this.localFormula.slice())
                this.close()
            },
            close () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .formula-edit-content {
        display: flex;
        height: 400px;
        border: 1px solid #c4c6cc;
    }
    .field-side {
        flex: 1;
        .search-wrapper {
            padding:5px 10px;
        }
        .field-list {
            border-top: 1px solid rgb(196, 198, 204);
            height: 340px;
            overflow: auto;
            @mixin scroller;
            .field-item{
                padding: 0 10px;
                line-height: 32px;
                font-size: 12px;
                &:hover {
                    background-color: #e1ecff;
                    color: #3a84ff;
                    cursor: pointer;
                }
            }
        }
    }
    .compute-region {
        flex: 2;
        border-left: 1px solid #c4c6cc;
        .header-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 36px;
            background-color: #F0F1F5;
            border-bottom:  1px solid #c4c6cc;
            .symbols {
                display: flex;
                align-items: center;
            }
            .symbol-item {
                width: 30px;
                text-align: center;
                vertical-align: middle;
                cursor: pointer;
                &:hover{
                    background-color: #e1ecff;
                    color: #3a84ff;
                    cursor: pointer;
                }
            }
            .action-btns {
                display: flex;
                align-items: center;
                height: 100%;
                button {
                    padding: 0;
                    &:first-child {
                        margin-right: 8px;
                    }
                }
            }
        }
        .formula-content {
            padding: 10px;
            font-size: 12px;
        }
    }
</style>