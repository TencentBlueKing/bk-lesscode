<template>
    <div>
        <div class="row-box">
            <span>计算公式</span>
            <bk-select v-model="computConfigInfo.numberComput.formula" @change="update" searchable>
                <bk-option v-for="option in formulaList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.label">
                </bk-option>
            </bk-select>
        </div>
        <div class="row-box" v-if="computConfigInfo.numberComput.formula !== 'customize'">
            <span>计算字段</span>
            <bk-select v-model="computConfigInfo.numberComput.computeFields" @change="update" searchable multiple>
                <bk-option v-for="option in intFieldsList"
                    :key="option.key"
                    :id="option.key"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </div>
        <div class="row-box" v-else>
            <bk-button :text="true" title="primary" @click="showFormulaConfigDialog = true">
                配置公式
            </bk-button>
        </div>
        <div class="row-box">
            <span>单位</span>
            <bk-input v-model="computConfigInfo.numberComput.unit.value"
                @show="isDropdownShow = true"
                @hide="isDropdownShow = false"
                @change="update"
                :clearable="true">
                <bk-dropdown-menu class="group-text " slot="prepend" ext-cls="ext-line-height">
                    <bk-button type="primary" slot="dropdown-trigger">
                        <span v-if="computConfigInfo.numberComput.unit.position === 'prefix'">前缀</span>
                        <span v-else>后缀</span>
                        <i :class="['bk-icon icon-angle-down',{ 'icon-flip': isDropdownShow }]"></i>
                    </bk-button>
                    <ul class="bk-dropdown-list" slot="dropdown-content">
                        <li><a href="javascript:;" @click="handlerSelect('prefix')">前缀</a></li>
                        <li><a href="javascript:;" @click="handlerSelect('suffix')">后缀</a></li>
                    </ul>
                </bk-dropdown-menu>
            </bk-input>
        </div>
        <div class="row-box">
            <span>保留小数位数</span>
            <bk-input v-model="computConfigInfo.numberComput.decimal" @change="decimalChange" type="number" :max="10" :min="0" />
        </div>
        <!-- 配置公式 -->
        <bk-dialog v-model="showFormulaConfigDialog" title="配置公式" header-position="left" :esc-close="false"
            :auto-close="false"
            width="600px"
            @confirm="handlerConfirm"
            @cancel="handlerCancel"
            :close-icon="false">
            <div class="content-box">
                <div class="field-region">
                    <div class="top-box">
                        <bk-input
                            v-model="searchField"
                            :placeholder="'输入引用字段名'"
                            :right-icon="'bk-icon icon-search'">
                        </bk-input>
                    </div>
                    <div class="field-box">
                        <div class="field-item" @click="handlerFieldClick(item)" v-for="(item,index) in filterFieldBySearch" :key="index">
                            {{ item.name }}
                        </div>
                    </div>
                </div>
                <div class="compute-region">
                    <div class="top-box">
                        <div class="symbol-item" v-for="(item,index) in computeChar" :key="index"
                            @click="handlerSymbolClick(item)">{{ item.name }}</div>
                        <div class="delete-btn">
                            <bk-button class="mr10" @click="handlerDelete" :text="true" title="primary">
                                删除
                            </bk-button>
                            <bk-button @click="handlerReset" :text="true">
                                重置
                            </bk-button>
                        </div>
                    </div>
                    <div class="formula-box">
                        {{ formulaStr }}
                    </div>
                </div>
            </div>
        </bk-dialog>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    
    import { getRealFormula, evalFun } from '@/components/flow-form-comp/form/util/index.js'

    export default {
        name: 'BkLesscodeComputeNumber',
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            computConfigInfo: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                formulaList: [
                    {
                        id: 'sum',
                        label: '求和'
                    },
                    {
                        id: 'averageValue',
                        label: '平均值'
                    },
                    {
                        id: 'median',
                        label: '中位数'
                    },
                    {
                        id: 'product',
                        label: '乘积'
                    },
                    {
                        id: 'maxVlaue',
                        label: '最大值'
                    },
                    {
                        id: 'minVlaue',
                        label: '最小值'
                    },
                    // {
                    //     id: 'count',
                    //     label: '计数'
                    // },
                    {
                        id: 'customize',
                        label: '自定义'
                    }
                ],
                showFormulaConfigDialog: false,
                isDropdownShow: false,
                searchField: '',
                computeChar: [
                    {
                        key: '+',
                        name: '+'
                    }, {
                        key: '-',
                        name: '-'
                    }, {
                        key: '*',
                        name: '*'
                    }, {
                        key: '/',
                        name: '/'
                    }, {
                        key: '(',
                        name: '('
                    }, {
                        key: ')',
                        name: ')'
                    }
                ],
                customizeFormula: []
            }
        },
        computed: {
            ...mapGetters('nocode/formSetting', ['fieldsList']),
            intFieldsList () {
                return this.fieldsList.filter((item) => {
                    return item.type === 'INT'
                }).map((item) => {
                    return {
                        key: item.key,
                        value: item.default,
                        name: item.name
                    }
                })
            },
            filterFieldBySearch () {
                if (!this.searchField) {
                    return this.intFieldsList
                }
                return this.intFieldsList.filter((item) => {
                    return item.name.includes(this.searchField)
                })
            },
            formulaStr () {
                let str = ''
                this.customizeFormula.forEach((item) => {
                    str += item.name
                })
                return str
            }
        },
        watch: {
            showFormulaConfigDialog (newVal) {
                if (newVal) {
                    this.cloneCustomizeFormula()
                }
            }
        },

        created () {
            this.cloneCustomizeFormula()
        },
        methods: {
            handlerSelect (value) {
                this.computConfigInfo.numberComput.unit.position = value
            },
            decimalChange (value) {
                this.computConfigInfo.numberComput.decimal = parseInt(value)
                this.update()
            },
            // 克隆公式
            cloneCustomizeFormula () {
                this.customizeFormula = this.computConfigInfo.numberComput.customizeFormula.map((item) => {
                    return {
                        key: item.key,
                        name: item.name,
                        value: item.default
                    }
                })
            },
            // 确认公式
            handlerConfirm () {
                this.checkFormula().then((res) => {
                    this.showFormulaConfigDialog = false
                    this.computConfigInfo.numberComput.customizeFormula = this.customizeFormula
                    this.update()
                }, (error) => {
                    this.$bkMessage({ theme: 'error', message: error.msg })
                })
            },
            // 取消公式配置
            handlerCancel () {
                this.cloneCustomizeFormula()
            },
            // 获取公式信息
            getCustomizeFormulaInfo () {
                const length = this.customizeFormula.length
                const lastChar = this.customizeFormula[length - 1]?.name
                return { length, lastChar }
            },
            // 选择计算符号
            handlerSymbolClick (computeChar) {
                const { length } = this.getCustomizeFormulaInfo()
                if (length > 0) {
                    this.addComputeOption(computeChar)
                }
            },
            // 选择字段
            handlerFieldClick (field) {
                this.addComputeOption(field)
            },
            // 检查配置公式
            checkFormula () {
                return new Promise((resolve, reject) => {
                    const realFormula = getRealFormula(this.customizeFormula)
                    try {
                        evalFun(realFormula)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })
            },
            // 条件限制配置公式
            conditionalRestriction (char, lastChar) {
                let checkRes = false
                const chars = ['+', '-', '*', '/']
                switch (lastChar) {
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                        if (!chars.includes(char) && char !== ')') {
                            checkRes = true
                        }
                        break
                    case '(':
                        if (!['*', '/', ')'].includes(char)) {
                            checkRes = true
                        }
                        break
                    default:
                        if ([...chars, ')'].includes(char)) {
                            checkRes = true
                        }
                        break
                }
                return checkRes
            },
            // 增加公式计算项
            addComputeOption (option) {
                const { lastChar } = this.getCustomizeFormulaInfo()
                if (!lastChar || this.conditionalRestriction(option.key, lastChar)) {
                    this.customizeFormula.push(option)
                }
            },
            // 删除字段或符号
            handlerDelete () {
                this.customizeFormula.pop()
            },
            // 重置公式
            handlerReset () {
                this.customizeFormula = []
            },
            update () {
                this.$emit('change', this.field)
            }
           
        }
    }
