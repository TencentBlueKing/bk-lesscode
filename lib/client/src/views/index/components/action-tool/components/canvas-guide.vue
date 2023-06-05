<template>
    <section style="height: 100%">
        <menu-item :item="item" />
        <novice-guide ref="guide" :data="guideStep" />
    </section>
</template>

<script>
    import MenuItem from './menu-item'
    import NoviceGuide from '@/components/novice-guide'
    
    export default {
        components: {
            MenuItem,
            NoviceGuide
        },
        data () {
            return {
                item: {
                    icon: 'bk-icon icon-question-circle',
                    func: this.handleStartGuide,
                    tips: this.$t('画布操作指引')
                },
                guideStep: []
            }
        },
        created () {
            this.guideStep = [
                {
                    title: window.i18n.t('组件库和图标'),
                    content: window.i18n.t('从基础组件、自定义业务组件、图标库中拖拽组件或图标到画布区域进行页面编排组装'),
                    target: '#editPageLeftSideBar'
                },
                {
                    title: window.i18n.t('组件树'),
                    content: window.i18n.t('以全局组件树的形式，快速切换查看页面的所有组件'),
                    target: '#editPageLeftSideBar',
                    entry: () => {
                        // 切换组件树 tab
                        document.body.querySelector('[role="tree-panel-tab"]').click()
                    },
                    leave: () => {
                        // 离开时切换到组件选择 tab
                        document.body.querySelector('[role="component-panel-tab"]').click()
                    }
                },
                {
                    title: window.i18n.t('画布编辑区'),
                    content: window.i18n.t('可在画布自由拖动组件、图标等进行页面布局，选中组件或布局后可右键对选中项进行复制粘贴等快捷操作'),
                    target: '#lesscodeDrawContent'
                },
                {
                    title: window.i18n.t('组件配置'),
                    content: window.i18n.t('在画布中选中对应组件，可在这里进行组件样式、属性、事件及指令的配置'),
                    target: '#modifierPanel',
                    entry: () => {
                        const $componentEl = document.body.querySelector('[role="component-root"]')
                        if ($componentEl) {
                            $componentEl.click()
                        }
                    }
                },
                {
                    title: window.i18n.t('页面操作'),
                    content: window.i18n.t('可以查看并下载完整源码，对页面生命周期、路由、函数等进行配置，以及对内容进行保存、预览、清空等操作'),
                    target: '#toolActionBox'
                },
                {
                    title: window.i18n.t('切换页面'),
                    content: window.i18n.t('点击页面名称可以快速切换页面，新建页面，以及复制已有的页面'),
                    target: '#editPageSwitchPage'
                }
            ]
        },
        methods: {
            /**
             * @desc 显示新手指引
             */
            handleStartGuide () {
                this.$refs.guide.start()
            }
        }
    }
</script>
