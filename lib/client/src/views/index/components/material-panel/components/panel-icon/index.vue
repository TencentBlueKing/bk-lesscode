<template>
    <div class="panel-component">
        <select-tab
            v-if="!isExternal"
            :tab-list="tabList"
            :current="tab"
            :change-tab="handleChangeTab"
        >
        </select-tab>
        <div class="drag-component-list">
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
                        name: 'Icon Cool图标'
                    },
                    {
                        key: 'offcialIcon',
                        name: '蓝鲸官方图标'
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
    @import "@/css/mixins/scroller";

    .panel-component{
        height: 100%;
        .category-tabs {
            display: flex;
            height: 42px;
            user-select: none;

            .tab-item {
                display: flex;
                justify-content: center;
                /* align-items: center; */
                height: 42px;
                line-height: 42px;
                background: #F5F7FA;
                flex: 1 1;
                font-size: 12px;
                padding: 0 10px;
                white-space: nowrap;
                cursor: pointer;
                user-select: none;
                &:hover {
                    color: #3A84FF;
                    /* background: #FFF; */
                }
                &:first-child{
                    margin-right: auto;
                }
                &.active {
                    color: #3A84FF;
                    background: #FFF;
                    border-bottom: 2px solid #3A84FF;
                }
                .tab-item-label {
                    font-size: 12px;
                    @mixin ellipsis 110px;
                }
                .toggle-icon {
                    line-height: 42px;
                    overflow: hidden;
                    display: inline-block;
                }
            }
        }
        .search-box{
            padding: 6px 12px;
        }
        .drag-component-list{
            height: calc(100% - 42px);
            padding-bottom: 10px;
            overflow-y: auto;
            @mixin scroller;
        }
    }
</style>