</script>

<style lang="postcss" scoped>
.row-box{
    margin: 10px 0 ;
    font-size: 12px;
}
.mg-top-5{
    margin-top: 5px;
}
.ext-line-height{
    line-height:26px !important;
}
.content-box{
    display: flex;
    height: 400px;
    border: 1px solid #c4c6cc;

    .field-region{
        flex: 1;
        .top-box{
            padding:5px 10px;
        }
        .field-box{
            border-top: 1px solid rgb(196, 198, 204);
            height: 340px;
            overflow-y: auto;
            .field-item{
                line-height: 36px;
            padding: 0 10px;

            }
            .field-item:hover{
                background-color: #e1ecff;
                color: #3a84ff;
                cursor: pointer;
            }
        }
        .field-box::-webkit-scrollbar{
            width: 3px;
        }
        .field-box::-webkit-scrollbar-thumb{
            background-color: rgba(196, 198, 204,0.4);
            border-radius: 5px;
            opacity: 0.1;
        }
    }
    .compute-region{
        flex: 2;
        border-left: 1px solid #c4c6cc;
        .top-box{
            border-bottom:  1px solid #c4c6cc;
            height: 43px;
            background-color: #F0F1F5;
            padding-bottom: 1px;
            .symbol-item{
                width: 40px;
                text-align: center;
                float: left;
                line-height: 42px;
            }
            .symbol-item:hover{
                background-color: #e1ecff;
                color: #3a84ff;
                cursor: pointer;
            }
            .delete-btn{
                float: right;
                margin-right: 15px;
                height: 100%;
                display: flex;
                align-items: center;
            }
        }
        .formula-box{
            margin: 10px ;
        }
        
    }
}
</style>
