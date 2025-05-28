<template>
    <section class="flow-tpl-config">
        <div class="config-form-wrapper">
            <bk-form
                ref="configForm"
                class="config-form-list"
                :model="formData"
                :label-width="140"
                :rules="rules">
                <section class="form-section">
                    <h4>{{ $t('基础') }}</h4>
                    <bk-form-item
                        :property="'name'"
                        :label="$t('流程名称')"
                        :required="true">
                        <bk-input
                            ref="nameInput"
                            v-model.trim="formData.name"
                            :placeholder="$t('请输入流程模板名称')"
                            :show-word-limit="true" />
                    </bk-form-item>
                    <bk-form-item :label="$t('关联流程管理页')">
                            <PageBoundEditor
                                type="widget-flow-manage-container"
                                :pages="flowContainerPages"
                                :tpl-id="tplDetail.id"
                                :nodes="JSON.parse(tplDetail.nodes || '[]')"
                                @update="handleUpdateFlowContainerPages"/>
                    </bk-form-item>
                </section>
                <section class="form-section">
                    <h4>
                        <span>{{ $t('通知') }}</span>
                        <span class="tip-desc">{{ $t('选择通知方式后，将默认通知到任务执行人') }}</span>
                    </h4>
                    <NotifyTypeConfig :notifyConfig="formData.notifyConfig" @change="handleNotifyChange" />
                </section>
                <section class="form-section">
                    <h4>{{ $t('其他') }}</h4>
                    <bk-form-item
                        property="summary"
                        :label="$t('备注')">
                        <bk-input
                            v-model.trim="formData.summary"
                            type="textarea"
                            :rows="5"
                            :placeholder="$t('请输入流程模板备注信息')" />
                    </bk-form-item>
                </section>
            </bk-form>
        </div>
        <div class="action-wrapper">
            <bk-button
                theme="primary"
                :loading="pending"
                @click="handleSave">
                {{ $t('提交') }}
            </bk-button>
            <bk-button @click="$router.push({ name: 'flowTplList' })">{{ $t('取消') }}</bk-button>
        </div>
    </section>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import { createNode } from '@/element-materials/core/static/create-node'
    import NotifyTypeConfig from './notify-type-config.vue'
    import PageBoundEditor from '../canvas/node-detail/manual-node/form-binding-config/page-bound-editor.vue'

    export default {
        name: 'FlowTplConfig',
        components: {
            NotifyTypeConfig,
            PageBoundEditor
        },
        props: {
            tplDetail: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                formData: {
                    name: '',
                    notifyConfig: {
                        notifyType: {
                            fail: [],
                            success: []
                        },
                        receivers: ''
                    },
                    summary: ''
                },
                relatedPages: [],
                relatedPagesLoading: false,
                flowContainerPages: [],
                createRelatedPageShow: false,
                pending: false,
                rules: {
                    name: [
                        {
                            required: true,
                            message: window.i18n.t('流程名称为必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapState({
                pageList: state => state.route.layoutPageList.filter(item => item.pageType === 'PC')
                
            }),
            ...mapGetters('projectVersion', {
                versionId: 'currentVersionId'
            }),
            ...mapGetters('project', {
                projectDetail: 'projectDetail'
            })
        },
        watch: {
            tplDetail: {
                handler (val) {
                    const { name, notifyConfig, summary } = val
                    this.formData = {
                        name,
                        summary,
                        notifyConfig: JSON.parse(notifyConfig),
                    }
                },
                immediate: true
            }
        },
        mounted () {
            this.getRelatedPages()
        },
        methods: {
            async getRelatedPages () {
                this.relatedPagesLoading = true
                const { flowManageContainer } = await this.$store.dispatch('flow/tpl/getRelatedPages', {
                    tplId: this.tplDetail.id,
                    params: {
                        versionId: this.versionId,
                        containers: ['flowManageContainer'],
                    }
                })
                this.relatedPages = flowManageContainer.map(page => page.id)
                this.flowContainerPages = this.relatedPages.slice()
                this.relatedPagesLoading = false
            },
            handleUpdateFlowContainerPages ({ pages, refresh }) {
                this.flowContainerPages = pages
                if (refresh) {
                    this.relatedPages = [...pages]
                }
            },
            handleNotifyChange (val) {
                this.formData.notifyConfig = val
            },
            getPagesDiff () {
                const setA = new Set(this.relatedPages);
                const setB = new Set(this.flowContainerPages);

                const added = Array.from(setB).filter(x => !setA.has(x));
                const removed = Array.from(setA).filter(x => !setB.has(x));

                return { added, removed };
            },
            getFlowManageContainerConfig () {
                const config = createNode('widget-flow-manage-container', this.projectDetail.framework).toJSON()
                config.renderProps.id.code = this.tplDetail.id
                config.renderProps.id.renderValue = this.tplDetail.id
                return config
            },
            async handleSave () {
                await this.$refs.configForm.validate()
                const { name, notifyConfig, summary } = this.formData
                const data = {
                    ...this.tplDetail,
                    name,
                    summary,
                    notifyConfig: JSON.stringify(notifyConfig)
                }
                await this.$store.dispatch('flow/tpl/updateFlowTpl', data)

                // 更新关联页面
                const pagesDiff = this.getPagesDiff()
                if (pagesDiff.added.length || pagesDiff.removed.length) {
                    await this.$store.dispatch('flow/tpl/updateRelatedPages', {
                        params: {
                            versionId: this.versionId,
                            tplId: this.tplDetail.id,
                            added: pagesDiff.added.reduce((acc, cur) => {
                                const config = this.getFlowManageContainerConfig()
                                if (acc[cur]) {
                                    acc[cur].push(config)
                                } else {
                                    acc[cur] = [config]
                                }
                                return acc
                            }, {}),
                            removed: {
                               flowManageContainer: pagesDiff.removed.map(pageId => ({ pageId }))
                            }
                        }
                    })
                    this.relatedPages = this.flowContainerPages.slice()
                }
                this.$bkMessage({
                    theme: 'success',
                    message: '保存成功'
                })
                this.$router.push({ name: 'flowTplList' })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.flow-tpl-config {
  position: relative;
  height: 100%;
  overflow: auto;
}
.config-form-wrapper {
  margin: 24px;
  padding: 24px;
  background: #ffffff;
}
.config-form-list {
    width: 740px;
}
.form-section {
    margin-bottom: 30px;
    & > h4 {
        margin: 0 0 24px 0;
        padding-bottom: 10px;
        color: #313238;
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid #cacedb;
    }
    .tip-desc {
        font-size: 12px;
        font-weight: normal;
        margin-left: 20px;
        color: #979ba5;
    }
}
.action-wrapper {
    margin: 32px 0;
    padding: 0 24px;
    overflow: hidden;
    .bk-button {
        margin-right: 4px;
        min-width: 88px;
    }
}
</style>
