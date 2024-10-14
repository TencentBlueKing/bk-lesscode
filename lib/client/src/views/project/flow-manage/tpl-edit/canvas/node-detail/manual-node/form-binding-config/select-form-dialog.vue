<template>
    <bk-dialog
        class="select-form-dialog"
        width="704"
        render-directive="if"
        :value="show"
        :auto-close="false"
        :mask-close="false"
        :close-icon="false"
        @confirm="handleConfirm"
        @cancel="close">
        <header slot="header" class="dialog-header">
            <h4>{{$t('请选择已有表单')}}</h4>
            <span>（{{ isCite ? $t('引用') : $t('复用') }}{{$t('已有表单')}}）</span>
        </header>
        <div class="dialog-content" v-bkloading="{ isLoading: formListLoading }">
            <div class="search-area">
                <bk-input
                    :value="searchStr"
                    class="search-input"
                    right-icon="icon-search"
                    :clearable="true"
                    :placeholder="$t('请输入表单名称')"
                    @clear="handleSearch"
                    @enter="handleSearch"
                    @input="handleSearchInput">
                </bk-input>
            </div>
            <div class="tips-wrapper">
                <bk-alert type="warning" :closable="true" :title="tips" />
            </div>
            <div class="form-list-wrapper">
                <div
                    v-for="item in listInView"
                    v-bk-tooltips="{
                        disabled: !item.disabled,
                        placement: 'top',
                        content: $t('当前流程节点中已绑定表单不可复用')
                    }"
                    :key="item.id"
                    :class="['form-card-item', { 'selected': selected.id === item.id, disabled: item.disabled }]"
                    @click="handleSelect(item)">
                    <div class="selected-label"></div>
                    <span class="preview-btn" @click.stop="handlePreviewClick(item)">{{ $t('预览') }}</span>
                    <p class="form-name">{{ item.formName }}</p>
                </div>
                <bk-exception
                    v-if="listInView.length === 0"
                    class="empty-exception"
                    type="empty"
                    scene="part">
                    {{ searchStr ? '暂无搜索结果' : '暂无数据' }}
                </bk-exception>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    import { defineComponent, ref, computed, watch } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'

    export default defineComponent({
        name: 'SelectFormDialog',
        props: {
            show: {
                type: Boolean,
                default: false
            },
            // 是否为引用表单
            isCite: {
                type: Boolean,
                defualt: true
            },
            nodes: {
                type: Array,
                default: () => []
            }
        },
        setup (props, { emit }) {

            const store = useStore()
            const route = useRoute()

            const formList = ref([])
            const formListLoading = ref(false)
            const searchStr = ref('')
            const selected = ref({})

            const tips = computed(() => {
                return props.isCite
                    ? window.i18n.t('引用已有表单：引用已有表单快速创建新表单，可对新表单进行编辑')
                    : window.i18n.t('复用已有表单：系统将复用已有表单进行后续操作，不会创建新表单，不支持对复用表单进行编辑')
            })

            // 展示的表单列表
            const listInView = computed(() => {
                if (searchStr.value) {
                    return formList.value.filter(item => item.formName.includes(searchStr.value))
                }
                return formList.value
            })

            watch(() => props.show, (val) => {
                if (val) {
                    getFormList()
                }
            })

            const getFormList = async() => {
                formListLoading.value = true
                const params = {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId']
                }
                const res = await store.dispatch('nocode/form/getNewFormList', params)
                const boundFormNodes = props.nodes.filter(item => item.type === 'Manual' && item.formId)
                res.forEach(item => {
                    item.disabled = boundFormNodes.findIndex(node => node.formId === item.id) > -1
                })
                formList.value = res
                formListLoading.value = false
            }

            const handleSearch = (val) => {
                searchStr.value = val
            }

            const handleSearchInput = (val) => {
                if (!val) {
                    searchStr.value = ''
                }
            }

            const handleSelect = (form) => {
                if (form.disabled) {
                    return
                }
                selected.value = form
            }

            const handlePreviewClick = (form) => {
                emit('preview', form.id)
            }

            const handleConfirm = () => {
                emit('selected', selected.value)
                close()
            }

            const close = () => {
                searchStr.value = ''
                selected.value = {}
                emit('close')
            }

            return {
                formListLoading,
                listInView,
                searchStr,
                selected,
                tips,
                handleSearch,
                handleSearchInput,
                handleSelect,
                handlePreviewClick,
                handleConfirm,
                close
            }
        }
    })
</script>
<style lang="postcss">
    @import "@/css/mixins/scroller";

    .select-form-dialog {
        .bk-dialog-tool {
            display: none;
        }
        .dialog-header {
            display: flex;
            align-items: center;
            padding-top: 15px;
            h4 {
                margin: 0;
                font-size: 20px;
                line-height: 28px;
                font-weight: normal;
                color: #313238;
            }
            span {
                font-size: 12px;
                color: #63656e;
            }
        }
        .bk-dialog-body {
            padding-left: 0;
            padding-right: 0;
        }
        .search-area {
            padding: 0 24px 10px;
            text-align: right;
            .search-input {
                width: 240px;
            }
        }
        .tips-wrapper {
            margin-bottom: 16px;
            padding: 0 24px;
        }
        .form-list-wrapper {
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            min-height: 160px;
            max-height: 320px;
            overflow: auto;
            @mixin scroller;
        }
        .form-card-item {
            position: relative;
            margin-bottom: 16px;
            padding: 0 50px 0 16px;
            width: 320px;
            height: 50px;
            line-height: 50px;
            font-size: 12px;
            color: #63656e;
            border: 1px solid #dcdee5;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                border-color: #3a84ff;
                .preview-btn {
                    display: block;
                }
            }
            &.selected {
                border-color: #3a84ff;
                .selected-label {
                    display: block;
                }
            }
            &.disabled {
                cursor: not-allowed;
                color: #cccccc;
                background-color: #fafbfd;
                border-color: #dcdee5;
            }
            .selected-label {
                display: none;
                position: absolute;
                top: 0;
                right: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 36px 36px 0;
                border-color: transparent #3a84ff transparent transparent;
                &:before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    right: -34px;
                    width: 11px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(-45deg);
                    border-bottom-left-radius: 1px;
                }
                &:after {
                    content: '';
                    position: absolute;
                    top: 12px;
                    right: -26px;
                    width: 5px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(45deg);
                    border-bottom-right-radius: 1px;
                }
            }
            .preview-btn {
                display: none;
                position: absolute;
                right: 20px;
                top: 18px;
                font-size: 12px;
                line-height: 1;
                color: #3a84ff;
                cursor: pointer;
            }
            .form-name {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
        .empty-exception {
            margin: 40px 0 80px;
        }
    }
</style>