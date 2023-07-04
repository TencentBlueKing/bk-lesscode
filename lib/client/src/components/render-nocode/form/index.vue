<template>
    <draw-layout
        class="lesscode-editor-page-content"
        :page-type="pageType"
        v-bkloading="{ isLoading }">
        <!-- 表单左边标签选择面板 -->
        <left-panel slot="left" :page-type="pageType" :disabled="disabled" @move="fieldPanelHover = true" @end="fieldPanelHover = false" />
        <!-- <section ref="root"> -->
        <section ref="root" class="nocode-center-content-wrapper" :style="centerRenderStyle">
            <layout style="background: #fff; height: 100%">
                <form-content
                    :fields="fieldsList"
                    :curfield="crtField"
                    :disabled="disabled"
                    @add="handleAddField"
                    @select="handleSelectField"
                    @copy="handleCopyField"
                    @delete="handleDeleteField"
                    @move="handleOrderField"
                    @clickOutSide="crtField = {}"
                />
            </layout>
        </section>
        <!-- </section> -->
        <!-- 表单右边设置区域 -->
        <right-panel slot="right" :is-from-flow="isFromFlow" :field="crtField" :list="fieldsList" :disabled="disabled" @update="handleUpdateField" />
    </draw-layout>

</template>

<script>
    import { mapGetters } from 'vuex'   
    import cloneDeep from 'lodash.clonedeep'
    import _ from 'lodash'
    import { messageError } from '@/common/bkmagic'
    import contentWidthMixin from '../content-width-mixin'
    import DrawLayout from '@/views/index/components/draw-layout'
    import LeftPanel from './components/left-panel'
    import RightPanel from './components/right-panel'
    import Layout from '@/components/render-nocode/components/layout'
    import FormContent from './components/form-content'
    import { bus } from '@/common/bus'
    export default {
        components: {
            DrawLayout,
            LeftPanel,
            RightPanel,
            Layout,
            FormContent
        },
        mixins: [contentWidthMixin],
        props: {
            isFromFlow: Boolean, //标识是否是流程表单
            pageType: String,
            content: Array,
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                fieldsList: [],
                isLoading: false,
                fieldPanelHover: false,
                createPlatform: 'PC',
                createNocodeType: 'FORM_MANAGE',
                isEdit: false, // 判断用户是否编辑
                crtIndex: -1, // 当前选中字段索引
                crtField: {} // 当前选中字段
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            formId () {
                return this.pageDetail.formId
            },
            initManagePageData () {
                const { formId, pageCode, pageName } = this.pageDetail
                return {
                    formId,
                    pageCode: pageCode + 'manage',
                    pageName: pageName + '_' + this.$t('表单数据管理页'),
                    content: JSON.stringify({ filters: [], tableConfig: ['createUser', 'createTime'] })
                }
            }
        },
        watch: {
            content (val) {
                this.fieldsList = cloneDeep(val)
            }
        },
        created () {
            if (this.content) {
                this.fieldsList = cloneDeep(this.content)
                this.saveFieldList()
            } else {
                this.getFieldList()
            }

            bus.$on('resetFieldList', (fieldsList = []) => {
                this.fieldsList = []
                this.fieldsList = fieldsList
                this.crtField = {}
                this.crtIndex = -1
            })
            bus.$on('saveSuccess', () => {
                this.fieldsList = this.fieldsList.map(item => {
                    return { ...item, disabled: true }
                })
                this.crtField = {}
                this.crtIndex = -1
            })
            bus.$on('clearCurFormField', () => {
                this.crtField = {}
                this.crtIndex = -1
            })
        },
        mounted () {
            const resizeObserverCallback = _.throttle(() => {
                this.calcRenderStyles()
            }, 100)

            const activeResizeObserver = new ResizeObserver(resizeObserverCallback)
            activeResizeObserver.observe(this.$refs.root)
            this.$once('hook:beforeDestroy', () => {
                activeResizeObserver.unobserve(this.$refs.root)
            })
        },
        beforeDestroy () {
            bus.$off('resetFieldList')
            bus.$off('saveSuccess')
        },
        methods: {
            // 添加字段
            handleAddField (field, index) {
                this.isEdit = true
                this.fieldsList.splice(index, 0, field)
                this.handleSelectField(field, index)
                this.saveFieldList()
            },
            async getFieldList () {
                try {
                    if (this.formId) {
                        this.isLoading = true
                        const form = await this.$store.dispatch('nocode/form/formDetail', { formId: this.formId })
                        this.fieldsList = JSON.parse(form.content).map(item => {
                            return { ...item, disabled: true }
                        }) || []
                        this.saveFieldList()
                    }
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.isLoading = false
                }
            },
            // 复制字段
            handleCopyField (field, index) {
                this.isEdit = true
                this.fieldsList.splice(index + 1, 0, field)
                this.handleSelectField(field, index + 1)
                this.saveFieldList()
            },
            // 删除字段
            handleDeleteField (index) {
                this.isEdit = true
                this.fieldsList.splice(index, 1)
                this.crtField = {}
                if (this.crtIndex === index) {
                    this.crtIndex = -1
                }
                this.saveFieldList()
            },
            // 选中字段
            handleSelectField (field, index) {
                this.crtField = field
                this.crtIndex = index
            },
            // 拖拽字段顺序
            handleOrderField (newIndex, oldIndex) {
                this.isEdit = true
                const field = this.fieldsList.splice(oldIndex, 1)
                this.fieldsList.splice(newIndex, 0, field[0])
                this.crtIndex = newIndex
                this.crtField = cloneDeep(this.fieldsList[newIndex])
                this.saveFieldList()
            },
            handleUpdateField (val) {
                this.isEdit = true
                this.crtField = val
                this.fieldsList.splice(this.crtIndex, 1, val)
                this.saveFieldList()
            },
            saveFieldList () {
                this.$store.commit('nocode/formSetting/setFieldsList', this.fieldsList)
            }
        }
    }
</script>
