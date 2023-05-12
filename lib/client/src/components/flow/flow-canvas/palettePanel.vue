<template>
    <ul class="palette-panel">
        <li v-for="node in nodeTypeList" v-bk-tooltips.right="node.name" :key="node.type">
            <div v-if="node.type === 'START'" class="start-node" data-type="START">
                <span>{{ $t('开始') }}</span>
            </div>
            <div v-else-if="node.type === 'END'" class="end-node" data-type="END">
                <span>{{ $t('结束') }}</span>
            </div>
            <div
                v-else
                :class="['entry-item', { 'gateway-node': ['ROUTER-P', 'COVERAGE'].includes(node.type) }]"
                :data-type="node.type">
                <i :class="['bk-drag-icon', node.menuIcon]"></i>
            </div>
        </li>
    </ul>
</template>
<script>
    import { NODE_TYPE_LIST } from '../constants/nodes.js'

    export default {
        name: 'PalettePanel',
        data () {
            return {
                nodeTypeList: NODE_TYPE_LIST
            }
        }
    }
</script>
<style lang="postcss" scoped>
.palette-panel {
  margin: 0;
  padding: 0;
  list-style: none;
  & > li {
    position: relative;
    text-align: center;
  }
  .start-node,
  .end-node {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 12px 0;
    width: 21px;
    height: 21px;
    border: 2px solid #979ba5;
    border-radius: 50%;
    user-select: none;
    cursor: not-allowed;
    & > span {
      display: block;
      font-size: 12px;
      color: #979ba5;
      transform: scale(0.5);
      white-space: nowrap;
    }
  }
  .entry-item {
    display: inline-block;
    padding: 12px 0;
    width: 100%;
    color: #979ba5;
    user-select: none;
    cursor: move;
    &:hover {
      background: #e1ecff;
      color: #3a84ff;
    }
    i {
      font-size: 20px;
    }
  }
}
</style>
