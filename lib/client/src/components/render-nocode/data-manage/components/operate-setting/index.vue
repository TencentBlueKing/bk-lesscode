<template>
    <div class="operate-setting">
        <template v-if="selectedComp.data.id">
            <div class="comp-header">
                <span class="id">{{ selectedComp.data.id }}</span>
                <i class="bk-icon icon-delete"></i>
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
        <div v-else class="empty-tips">请选择组件</div>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import Events from './events'
    import Perms from './perms'
    import Properties from './properties'

    export default {
        name: 'OperateSetting',
        data () {
            return {
                panels: [
                    { name: 'properties', label: '属性' },
                    { name: 'events', label: '事件' },
                    { name: 'perms', label: '权限' }
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
            ...mapState('nocode/dataManage', ['selectedComp']),
            settingComp () {
                const active = this.activePanel || 'properties'
                return this.compMap[active]
            }
        },
        watch: {
            'selectedComp.data.id' () {
                this.activePanel = this.panels[0].name
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .operate-setting {
        height: 100%;
    }
    .comp-header {
        height: 42px;
        line-height: 42px;
        border-bottom: 1px solid #eaebf0;
        text-align: center;
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
