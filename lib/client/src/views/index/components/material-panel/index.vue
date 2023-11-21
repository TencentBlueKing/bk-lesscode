<template>
    <div
        id="editPageLeftSideBar"
        class="draw-page-material-panel">
        <select-panel
            :value="activePanel"
            class="panel-list"
            @change="handlePanelChange"
        />
        <div class="panel-content">
            <component :is="panelCom" />
            <panel-ai
                v-show="isAiAvailable && isShowAi"
                :is-show-ai="isShowAi"
                @close="handleCloseAi"
            />
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import SelectPanel from './components/select-panel'
    import PanelComponent from './components/panel-component'
    import PanelFormEngine from './components/panel-form-engine'
    import PanelTemplate from './components/panel-template'
    import PanelIcon from './components/panel-icon'
    import PanelTree from './components/panel-tree'
    import PanelAi from './components/panel-ai'

    export default {
        name: '',
        components: {
            SelectPanel,
            PanelComponent,
            PanelFormEngine,
            PanelTemplate,
            PanelIcon,
            PanelTree,
            PanelAi
        },
        data () {
            return {
                isCollapse: false,
                isShowAi: false,
                activePanel: 'component'
            }
        },
        computed: {
            ...mapGetters('ai', ['isAiAvailable']),

            panelCom () {
                const comMap = {
                    component: PanelComponent,
                    template: PanelTemplate,
                    formEngine: PanelFormEngine,
                    icon: PanelIcon,
                    tree: PanelTree
                }
                return comMap[this.activePanel]
            }
        },
        methods: {
            /**
             * @desc 切换面板
             * @param { String } panel
             */
            handlePanelChange (panel) {
                if (panel === 'BK-GPT') {
                    this.isShowAi = !this.isShowAi
                } else {
                    this.activePanel = panel
                }
            },

            handleCloseAi () {
                this.isShowAi = false
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .draw-page-material-panel {
        display: flex;
        position: relative;
        height: 100%;
        
        .panel-list{
            flex: 0 0 42px;
            height: 100%;
        }
        .panel-content{
            flex: 0 0 calc(100% - 42px);
            max-width: calc(100% - 42px);
        }
    }
</style>
