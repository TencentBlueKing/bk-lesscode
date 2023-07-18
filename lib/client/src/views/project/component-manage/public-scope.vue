<template>
    <bk-dialog
        :render-directive="'if'"
        :class="$style['public-scope-dialog']"
        :title="$t('公开范围设置')"
        :value="isShow"
        @cancel="handleCancel"
        :mask-close="false"
        :width="700"
        header-position="left">
        <div :class="{ 'scope-specify': scope === ScopeValue.Specify, 'scope-all': scope === ScopeValue.All }">
            <bk-form form-type="vertical">
                <bk-form-item label="公开范围">
                    <bk-radio-group v-model="scope" class="scope-radio-group" v-enClass="'en-scope-radio-group'">
                        <bk-radio :value="ScopeValue.Self">{{ $t('仅本应用') }}</bk-radio>
                        <bk-radio :value="ScopeValue.Specify">{{ $t('特定应用') }}</bk-radio>
                        <bk-radio :value="ScopeValue.All">{{ $t('所有应用，包含后续新增') }}</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <div class="scope-transfer-wrapper" v-if="scope === ScopeValue.Specify">
                    <bk-transfer
                        :target-list="selectedProjetList"
                        :source-list="sourceProjectList"
                        v-bind="transfer"
                        :sortable="true"
                        @change="handleChange">
                    </bk-transfer>
                </div>
                <bk-form-item label="公开至分类" v-if="scope === ScopeValue.Specify || scope === ScopeValue.All" :required="true">
                    <bk-select v-model="publicType" :clearable="false">
                        <bk-option v-for="customComps in publicTypeList"
                            :key="customComps.id"
                            :id="customComps.id"
                            :name="customComps.name">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
            </bk-form>
        </div>
        <div slot="footer">
            <bk-button
                theme="primary"
                :disabled="dialog.disabled"
                :loading="dialog.loading"
                @click="handleConfirm">{{ $t('确定') }}</bk-button>
            <bk-button @click="handleCancel" :disabled="dialog.loading" style="margin-left: 8px">{{ $t('取消') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    import {
        isMatchFramework
    } from 'shared/util'
    import {
        CUSTOM_COMPS_TYPE
    } from '@/common/constant'

    export default {
        name: '',
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object,
                default: () => ({
                    scope: [],
                    comp: {}
                })
            }
        },
        data () {
            return {
                ScopeValue: {
                    Self: 0,
                    Specify: -1,
                    All: 1
                },
                sourceProjectList: [],
                selectedProjetList: [],
                targetProjects: [],
                scope: 0,
                dialog: {
                    disabled: false,
                    loading: false
                },
                publicType: '',
                publicTypeList: CUSTOM_COMPS_TYPE,
                transfer: {
                    title: [window.i18n.t('应用列表'), window.i18n.t('公开应用')],
                    emptyContent: [window.i18n.t('无应用'), window.i18n.t('未选择应用')],
                    displayKey: 'projectName',
                    settingKey: 'id'
                }
            }
        },
        computed: {
            projectId () {
                return parseInt(this.$route.params.projectId)
            }
        },
        watch: {
            data (data) {
                this.scope = data.scope[1]
                this.publicType = data.comp.publicType
                if (this.scope === this.ScopeValue.Specify) {
                    this.selectedProjetList = data.scope[0].map(item => item.projectId)
                } else {
                    this.selectedProjetList = []
                }
            },
            scope (scope) {
                this.dialog.disabled = scope === this.ScopeValue.Specify
            },
            selectedProjetList () {
                this.appendSourceProject()
            }
        },
        async created () {
            const url = IAM_ENABLE ? 'iam/myProject' : 'project/my'
            const projectList = await this.$store.dispatch(url, { config: {} })
            const currentProject = projectList.splice(projectList.findIndex(item => item.id === this.projectId), 1)[0]
            // 过滤出符合框架版本的应用
            this.sourceProjectList = projectList.filter((project) => isMatchFramework(currentProject.framework, project.framework))
        },
        methods: {
            appendSourceProject () {
                if (this.scope === this.ScopeValue.Specify) {
                    const targetProjects = this.data.scope[0] || []
                    // 用户A1共享应用P给A2，P应用组件C公开范围为特定应用P1此应用只属于A1，A2查看应用P的组件C公开范围设置时，在“公开应用”中看不到P1
                    // 因为逻辑上设置特定应用时的应用数据只能是当前用户A2的应用（包括共享应用），P1应用不属于A2
                    // 所以，此处将P1应用也共享给A2即可在设置中正常显示出P1，但由于共享其它应用的组件并非强制应用一定要属于用户，因此为了满足设置上的需求
                    // 在现有数据的基础上，将非当前用户的应用数据追加到应用列表中
                    const appendProjects = targetProjects.filter(item => this.sourceProjectList.findIndex(source => source.id === item.projectId) === -1)
                    this.sourceProjectList.push(...appendProjects.map(item => ({
                        id: item.projectId,
                        ...item
                    })))
                }
            },
            async handleConfirm () {
                if (this.scope !== this.ScopeValue.Specify && this.scope === this.data.scope[1] && this.publicType === this.data.comp.publicType) {
                    this.$emit('update:isShow', false)
                    return
                }
                const data = {
                    scope: this.scope,
                    targetProjects: this.targetProjects,
                    compId: this.data.comp.id,
                    projectId: this.data.comp.belongProjectId
                }
                if (this.scope && !this.publicType) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('公开范围至分类不能为空')
                    })
                    return
                } else {
                    if (this.scope) {
                        Object.assign(data, { publicType: this.publicType })
                    }
                }

                try {
                    this.dialog.loading = true
                    await this.$store.dispatch('components/scope', { data })
                    this.messageSuccess(window.i18n.t('设置成功'))
                    this.$emit('update:isShow', false)
                    this.$emit('on-update')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.loading = false
                }
            },
            handleCancel () {
                this.scope = this.data.scope[1]
                this.$emit('update:isShow', false)
            },
            handleChange (sourceList, targetList, targetValueList) {
                this.dialog.disabled = targetValueList.length === 0
                this.targetProjects = targetValueList
            }
        }
    }
</script>
<style lang="postcss" module>
    .public-scope-dialog {
    }

    :global {
        .scope-radio-group {
            margin-bottom: 40px;
            margin-top: 8px;

            .bk-form-radio {
                width: 160px;

                &:last-child {
                    width: 180px;
                }
            }
        }

        .scope-transfer-wrapper {
            height: 320px;
            .source-list,
            .target-list {
                height: 320px;
            }
        }

        .scope-specify {
            .scope-radio-group {
                margin-bottom: 22px;
            }
        }
        .scope-all {
            .scope-radio-group {
                margin-bottom: 16px;
            }
        }
    }
    :global {
        .en-scope-radio-group{
            .bk-form-radio {

                &:last-child {
                    width: 315px;
                }
            }
        }
    }
</style>
