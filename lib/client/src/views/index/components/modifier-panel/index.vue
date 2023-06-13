<template>
    <div
        id="modifierPanel"
        class="draw-page-modifier-panel">
        <div class="draw-page-modifier-panel-inner">
            <div
                v-if="componentId"
                class="component-info">
                <div
                    class="component-id"
                    v-bk-overflow-tips>
                    {{ componentId || '--' }}
                </div>
                <div class="action-wrapper">
                    <i
                        class="bk-drag-icon bk-drag-delet mr5"
                        id="del-component-right-sidebar"
                        @click="handleRemoveElement"
                        v-bk-tooltips="$t('删除')" />
                    <i
                        v-if="!isAttachToForm"
                        class="bk-drag-icon bk-drag-copy mr5"
                        @click="handleCopyCompId"
                        v-bk-tooltips="$t('复制id')" />
                    <i class="bk-drag-icon"
                        v-show="componentData.isInteractiveComponent"
                        :class="componentData.interactiveShow ? 'bk-drag-visible-eye' : 'bk-drag-invisible-eye'"
                        @click="handleToggleInteractiveShow"
                        v-bk-tooltips="componentData.interactiveShow ? $t('隐藏') : $t('显示')" />
                </div>
            </div>
            <material-modifier />
            <a
                v-if="componentDocument"
                class="link-prop-doc"
                :href="componentDocument"
                target="_blank">
                <i class="bk-drag-icon bk-drag-jump-link"></i>
                <span>{{ $t('查看详细属性文档') }}</span>
            </a>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import MaterialModifier from '@/element-materials/modifier'
    import { execCopy } from '@/common/util'

    export default {
        name: '',
        components: {
            MaterialModifier
        },
        data () {
            return {
                componentId: '',
                componentDocument: '',
                isAttachToForm: false
            }
        },
        created () {
            this.componentData = {}

            const toggleInteractiveCallback = _.throttle((event) => {
                if (this.componentId
                    && event.target.componentId === this.componentId) {
                    this.$forceUpdate()
                }
            }, 100)

            const activeCallback = ({ target }) => {
                this.componentData = target
                this.componentId = target.componentId
                this.componentDocument = target.material.document || ''
                this.checkAttachToFrom()
            }

            const activeClearCallback = () => {
                this.componentData = {}
                this.componentId = ''
                this.componentDocument = ''
                this.isAttachToForm = false
            }

            LC.addEventListener('active', activeCallback)
            LC.addEventListener('activeClear', activeClearCallback)
            LC.addEventListener('toggleInteractive', toggleInteractiveCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('active', activeCallback)
                LC.removeEventListener('activeClear', activeClearCallback)
                LC.removeEventListener('toggleInteractive', toggleInteractiveCallback)
            })
        },
        methods: {
            /**
             * @desc 检测选中的组件是否是 from 的子组件
             */
            checkAttachToFrom () {
                this.isAttachToForm = false
                let parentNode = this.componentData.parentNode
                while (parentNode) {
                    if (parentNode.type === 'widget-form') {
                        this.isAttachToForm = true
                    }
                    parentNode = parentNode.parentNode
                }
            },
            /**
             * @desc 显示删除选中的元素弹框
             */
            handleRemoveElement () {
                LC.execCommand('remove')
            },
            /**
             * @desc 切换交互组件显示状态
             */
            handleToggleInteractiveShow () {
                this.componentData.toggleInteractive()
            },
            /**
             * @desc 复制组件id
             */
            handleCopyCompId () {
                execCopy(this.componentData?.componentId)
            }
        }
    }
</script>
<style lang="postcss">
    .draw-page-modifier-panel {
        .bk-select.medium-font {
            font-size: 12px !important;
            --font-size: 12px !important;
        }
    }
</style>
<style lang="postcss" scoped>
    .draw-page-modifier-panel {
        position: relative;
        height: 100%;

        .draw-page-modifier-panel-inner {
            height: 100%;
        }

        .component-info {
            display: flex;
            align-items: center;
            height: 42px;
            padding: 0 20px;
            justify-content: center;
            border-bottom: 1px solid #dcdee5;

            .component-id {
                overflow: hidden;
                max-width: 230px;
                margin-right: 10px;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .action-wrapper {
                display: flex;
                i {
                    cursor: pointer;
                    &:hover {
                    color: #3a84ff;
                }
                }
            }

        }

        .link-prop-doc{
            margin: 10px 0 0 10px;
            color: #3a84ff;
            cursor: pointer;
            display: inline-block;
            font-size: 12px;
        }
        .active-empty{
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>
