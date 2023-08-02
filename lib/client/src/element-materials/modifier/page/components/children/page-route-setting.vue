<template>
    <style-layout
        :title="groupName">
        <template v-for="field in settingFields">
            <style-item :name="field.name" type="vertical" :key="field.id">
                <page-router-select
                    style="width: 100%"
                    :placeholder="field.placeholder"
                    :field="field"
                    :value.sync="renderValue[field.id]"
                    :clearable="false"
                    :class="[`form-component ${field.type}`, 'style-setting']"
                    v-model.trim="renderValue[field.id]"
                    @valueChange="handleConfirm"
                    @refreshData="refreshData"
                >
                </page-router-select>
            </style-item>
        </template>
    </style-layout>
</template>

<script>
    import StyleLayout from '@/element-materials/modifier/component/styles/layout/index'
    import StyleItem from '@/element-materials/modifier/component/styles/layout/item'
    import PageRouterSelect from '@/components/project/page-router-select'
    import { mapGetters } from 'vuex'
    import emitter from 'tiny-emitter/instance'

    export default {
        components: {
            StyleLayout,
            StyleItem,
            PageRouterSelect
        },
        data () {
            return {
                groupName: window.i18n.t('路由配置'),
                renderValue: {
                    layoutId: '',
                    pageRoute: ''
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapGetters('page', {
                platform: 'platform',
                page: 'pageDetail',
                pageRoute: 'pageRoute',
                layoutList: 'layoutList',
                routeGroup: 'routeGroup',
                styleSetting: 'styleSetting'
            }),
            projectId () {
                return this.$route.params.projectId
            },
            settingFields () {
                return [
                    {
                        id: 'layoutId',
                        name: window.i18n.t('导航布局'),
                        type: 'select',
                        props: {
                            clearable: false
                        },
                        children: (this.layoutList || []).filter(item => item.layoutType === this.platform).map((layout) => {
                            return {
                                id: layout.id,
                                type: 'option',
                                props: {
                                    id: layout.id,
                                    name: window.i18n.t('{0}（路由：{1}）', [layout.defaultName, layout.routePath])
                                }
                            }
                        })
                    },
                    {
                        id: 'pageRoute',
                        name: window.i18n.t('页面路由'),
                        type: 'select',
                        props: {
                            clearable: false
                        },
                        placeholder: window.i18n.t('未设置'),
                        children: this.routeSelect
                    }
                ]
            },
            routeSelect () {
                return Object.keys(this.routeGroup).map((group, groupIndex) => {
                    const routeList = this.routeGroup[group] || []
                    const children = routeList.map((route) => {
                        return {
                            id: route.id,
                            type: 'option',
                            props: {
                                id: route.id,
                                name: route.path || '/',
                                pageId: route.pageId,
                                disabled: route.pageId !== -1 || Boolean(route.redirect)
                            }
                        }
                    })
                    return {
                        id: groupIndex,
                        type: 'option-group',
                        props: {
                            name: group
                        },
                        children
                    }
                })
            }
        },
        created () {
            this.renderValue.layoutId = this.pageRoute.layoutId
            this.renderValue.pageRoute = this.pageRoute.id
        },
        methods: {
            async handleConfirm (key, value) {
                if (key === 'layoutId') {
                    this.$bkInfo({
                        title: '确认修改？',
                        subTitle: '当前使用的导航布局未保存的配置会丢失',
                        theme: 'primary',
                        confirmFn: async () => {
                            await this.handleConfirmSave(key, value)
                        }
                    })
                    return
                }

                this.handleConfirmSave(key, value)
            },

            async refreshData () {
                await this.fetchData()
            },

            async handleConfirmSave (key, value) {
                try {
                    const data = {
                        pageRoute: {},
                        projectId: this.projectId,
                        versionId: this.versionId,
                        pageId: this.page.id
                    }
                    if (key === 'layoutId') {
                        const layout = this.layoutList.find(item => item.id === value)
                        data.pageRoute = {
                            layoutId: layout.id,
                            layoutPath: layout.routePath,
                            path: this.pageRoute.path
                        }
                    } else if (key === 'pageRoute') {
                        const routeList = Object.values(this.routeGroup).reduce((pre, cur) => pre.concat(cur), [])
                        const route = routeList.find(item => item.id === value)
                        data.pageRoute = {
                            routeId: route.id,
                            layoutPath: this.pageRoute.layoutPath,
                            path: route.path
                        }
                    }
                    await this.$store.dispatch('route/updatePageRoute', { data })
                
                    await this.fetchData()

                    emitter.emit('update-preview-src')
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                }
            },
            fetchData () {
                return Promise.all([
                    this.$store.dispatch('page/getPageSetting', {
                        pageId: this.page.id,
                        projectId: this.projectId,
                        versionId: this.versionId
                    }),
                    // 导航模板切换后需要获取当前模板的导航数据，并更新更新本地curTemplateData
                    this.$store.dispatch('layout/getPageLayout', { pageId: this.page.id }),
                    this.$store.dispatch('route/getProjectPageRoute', {
                        projectId: this.projectId,
                        versionId: this.versionId
                    })
                ])
            }
        }
    }
</script>
