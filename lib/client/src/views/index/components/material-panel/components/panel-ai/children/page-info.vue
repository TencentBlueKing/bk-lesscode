<template>
    <section
        ref="html"
        class="page-info-wrapper"
        v-bk-clickoutside="handleClickOutside"
    >
        <h5 class="resource-title">{{ $t('组件') }}</h5>
        <bk-big-tree
            ref="tree"
            ext-cls="component-tree"
            :selectable="true"
            :expand-on-click="false"
            @select-change="(node) => handleNodeSelect(node.id)"
            @expand-change="() => handleUpdateTree()"
        >
            <div slot-scope="{ data: nodeData }">
                <div class="component-tree-node-item">
                    <i
                        class="bk-drag-icon tree-node-item"
                        :class="nodeData.payload.componentData.material.icon"
                    />
                    <span>
                        {{ nodeData.name }}
                    </span>
                </div>
            </div>
        </bk-big-tree>

        <template
            v-for="resourceGroup in resourceGroups"
        >
            <h5
                class="resource-title"
                :key="resourceGroup.name"
            >{{ resourceGroup.name }}</h5>
            <span
                v-for="resource in resourceGroup.children"
                :key="resource.id + resourceGroup.name"
                class="resource-name"
                @click="handleNodeSelect(resource.id)"
            >{{ resource.name }}</span>
            <bk-exception
                v-if="resourceGroup.children.length <= 0"
                :key="resourceGroup.name"
                class="exception-wrap-item exception-part"
                type="empty"
                scene="part"
            />
        </template>
    </section>
</template>

<script>
    import Tippy from 'bk-magic-vue/lib/utils/tippy'

    import LC from '@/element-materials/core'

    import { getNodeWithClass } from '@/common/util'
    import store from '@/store'

    const getDataFromNodeTree = tree => {
        if (!tree) {
            return []
        }

        return tree.map(node => Object.freeze({
            id: node.componentId,
            name: node.componentId,
            children: getDataFromNodeTree(node.children),
            payload: {
                componentData: node
            }
        }))
    }

    export default {
        props: {
            isShow: Boolean
        },

        data () {
            return {
                popperInstance: null
            }
        },

        computed: {
            resourceGroups () {
                return [
                    {
                        name: this.$t('函数'),
                        children: store.getters['functions/functionList'].map(item => ({
                            id: item.funcCode,
                            name: item.funcCode
                        }))
                    },
                    {
                        name: this.$t('变量'),
                        children: store.getters['variable/variableList'].map(item => ({
                            id: item.variableCode,
                            name: item.variableCode
                        }))
                    },
                    {
                        name: this.$t('数据表'),
                        children: (store.state?.dataSource?.tableList || []).map(item => ({
                            id: item.tableName,
                            name: item.tableName
                        }))
                    }
                ]
            }
        },

        watch: {
            isShow (value) {
                if (value) {
                    this.show()
                } else {
                    this.hide()
                }
            }
        },

        methods: {
            handleNodeSelect (val) {
                this.$emit('choose', val)
                this.$emit('update:isShow', false)
            },

            handleClickOutside (event) {
                const pageNode = getNodeWithClass(event.target, '.page-info-wrapper')
                if (!pageNode.classList.contains('.page-info-wrapper')) {
                    this.$emit('update:isShow', false)
                }
            },

            handleUpdateTree () {
                this.popperInstance.popperInstance.update()
            },

            handleBuildTree () {
                // build tree
                const data = getDataFromNodeTree(LC.getRoot().children)
                this.$refs.tree.setData(data)
            },

            handleBuildTippy () {
                // build tippy
                this.popperInstance = Tippy('.send-prompt-container', {
                    placement: 'top-start',
                    trigger: 'manual',
                    theme: 'light page-info-tippy',
                    hideOnClick: false,
                    animateFill: false,
                    animation: 'slide-toggle',
                    lazy: false,
                    ignoreAttributes: true,
                    distance: 20,
                    arrow: true,
                    appendTo () {
                        return document.querySelector('.send-prompt-container')
                    },
                    zIndex: window.__bk_zIndex_manager.nextZIndex()
                })[0]
                this.popperInstance.setContent(this.$refs.html)
                this.popperInstance.popperInstance.update()
                this.popperInstance.show()
            },

            show () {
                this.handleBuildTree()
                this.handleBuildTippy()
            },

            hide () {
                if (this.popperInstance) {
                    this.popperInstance.hide()
                    this.popperInstance.destroy()
                    this.popperInstance = null
                    this.$refs.tree.setSelected()
                }
            }
        }
    }
</script>

<style lang="postcss">
@import "@/css/mixins/scroller";

.tippy-popper:has(.page-info-tippy-theme) {
  pointer-events: visible;
  width: 100%;
  .tippy-tooltip {
    padding: 0;
  }
}
.page-info-wrapper {
  @mixin scroller;
  max-height: 500px;
  overflow-y: auto;
  font-size: 12px;
  padding: .3rem .6rem;
  .component-tree-node-item {
    font-size: 12px;
  }
  .resource-title {
    font-size: 12px;
    margin: 0;
    padding: 0 12px;
    color: #979ba5;
    line-height: 32px;
    font-weight: normal;
  }
  .resource-name {
    line-height: 32px;
    display: block;
    cursor: pointer;
    padding: 0 12px 0 24px;
    &:hover {
      background-color: #f1f7ff;
    }
  }
}
</style>
