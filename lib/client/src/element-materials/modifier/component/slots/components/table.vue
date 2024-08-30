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
                            <div class="label">{{ $t('名称') }}</div>
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
                                            content: '1. ' + $t('可输入 html模板或 vue template')
                                                + '<br>2. `props.row`' + $t('作为内置变量代表表格每一行的数据，如`props.row.id`代表每一行的id字段')
                                                + '<br>3. ' + $t('可以在此处通过编写函数名来调用函数管理中已有的函数（若使用了函数管理中的函数，需在模板绑定函数项勾选用到的函数）')
                                                + '<br>4. ' + $t('如默认值demo即可实现一项编辑操作列')
                                                + '<br>5. ' + $t('注意：自定列模板使用手动填写函数名的方式使用函数，如果函数名有变化，需要手动进行修改'),
                                            allowHtml: true
                                        }">
                                        {{$t('自定义列模板')}}
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
                                            content: `1. ${$t('请勾选列模板中使用到的函数管理中的函数')}
                                                      2. ${$t('未使用函数则无须勾选')}
                                                      3. ${$t('注意：此处系统显示函数标识')}`,
                                            allowHtml: true,
                                            maxWidth: 400
                                        }">
                                        {{$t('模板绑定函数')}}
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
                                            <i class="bk-icon icon-info" v-bk-tooltips="option.funcSummary || $t('该函数暂无描述')"></i>
                                        </bk-option>
                                    </bk-option-group>
                                    <div slot="extension" style="cursor: pointer;" @click="showMethodDialog(index)">
                                        <i class="bk-drag-icon bk-drag-function-fill"></i>{{$t('函数管理')}}
                                    </div>
                                </bk-select>
                            </div>
                        </template>
                        <template v-else>
                            <div
                                v-if="item.type !== 'status'"
                                class="template-item"
                                :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''"
                            >
                                <div class="label">
                                    <span class="g-config-subline" v-bk-tooltips="{ content: $t('该列对应的字段名') }">{{ $t('字段名') }}</span>
                                </div>
                                <bk-input :value="item.prop" @change="val => handleChange(val, 'prop', index)" />
                            </div>
                            <div class="template-item">
                                <div class="label">{{$t('列类型')}}</div>
                                <bk-select
                                    style="width: 100%; background-color: #fff"
                                    :popover-options="{ appendTo: 'parent' }"
                                    :value="item.type || 'normal'"
                                    @change="val => handleChange(val === 'normal' ? '' : val, 'type', index)"
                                >
                                    <bk-option
                                        v-for="option in typeList"
                                        :key="option.id"
                                        :id="option.id"
                                        :name="option.name"
                                    >
                                    </bk-option>
                                </bk-select>
                            </div>
                        </template>
                        <div class="template-item" v-if="item.type === 'status'">
                            <div class="label">{{$t('状态设置')}}</div>
                            <section
                                v-for="status,statusIndex in item.status"
                                :key="statusIndex"
                                class="status-main"
                            >
                                <h5 class="status-head">
                                    {{$t('当满足')}}
                                    <i
                                        :class="{
                                            'bk-drag-icon bk-drag-delete': true,
                                            disabled: item.status.length <= 1
                                        }"
                                        @click="handleDeleteStatus(statusIndex, index)"
                                    ></i>
                                </h5>
                                <bk-compose-form-item>
                                    <bk-select
                                        style="width: 110px"
                                        :value="status.when.field"
                                        :clearable="false"
                                        :popover-options="{ appendTo: 'parent' }"
                                        @change="val => handleStatusChange(val, 'when', 'field', statusIndex, index)"
                                    >
                                        <bk-option
                                            v-for="columnItem,columnIndex in column"
                                            :key="columnItem.label + columnItem.prop + columnIndex"
                                            :id="columnItem.prop"
                                            :name="columnItem.label"
                                        />
                                    </bk-select>
                                    <bk-select
                                        style="width: 46px"
                                        :popover-width="100"
                                        :value="status.when.comparator"
                                        :clearable="false"
                                        :popover-options="{ appendTo: 'parent' }"
                                        @change="val => handleStatusChange(val, 'when', 'comparator', statusIndex, index)"
                                    >
                                        <bk-option
                                            v-for="comparatorItem in comparatorList"
                                            :key="comparatorItem"
                                            :id="comparatorItem"
                                            :name="comparatorItem"
                                        />
                                    </bk-select>
                                    <bk-input
                                        style="width: 92px"
                                        :value="status.when.value"
                                        @change="val => handleStatusChange(val, 'when', 'value', statusIndex, index)"
                                    />
                                </bk-compose-form-item>
                                <h5 class="status-head mt-5">
                                    {{$t('则显示')}}
                                </h5>
                                <bk-compose-form-item>
                                    <bk-select
                                        style="width: 110px;height:31.34px;"
                                        :value="status.show.status"
                                        :clearable="false"
                                        :popover-options="{ appendTo: 'parent' }"
                                        @change="val => handleStatusChange(val, 'show', 'status', statusIndex, index)"
                                    >
                                        <bk-option
                                            v-for="statusItem in statusList"
                                            :key="statusItem"
                                            :id="statusItem"
                                            :name="statusItem"
                                        >
                                            <img
                                                class="status-img"
                                                :src="`/static/images/icon/${statusItem}.svg`"
                                            />
                                        </bk-option>
                                        <template #trigger>
                                            <section class="status-trigger">
                                                <i class="bk-select-angle bk-icon icon-angle-down"></i>
                                                <img
                                                    class="status-img"
                                                    :src="`/static/images/icon/${status.show.status}.svg`"
                                                />
                                            </section>
                                        </template>
                                    </bk-select>
                                    <bk-input
                                        style="width: 137px"
                                        :value="status.show.description"
                                        @change="val => handleStatusChange(val, 'show', 'description', statusIndex, index)"
                                    />
                                </bk-compose-form-item>
                            </section>
                            <bk-link
                                theme="primary"
                                icon="bk-icon icon-plus-circle"
                                class="plus-status-icon"
                                @click="handlePlusStatus(index)"
                            >{{$t('添加')}}</bk-link>
                        </div>
                        <div class="template-item">
                            <div class="label">
                                <span class="g-config-subline" v-bk-tooltips="{ content: $t('列宽度，请填写正整数，单位为px') }">{{ $t('宽度') }}</span>
                            </div>
                            <bk-input :value="item.width" type="number" @change="val => handleChange(val, 'width', index)">
                                <template slot="append">
                                    <div class="group-text">px</div>
                                </template>
                            </bk-input>
                        </div>
                        <div class="template-item" v-if="projectDetail.framework !== 'vue3'">
                            <div class="label">
                                <span class="g-config-subline" v-bk-tooltips="{ content: $t('对齐方式') }">{{ $t('对齐方式') }}</span>
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
                        <div v-if="item.type !== 'customCol' && projectDetail.framework !== 'vue3'" class="template-item" :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''">
                            <bk-checkbox :checked="item.sortable" @change="val => handleChange(val, 'sortable', index)" style="font-size: 12px;">
                                {{$t('全局排序')}}
                                <i
                                    class="bk-icon icon-info"
                                    v-bk-tooltips="{
                                        content: $t('当属性【data】是【函数】，且属性【pagination】是【远程分页】时，需要用户在【sort-change】事件中处理排序逻辑。其它情况系统会自动处理'),
                                        maxWidth: '400'
                                    }"
                                ></i>
                            </bk-checkbox>
                        </div>
                        <div v-if="item.type !== 'customCol' && projectDetail.framework !== 'vue3'" class="template-item" :class="(item.type === 'selection' || item.type === 'index') ? 'disabled' : ''">
                            <bk-checkbox :checked="item.filterable" @change="val => handleChange(val, 'filterable', index)" style="font-size: 12px;">
                                {{$t('全局过滤')}}
                                <i
                                    class="bk-icon icon-info"
                                    v-bk-tooltips="{
                                        content: $t('当属性【data】是【函数】，且属性【pagination】是【远程分页】时，需要用户在【filter-change】事件中处理过滤逻辑。其它情况系统会自动处理'),
                                        maxWidth: '400'
                                    }"
                                ></i>
                            </bk-checkbox>
                        </div>
                    </section>
                </section>
            </bk-popover>
        </vue-draggable>
        <div>
            <span class="table-column-add" @click="handleAdd">{{$t('添加默认列')}}</span> |
            <span class="table-column-add" @click="handleAdd('customCol')"> {{$t('添加自定义内容列')}}</span>
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
        label: window.i18n.t('选项{0}', { n: index }),
        prop: `prop${index}`,
        sortable: false,
        filterable: false,
        align: '',
        type: ''
    })
    const generateCustomColumn = (index) => ({
        type: 'customCol',
        label: window.i18n.t('选项{0}', { n: index }),
        templateCol: '<span><a style="color:#3A84FF;cursor:pointer" @click="editCallBack(props.row)">' + window.i18n.t('编辑') + '</a> <a style="color:red;">' + window.i18n.t('获取行数据') + '{{props.row.prop1}}</a></span>',
        methodCode: [],
        align: '',
        sortable: false,
        filterable: false
    })
    const generateStatus = (field) => ({
        when: {
            field,
            comparator: '>',
            value: ''
        },
        show: {
            status: 'success',
            description: ''
        }
    })
    const statusList = [
        'normal',
        'error',
        'unknown',
        'warning',
        'success',
        'waiting',
        'pending',
        'failed',
        'loading'
    ]
    const comparatorList = [
        '>',
        '<',
        '>=',
        '<=',
        '=',
        '!=',
        'in',
        'like'
    ]

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
            ...mapGetters('functions', ['funcGroups']),
            ...mapGetters('project', ['projectDetail'])
        },

        setup (props) {
            const type = props.type
            const column = ref([])
            const showMethod = ref(false)
            // normal 是因为必须有一个id，空字符串select会有重影
            const typeList = [
                { id: 'normal', name: window.i18n.t('普通数据列') },
                { id: 'selection', name: window.i18n.t('多选框列') },
                // { id: 'expand', name: '展开按钮' },
                { id: 'index', name: window.i18n.t('索引序号列（从 1 开始）') },
                { id: 'status', name: window.i18n.t('状态列') }
            ]
            const alignList = [
                { id: 'left', name: window.i18n.t('左对齐') },
                { id: 'center', name: window.i18n.t('居中') },
                { id: 'right', name: window.i18n.t('右对齐') }
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
                if (key === 'type' && !column.value[index].status?.length) {
                    column.value[index].status = [
                        generateStatus(column.value[0].prop)
                    ]
                }
                column.value[index][key] = value
                trigger()
            }

            const handleStatusChange = (value, statusKey, key, statusIndex, index) => {
                column.value[index].status[statusIndex][statusKey][key] = value
                trigger()
            }

            const handlePlusStatus = (index) => {
                column.value[index].status.push(generateStatus(column.value[0].prop))
                trigger()
            }

            const handleDeleteStatus = (statusIndex, index) => {
                if (column.value[index].status.length <= 1) return

                column.value[index].status.splice(statusIndex, 1)
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
                statusList,
                comparatorList,
                handleDelete,
                handleChange,
                handleStatusChange,
                handlePlusStatus,
                handleDeleteStatus,
                handleAdd,
                trigger,
                showMethodDialog
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

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
        max-height: 600px;
        overflow-y: auto;
        @mixin scroller;
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
    .status-main {
        background: #F0F1F5;
        border-radius: 2px;
        padding: 8px;
        margin-bottom: 12px;
        /deep/ input {
            height: 30px;
            box-sizing: content-box;
        }
        &:hover {
            box-shadow: 0 2px 4px 0 #0000001a, 0 2px 4px 0 #1919290d;
        }
    }
    .status-head {
        color: #63656E;
        font-size: 12px;
        line-height: 20px;
        display: flex;
        justify-content: space-between;
        font-weight: normal;
        margin: 0 0 4px;
        &.mt-5 {
            margin-top: 5px;
        }
        .bk-drag-delete {
            cursor: pointer;
            color: #979BA5;
            &.disabled {
                color: #c4c6cc;
                cursor: not-allowed;
            }
        }
    }
    .plus-status-icon {
        margin-top: -4px;
        ::v-deep .bk-link-text {
            font-size: 12px;
        }
    }
    .status-trigger {
        display: flex;
        align-items: center;
        height: 31.34px;
        padding-left: 11px;
    }
    .status-img {
        width: 13px;
        height: 13px;
    }
</style>
