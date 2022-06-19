<template>
    <draw-layout
        class="lesscode-editor-page-content"
        v-bkloading="{ isLoading }">
        <left-panel slot="left" :disabled="disabled" @move="fieldPanelHover = true" @end="fieldPanelHover = false" />
        <layout style="margin: 20px 0;height: 100%">
            <form-content
                :fields="fieldsList"
                :curfield="crtField"
                :disabled="disabled"
                @add="handleAddField"
                @select="handleSelectField"
                @copy="handleCopyField"
                @delete="handleDeleteField"
                @move="handleOrderField"
            />
        </layout>
        <right-panel slot="right" :field="crtField" :list="fieldsList" :disabled="disabled" @update="handleUpdateField" />
        <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" :init-page-data="initManagePageData" />
    </draw-layout>

</template>

<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import { messageError } from '@/common/bkmagic'
    import DrawLayout from '@/views/index/components/draw-layout'
    import LeftPanel from './components/left-panel'
    import RightPanel from './components/right-panel'
    import Layout from '@/components/render/pc/widget/layout'
    import FormContent from './components/form-content'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'
    import { bus } from '@/common/bus'
    export default {
        components: {
            DrawLayout,
            LeftPanel,
            RightPanel,
            Layout,
            FormContent,
            CreatePageDialog
        },
        props: {
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
                    pageName: pageName + '_数据管理页'
                }
            }
        },
        created () {
            if (this.pageDetail.formId) {
                this.getFieldList()
            }

            bus.$on('resetFieldList', (fieldsList = []) => {
                this.fieldsList = []
                this.fieldsList = fieldsList
                this.crtField = {}
                this.crtIndex = -1
            })
            bus.$on('openCreatPageFrom', () => {
                if (this.formId) {
                    this.$refs.createPageDialog.isShow = true
                } else {
                    this.$bkMessage({
                        theme: 'warning',
                        message: '请先保存表单页面再生成数据管理页'
                    })
                }
            })
            bus.$on('saveSuccess', () => {
                this.fieldsList = this.fieldsList.map(item => {
                    return { ...item, disabled: true }
                })
            })
        },
        beforeDestroy () {
            bus.$off('resetFieldList')
            bus.$off('openCreatPageFrom')
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
<style lang="postcss" >
.middle{
  display: none;
}
</style>
