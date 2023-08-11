<template>
    <div class="panel-component">
        <select-tab
            v-if="!isExternal"
            :tab-list="tabList"
            :current="tab"
            :change-tab="handleChangeTab"
        >
        </select-tab>
        <div :class="isExternal ? 'only-official-icon' : 'drag-component-list' ">
            <component :is="com" :icon-type="tab" />
        </div>
    </div>
</template>
<script>
    import SelectTab from '../common/select-tab'
    import RenderProjectIcon from './components/render-project-icon'
    import RenderOffcialIcon from './components/render-offcial-icon'
    import { mapGetters, mapState } from 'vuex'

    export default {
        name: '',
        components: {
            SelectTab
        },
        data () {
            return {
                tab: 'projectIcon',
                tabList: [
                    {
                        key: 'projectIcon',
                        name: window.i18n.t('Icon Cool图标')
                    },
                    {
                        key: 'offcialIcon',
                        name: window.i18n.t('蓝鲸官方图标')
                    }
                ]
            }
        },
        computed: {
            ...mapState(['isExternal']),
            ...mapState('iconManage', ['iconList']),
            ...mapGetters('page', ['platform']),
            com () {
                const comMap = {
                    projectIcon: RenderProjectIcon,
                    offcialIcon: RenderOffcialIcon
                }
                return comMap[this.tab]
            }
        },
        created () {
            const hasProjectIcon = this.iconList?.length > 0
            this.tab = (this.isExternal || !hasProjectIcon) ? 'offcialIcon' : 'projectIcon'
        },
        methods: {
            handleChangeTab (tab) {
                this.tab = tab
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .panel-component {
        height: 100%;
        .search-box {
            padding: 6px 12px;
        }
        .drag-component-list {
            height: calc(100% - 42px);
            padding-bottom: 10px;
        }
        .only-official-icon {
            height: 100%;
        }
    }
</style>
