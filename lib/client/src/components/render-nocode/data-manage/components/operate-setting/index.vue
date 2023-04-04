<template>
    <div class="operate-setting">
        <template v-if="selectedComp.data.id">
            <div class="comp-header">
                <span class="id">{{ selectedComp.data.id }}</span>
                <i class="bk-icon icon-delete" v-bk-tooltips="$t('删除')" @click="handleDelete"></i>
            </div>
            <div class="tabs-wrapper">
                <bk-tab :active.sync="activePanel" :label-height="24">
                    <bk-tab-panel v-for="panel in panels" :key="panel.name" :name="panel.name" :label="panel.label">
                    </bk-tab-panel>
                </bk-tab>
            </div>
            <div class="setting-container">
                <component :is="settingComp"></component>
            </div>
        </template>
        <div v-else class="empty-tips">{{ $t('请选择组件') }}</div>
    </div>
</template>
<script>
    import { mapState, mapMutations } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import Events from './events'
    import Perms from './perms'
    import Properties from './properties'

    export default {
        name: 'OperateSetting',
        data () {
            return {
                panels: [
                    { name: 'properties', label: this.$t('属性') },
                    { name: 'events', label: this.$t('事件') },
                    { name: 'perms', label: this.$t('权限') }
                ],
                compMap: {
                    events: Events,
                    perms: Perms,
                    properties: Properties
                },
                activePanel: 'properties'
            }
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            settingComp () {
                const active = this.activePanel || 'properties'
                return this.compMap[active]
            }
        },
        watch: {
            'selectedComp.data.id' () {
                this.activePanel = this.panels[0].name
            }
        },
        methods: {
            ...mapMutations('nocode/dataManage', ['setPageConfig']),
            handleDelete () {
                console.log(this.selectedComp)
                const pageConfig = cloneDeep(this.pageConfig)
                const compsConfig = this.activeNode ? pageConfig[this.activeNode] : pageConfig
                const comps = compsConfig[this.selectedComp.type].filter(item => item.id !== this.selectedComp.data.id)
                compsConfig[this.selectedComp.type] = comps
                this.setPageConfig(pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .operate-setting {
        height: 100%;
    }
    .comp-header {
        display: flex;
        align-items: center;
        padding-right: 20px;
        height: 42px;
        line-height: 42px;
        border-bottom: 1px solid #eaebf0;
        text-align: center;
        .id {
            padding: 0 10px;
            width: 239px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .icon-delete {
            flex: 1;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
    .tabs-wrapper {
        margin: 10px 0;
        padding: 0 12px;
    }
    .bk-tab {
        padding: 4px;
        background: #f0f1f5;
        border-radius: 2px;
        >>> .bk-tab-section {
            display: none;
        }
        >>> .bk-tab-header {
            background: #f0f1f5;
            background-image: none !important;
            border: none;
            .bk-tab-label {
                font-size: 12px;
            }
            .bk-tab-label-item {
                border: none !important;
            }
        }
        >>>.bk-tab-label-wrapper {
            .bk-tab-scroll-controller {
                height: 33px !important;
                background: #f5f7fa;
                color: #979ba5;
                &:hover {
                    background: #eaebf0;
                    color: #63656e;
                }
            }
            .bk-tab-label-item {
                min-width: unset;
                &.active {
                    color: #64656e;
                }
            }
        }
    }
    .setting-container {
        height: calc(100% - 94px);
        overflow: auto;
    }
    .empty-tips {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
</style>
