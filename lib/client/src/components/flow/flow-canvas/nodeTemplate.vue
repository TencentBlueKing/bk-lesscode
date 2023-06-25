<template>
    <div
        v-bk-clickoutside="closeShortcutPanel"
        :class="['process-node-item', { 'configured': !isDraft }]"
        @mousedown="onMousedown"
        @contextmenu.prevent="handleContextMenuClick">
        <!-- 开始节点 -->
        <div v-if="node.type === 'START'" class="start-node"><div class="text">{{ $t('开始') }}</div></div>
        <!-- 结束节点 -->
        <div v-else-if="node.type === 'END'" class="end-node"><div class="text">{{ $t('结束') }}</div></div>
        <!-- 并行网关 -->
        <div v-else-if="node.type === 'ROUTER-P'" class="gateway-node">
            <i class="bk-drag-icon bk-drag-parallel"></i>
        </div>
        <!-- 汇聚网关 -->
        <div v-else-if="node.type === 'COVERAGE'" class="gateway-node">
            <i class="bk-drag-icon bk-drag-converge"></i>
        </div>
        <!-- 普通流转节点 -->
        <div v-else :class="['flow-node', node.nodeInfo && node.nodeInfo.status]">
            <div class="node-icon-area">
                <i :class="['bk-drag-icon', nodeTypeList.find(item => item.type === node.type).icon]"></i>
            </div>
            <div class="node-name-area" :title="node.name">
                <div :class="['name-wrapper', { 'has-label': hasCreatedPage }]">
                    <span class="name">{{ node.name }}</span>
                    <span v-if="hasCreatedPage" class="create-ticket-page-icon">
                        <i
                            class="bk-drag-icon bk-drag-page"
                            v-bk-tooltips.top="{
                                allowHtml: true,
                                content: '#create-ticket-page-tips',
                                maxWidth: 400
                            }"
                            @click="$emit('preview')">
                        </i>
                        <div id="create-ticket-page-tips">
                            <span>{{ $t('已生成流程提单页') }}</span>
                            <bk-button style="padding: 0" size="small" :text="true" @click="$emit('preview')">{{ $t('预览') }}</bk-button>
                        </div>
                    </span>
                    <span v-if="node.nodeInfo && node.nodeInfo.extras.data_source_id" class="system-add-icon">{{ $t('系统') }}</span>
                </div>
                <p class="desc">
                    <span v-if="isDraft" style="color: #c4c6cc;">
                        {{ $t('点击配置') }} </span>
                    <template v-else>
                        <span v-if="node.type === 'NORMAL'">{{ $t('处理人:') }}{{ getProcessorName() }}</span>
                        <span v-else-if="node.type === 'APPROVAL'">{{$t('类型:') }} {{ approvalType }} {{ $t('处理人:') }} {{ getProcessorName() }}</span>
                        <span v-else-if="node.type === 'DATA_PROC'">
                            {{$t('目标表:')}}{{ (node.nodeInfo && node.nodeInfo.extras.dataManager && node.nodeInfo.extras.dataManager.tableName) || '--' }}
                        </span>
                        <span v-else-if="node.type === 'TASK'">
                            API：{{ (node.nodeInfo && node.nodeInfo.extras.api_info && node.nodeInfo.extras.api_info.url) || '--' }}
                        </span>
                    </template>
                </p>
                <i v-if="!single" class="bk-drag-icon bk-drag-edit node-edit-icon" @click.stop="handleNodeClick"></i>
            </div>
        </div>
        <i
            v-if="editable && !(node.nodeInfo && node.nodeInfo.is_builtin)"
            class="bk-icon icon-close node-delete-icon"
            @click.stop="$emit('delete', node)">
        </i>
        <!-- 更多操作 -->
        <div class="shortcut-panel" v-if="shortcutPanelShow && node.type !== 'START' && node.type !== 'END'">
            <ul class="node-list">
                <li
                    v-for="type in shortcutNodes"
                    :key="type"
                    :class="{ 'gataway-type': ['ROUTER-P', 'COVERAGE'].includes(type) }"
                    @click.stop="$emit('fastCreateNode', node.nodeInfo.id, type)">
                    <i :class="['bk-drag-icon', nodeTypeList.find(item => item.type === type).menuIcon]"></i>
                </li>
            </ul>
            <div class="action-area">
                <span
                    :class="['action-item', { disabled: ['ROUTER-P', 'COVERAGE'].includes(node.type) }]"
                    @click.stop="$emit('onNodeClick', node)">
                    {{ $t('配置') }} </span>
                <span class="action-item" @click.stop="$emit('cloneNode', node.nodeInfo.id)">{{ $t('复制') }}</span>
                <span
                    :class="['action-item', { disabled: node.nodeInfo && node.nodeInfo.is_builtin }]"
                    @click.stop="handleDeleteNode">
                    {{ $t('删除') }} </span>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import { NODE_TYPE_LIST } from '../constants/nodes.js'
    import { PROCESSORS } from '../constants/processor.js'

    export default {
        name: 'NodeTemplate',
        props: {
            node: {
                type: Object,
                default () {
                    return {}
                }
            },
            editable: {
                type: Boolean,
                default: true
            },
            single: {
                type: Boolean,
                default: false
            },
            canvasData: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                moveFlag: {
                    x: 0,
                    y: 0
                },
                hideNodeGuide: false,
                shortcutPanelShow: false,
                nodeTypeList: NODE_TYPE_LIST,
                shortcutNodes: ['NORMAL', 'DATA_PROC', 'APPROVAL', 'COVERAGE', 'ROUTER-P']
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            isDraft () {
                return !this.node.nodeInfo || this.node.nodeInfo.is_draft
            },
            hasCreatedPage () {
                return this.flowConfig.pageId && this.node.nodeInfo?.is_first_state && this.node.nodeInfo?.type === 'NORMAL'
            },
            approvalType () {
                if (this.node.nodeInfo) {
                    if (this.node.nodeInfo.is_multi) {
                        return this.node.nodeInfo.is_sequential ? this.$t('顺序会签') : this.$t('随机会签')
                    }
                    return this.$t('或签')
                }
                return '--'
            }
        },
        created () {
            this.hideNodeGuide = JSON.parse(localStorage.getItem('hideNodeGuide'))
        },

        methods: {
            getProcessorName (node) {
                if (this.node.nodeInfo?.processors_type && ['OPEN', 'STARTER', 'STARTER_LEADER'].includes(this.node.nodeInfo.processors_type)) {
                    return PROCESSORS[this.node.nodeInfo.processors_type]
                }
                return this.node.nodeInfo?.processors || '--'
            },
            onMousedown (e) {
                this.moveFlag = { x: e.pageX, y: e.pageY }
            },
            handleNodeClick (e) {
                const moveBuffer = 2
                const { pageX: x, pageY: y } = e
                if (Math.abs(x - this.moveFlag.x) < moveBuffer && Math.abs(y - this.moveFlag.y) < moveBuffer) {
                    this.$emit('onNodeClick', this.node)
                }
            },
            // 鼠标右键单击
            handleContextMenuClick () {
                if (this.editable) {
                    this.shortcutPanelShow = true
                }
            },
            closeShortcutPanel () {
                this.shortcutPanelShow = false
            },
            // 删除节点
            handleDeleteNode () {
                // 内置节点不可删除
                if (this.node.nodeInfo && this.node.nodeInfo.is_builtin) {
                    return
                }
                this.$emit('delete', this.node)
            },
            // 隐藏节点操作提示
            closeNodeGuide () {
                this.hideNodeGuide = true
                localStorage.setItem('hideNodeGuide', true)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.process-node-item {
  position: relative;
  &.configured {
    .node-icon-area {
      background: #3a84ff;
    }
  }
  &:hover {
    .node-delete-icon {
      display: block;
    }
  }
}
.start-node,
.end-node,
.gateway-node {
  padding: 8px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: #63656e;
  background-color: #ffffff;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2);
  .text {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background: #e6e7eb;
    font-size: 12px;
    font-weight: bold;
    color: #979ba5;
    border-radius: 50%;
  }
  & > i {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 25px;
    color: #737987;
    transform: translate(-50%, -50%);
  }
}
.flow-node {
  position: relative;
  display: flex;
  align-items: center;
  width: 236px;
  height: 46px;
  color: #63656e;
  font-size: 14px;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.20);
  overflow: hidden;
  &:hover {
    outline: 1px solid #3a84ff;
    .node-edit-icon {
      display: block;
    }
  }
  .node-icon-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 100%;
    font-size: 18px;
    color: #fff;
    background-color: #c4c6cc;
  }
}
.node-name-area {
    position: relative;
    width: 190px;
    padding: 6px 16px;
    height: 100%;
    background: #ffffff;
    font-size: 12px;
    text-align: left;
  .name-wrapper {
        display: flex;
        align-items: center;
        color: #63656e;
        font-weight: bold;
        height: 18px;
        line-height: 18px;
        .name {
            max-width: calc(100% - 50px);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .create-ticket-page-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 4px;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            font-size: 12px;
            background: #e1ecff;
            color: #3d81fe;
            opacity: 0.9;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
        .system-add-icon {
            padding: 0 4px;
            line-height: 16px;
            font-size: 12px;
            font-weight: normal;
            background: #f0f1f5;
            border: 1px solid rgba(151, 155, 165, 0.3);
            border-radius: 2px;
            transform: scale(0.83);
        }
  }
  .desc {
        color: #979ba5;
        height: 16px;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
  }
}
.node-edit-icon {
  display: none;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 26px;
  cursor: pointer;
  &:hover {
    color: #3a84ff;
  }
}
.node-delete-icon {
  position: absolute;
  top: -8px;
  right: -4px;
  display: none;
  width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 50%;
  background-color: #d8d8d8;
  color: #fff;
  font-size: 18px;
  text-align: center;
  z-index: 2;
  cursor: pointer;
  &:hover {
    background-color: #979ba5;
  }
}
.shortcut-panel {
  position: absolute;
  top: 30px;
  right: -178px;
  width: 180px;
  background-color: #fff;
  border: 1px solid #dde4eb;
  box-shadow: 0px 2px 4px 0px rgba(218, 218, 218, 0.5);
  border-radius: 2px;
  z-index: 103;
  cursor: initial;
  .node-list {
    overflow: hidden;
    & > li {
      float: left;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 25%;
      height: 42px;
      &.gataway-type {
        i {
          font-size: 28px;
        }
      }
      i {
        color: #737987;
        font-size: 24px;
        cursor: pointer;
        &:hover {
          color: #3a84ff;
        }
      }
    }
  }
  .action-area {
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #63656e;
    height: 28px;
    font-size: 12px;
    border-top: 1px solid #e9edf1;
    .action-item {
      color: #63656e;
      cursor: pointer;
      &.disabled {
        color: #c6cfd9;
        cursor: not-allowed;
      }
      &:hover {
        color: #3a84ff;
      }
    }
  }
}
</style>
