<template>
    <section>
        <vue-draggable
            class="group-list"
            handle=".bk-drag-grag-fill"
            :list="column"
            :group="{ name: 'table-slot-list', pull: false, put: false }"
            @change="trigger">
            <bk-popover
                v-for="(item, index) in column"
                :key="`option${index}`"
                ref="tablePopover"
                class="list-item"
                placement="left-start"
                trigger="click"
                theme="light"
                ext-cls="g-popover-empty-padding"
                width="320"
            >
                <span
                    class="item-content"
                    v-bk-overflow-tips="{
                        content: item.label,
                        placement: 'left-start',
                        width: 200,
                        boundary: 'window'
                    }"
                >
                    <i class="bk-drag-icon bk-drag-grag-fill" />
                    {{ item.label }}
                </span>
                <i class="bk-icon icon-minus-circle" @click="handleDelete(index)"></i>
                <section slot="content">
                    <section class="template-item-list">
                        <div
                            class="template-item"
                            :class="item.type === 'selection' ? 'disabled' : ''"
                        >
                            <div class="label">label</div>
                            <bk-input
                                :value="item.label"
                                @change="val => handleChange(val, 'label', index)"
                            />
                        </div>

                        <template v-if="item.type === 'customCol'">
                            <div class="template-item">
                                <div class="label">
                                    <span
                                        class="g-config-subline"
                                        v-bk-tooltips="{
                                            content: '1. 可输入 html模板或 vue template<br>2. `props.row`作为内置变量代表表格每一行的数据，如`props.row.id`代表每一行的id字段<br>3. 可以在此处通过编写函数名来调用函数管理中已有的函数（若使用了函数管理中的函数，需在模板绑定函数项勾选用到的函数）<br>4. 如默认值demo即可实现一项编辑操作列<br>5. 注意：自定列模板使用手动填写函数名的方式使用函数，如果函数名有变化，需要手动进行修改',
                                            allowHtml: true
                                        }">
                                        自定义列模板
                                    </span>
                                </div>
                                <bk-input
                                    type="textarea"
                                    :value="item.templateCol"
                                    @change="val => handleChange(val, 'templateCol', index)" />
                            </div>
                            <div class="template-item">
                                <div class="label">
                                    <span
                                        class="g-config-subline"
                                        v-bk-tooltips="{
                                            content: '1. 请勾选列模板中使用到的函数管理中的函数<br>2. 未使用函数则无须勾选<br>3. 注意：此处系统显示函数标识',
                                            allowHtml: true
                                        }">
                                        模板绑定函数
                                    </span>
                                </div>
                                <bk-select
                                    ref="eventChooseComp"
                                    style="width: 100%"
                                    class="event-choose"
                                    :popover-options="{ appendTo: 'parent' }"
                                    :value="item.methodCode"
                                    :multiple="true"
                                    :key="JSON.stringify(item) + index"
                                    @change="val => handleChange(val, 'methodCode', index)">
                                    <bk-option-group
                                        v-for="group in funcGroups"
                                        :name="group.groupName"
                                        :key="group.id">
                                        <bk-option
                                            v-for="option in group.children"
                                            class="function-option"
                                            :key="option.id"
                                            :id="option.funcCode"
                                            :name="option.funcCode"
                                        >
                                            <span
                                                class="funtion-name"
                                                :title="`${option.funcName}（${option.funcCode}）`"
                                            >{{`${option.funcName}（${option.funcCode}）`}}</span>
                                            <i class="bk-icon icon-info" v-bk-tooltips="option.funcSummary || '该函数暂无描述'"></i>
                                        </bk-option>
                                    </bk-option-group>
                                    <div slot="extension" style="cursor: pointer;" @click="showMethodDialog(index)">
                                        <i class="bk-drag-icon bk-drag-function-fill"></i>函数管理
                                    </div>
                                </bk-select>
                            </div>
                        </template>
                        <template v-else>
                            <div class="template-item" :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''">
                                <div class="label">
                                    <span class="g-config-subline" v-bk-tooltips="{ content: '该列对应的字段名' }">prop</span>
                                </div>
                                <bk-input :value="item.prop" @change="val => handleChange(val, 'prop', index)" />
                            </div>
                            <div class="template-item">
                                <div class="label">列类型</div>
                                <bk-select
                                    style="width: 100%; background-color: #fff"
                                    :popover-options="{ appendTo: 'parent' }"
                                    v-model="item.type"
                                    @change="val => handleChange(val, 'type', index)"
                                >
                                    <bk-option v-for="option in typeList"
                                        :key="option.id"
                                        :id="option.id"
                                        :name="option.name">
                                    </bk-option>
                                </bk-select>
                            </div>
                        </template>
                        <div class="template-item">
                            <div class="label">
                                <span class="g-config-subline" v-bk-tooltips="{ content: '列宽度，请填写正整数，单位为px' }">width</span>
                            </div>
                            <bk-input :value="item.width" type="number" @change="val => handleChange(val, 'width', index)">
                                <template slot="append">
                                    <div class="group-text">px</div>
                                </template>
                            </bk-input>
                        </div>
                        <div class="template-item">
                            <div class="label">
                                <span class="g-config-subline" v-bk-tooltips="{ content: '对齐方式' }">align</span>
                            </div>
                            <bk-select
                                style="width: 100%; background-color: #fff"
                                :popover-options="{ appendTo: 'parent' }"
                                v-model="item.align"
                                @change="val => handleChange(val, 'align', index)"
                            >
                                <bk-option v-for="option in alignList"
                                    :key="option.id"
                                    :id="option.id"
                                    :name="option.name">
                                </bk-option>
                            </bk-select>
                        </div>
                        <div v-if="item.type !== 'customCol'" class="template-item" :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''">
                            <bk-checkbox :checked="item.sortable" @change="val => handleChange(val, 'sortable', index)" style="font-size: 12px;">
                                全局排序
                                <i
                                    class="bk-icon icon-info"
                                    v-bk-tooltips="{
                                        content: '当属性【data】是【函数】，且属性【pagination】是【远程分页】时，需要用户在【sort-change】事件中处理排序逻辑。其它情况系统会自动处理',
                                        width: '400'
                                    }"
                                ></i>
                            </bk-checkbox>
                        </div>
                        <div v-if="item.type !== 'customCol'" class="template-item" :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''">
                            <bk-checkbox :checked="item.filterable" @change="val => handleChange(val, 'filterable', index)" style="font-size: 12px;">
                                全局过滤
                                <i
                                    class="bk-icon icon-info"
                                    v-bk-tooltips="{
                                        content: '当属性【data】是【函数】，且属性【pagination】是【远程分页】时，需要用户在【filter-change】事件中处理过滤逻辑。其它情况系统会自动处理',
                                        width: '400'
                                    }"
                                ></i>
                            </bk-checkbox>
                        </div>
                    </section>
                </section>
            </bk-popover>
        </vue-draggable>
        <div>
            <span class="table-column-add" @click="handleAdd">添加默认列</span> |
            <span class="table-column-add" @click="handleAdd('customCol')"> 添加自定义内容列</span>
        </div>
        <edit-function-dialog :show.sync="showMethod"></edit-function-dialog>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import EditFunctionDialog from '@/components/methods/edit-function-dialog/index.vue'
    import {
        defineComponent,
        ref,
        watch,
        getCurrentInstance
    } from '@vue/composition-api'

    const generateColumn = (index) => ({
        label: `选项${index}`,
        prop: `prop${index}`,
        sortable: false,
        filterable: false,
        align: '',
        type: ''
    })
    const generateCustomColumn = (index) => ({
        type: 'customCol',
        label: `选项${index}`,
        templateCol: '<span><a style="color:#3A84FF;cursor:pointer" @click="editCallBack(props.row)">编辑</a> <a style="color:red;">获取行数据{{props.row.prop1}}</a></span>',
        methodCode: [],
        align: '',
        sortable: false,
        filterable: false
    })

    export default defineComponent({
        name: 'slot-table',

        components: {
            EditFunctionDialog
        },

        props: {
            slotVal: {
                type: Object,
                required: true
            },
            slotConfig: {
                type: Object,
                default: () => ({})
            },
            type: {
                type: String
            },
            change: {
                type: Function,
                default: (slot) => {}
            }
        },

        computed: {
            ...mapGetters('functions', ['funcGroups'])
        },

        setup (props) {
            const type = props.type
            const column = ref([])
            const showMethod = ref(false)
            const typeList = [
                { id: '', name: '普通数据列' },
                { id: 'selection', name: '多选框列' },
                // { id: 'expand', name: '展开按钮' },
                { id: 'index', name: '索引序号列（从 1 开始）' }
            ]
            const alignList = [
                { id: 'left', name: '左对齐' },
                { id: 'center', name: '居中' },
                { id: 'right', name: '右对齐' }
            ]
            const currentInstance = getCurrentInstance()

            const handleDelete = (index) => {
                if (column.value.length === 1) {
                    return
                }
                column.value.splice(index, 1)
                trigger()
            }

            const handleChange = (value, key, index) => {
                column.value[index][key] = value
                trigger()
            }

            const handleAdd = (type) => {
                if (type !== 'customCol') {
                    column.value.push(generateColumn(column.value.length + 1))
                } else {
                    column.value.push(generateCustomColumn(column.value.length + 1))
                }
                trigger()
            }

            const trigger = () => {
                const slot = {
                    ...props.slotVal,
                    val: JSON.parse(JSON.stringify(column.value))
                }
                props.change(slot, type)
            }

            const showMethodDialog = (index) => {
                const tablePopover = currentInstance.proxy.$refs.tablePopover[index]
                if (tablePopover) {
                    tablePopover.hideHandler()
                }
                showMethod.value = true
            }

            watch(
                () => props.slotVal.val,
                (val) => {
                    column.value = JSON.parse(JSON.stringify(val))
                },
                {
                    immediate: true
                }
            )

            return {
                column,
                showMethod,
                typeList,
                alignList,
                handleDelete,
                handleChange,
                handleAdd,
                trigger,
                showMethodDialog
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .group-list {
        margin-top: 4px;
        .list-item {
            line-height: 32px;
            margin-bottom: 8px;
            font-size: 12px;
            display: block;
            .item-content {
                background: #F5F7FA;
                border-radius: 2px;
                height: 32px;
                display: inline-block;
                width: calc(100% - 26px);
                padding: 0 8px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &:hover {
                    background: #EAEBF0;
                }
            }
            .icon-minus-circle {
                color: #979ba5;
                font-size: 14px;
                cursor: pointer;
                margin-left: 6px;
                &:hover {
                    color: #63656e;
                }
            }
            ::v-deep .bk-tooltip-ref {
                display: flex;
                align-items: center;
            }
        }
    }
    .table-column-add {
        font-size: 12px;
        cursor: pointer;
        color: #3a84ff;
        i {
            padding-right: 2px;
            font-size: 16px;
        }
    }
    .template-item-list {
        padding: 10px 16px 16px;
    }
    .template-item {
        margin-top: 12px;
        &:first-child {
            margin-top: 0;
        }
        .label {
            font-size: 12px;
            line-height: 20px;
            margin-bottom: 6px;
        }
    }
</style>
