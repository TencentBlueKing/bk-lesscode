<template>
    <menu-item
        :item="item"
        v-bk-tooltips="{
            allowHtml: true,
            width: 530,
            distance: 10,
            trigger: 'mouseenter',
            theme: 'light',
            content: `#quickOperationIntro`,
            placement: 'bottom',
            boundary: 'window'
        }">
        <div style="display: none">
            <div id="quickOperationIntro">
                <div class="operation-title">
                    <span class="title-main">{{ $t('快捷键说明') }}</span>
                </div>
                <bk-button @click="operationRollbacker">test</bk-button>
                <ul class="operation-list">
                    <li
                        v-for="(operation, shortcutIndex) in quickOperationList"
                        :key="shortcutIndex"
                        class="operation-item">
                        <span class="operation-keys">
                            <span
                                v-for="(key, keyIndex) in operation.keys"
                                :key="key">
                                <span class="operation-key">{{ key }}</span>
                                <span
                                    v-if="keyIndex !== operation.keys.length - 1"
                                    class="operation-plus">
                                    +
                                </span>
                            </span>
                        </span>
                        <span class="operation-name">{{ operation.name }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </menu-item>
</template>

<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import MenuItem from './menu-item'
    import Dexie from 'dexie'

    const RECORD_TABLE_NAME = 'operationRecord'

    export default {
        components: {
            MenuItem
        },
        data () {
            return {
                item: {
                    icon: window.i18n.t('bk-drag-icon bk-drag-keyboard'),
                    text: window.i18n.t('快捷键'),
                    func: () => {}
                },
                quickOperationList: [
                    { keys: ['Ctrl / Cmd', 'C'], name: window.i18n.t('复制') },
                    { keys: ['Ctrl / Cmd', 'V'], name: window.i18n.t('粘贴') },
                    { keys: ['Ctrl / Cmd', 'X'], name: window.i18n.t('剪切') },
                    { keys: ['Ctrl / Cmd', 'Z'], name: '撤销' },
                    // { keys: ['Ctrl / Cmd', 'Y'], name: '恢复' },
                    // { keys: ['Ctrl / Cmd', 'S'], name: '保存' },
                    { keys: ['Delete / Backspace'], name: window.i18n.t('删除') }
                ]
            }
        },
        created () {
            this.db = new Dexie('historyDatabase')
            console.log('this.db = ', this.db)
            this.db.version(1).stores({
                [RECORD_TABLE_NAME]: '++id,activeComponentId,componentIdList,lastContent,interactiveShowComponentId'
            })

            this.operationRecordClear()

            this.isTimeTravel = false
            this.recordComponentIdList = []
            this.activeComponentId = ''
            this.lastContent = []
            this.interactiveShow = false

            const activeCallbak = (event) => {
                this.activeComponentId = event.target.componentId
            }

            const mountedCallback = () => {
                this.lastContent = LC.getRoot().toJSON().renderSlots.default
            }

            const updateCallback = (event) => {
                if (!LC.__isMounted || this.isTimeTravel) {
                    return
                }

                this.recordComponentIdList.push(event.target.componentId)
                this.operationRecorder()
            }

            const interactiveCallback = (event) => {
                if (event.interactiveShow) {
                    this.interactiveShowComponentId = event.target.componentId
                } else {
                    this.interactiveShowComponentId = ''
                }
            }

            const unloadCallback = () => {
                this.operationRecordClear()
            }

            LC.addEventListener('update', updateCallback)
            LC.addEventListener('active', activeCallbak)
            LC.addEventListener('mounted', mountedCallback)
            LC.addEventListener('toggleInteractive', interactiveCallback)
            LC.addEventListener('unload', unloadCallback)

            this.$once('hook:beforeDestroy', () => {
                this.operationRecordClear()
                LC.removeEventListener('active', activeCallbak)
                LC.removeEventListener('update', updateCallback)
                LC.removeEventListener('mounted', this.mountedCallback)
                LC.removeEventListener('unload', this.unloadCallback)
            })
        },
        mounted () {
            document.body.addEventListener('keydown', this.handleParseOperation)
            this.$once('hook:beforeDestroy', () => {
                document.body.removeEventListener('keydown', this.handleParseOperation)
            })
        },
        methods: {
            /**
             * @desc 解析快捷键
             * @param { Event } Event
             */
            handleParseOperation (event) {
                // 输入框获得焦点画布不响应复制、粘贴、剪切操作
                const isInputFocused = event.target.classList.contains('bk-form-input')
                if (!isInputFocused) {
                    if (event.ctrlKey || event.metaKey) {
                        // 复制（Ctrl + C）
                        if (event.code === 'KeyC') {
                            LC.execCommand('copy')
                        }
                        // 粘贴（Ctrl + V）
                        if (event.code === 'KeyV') {
                            LC.execCommand('paste')
                        }
                        // 剪切（Ctrl + X）
                        if (event.code === 'KeyX') {
                            LC.execCommand('cut')
                        }
                    } else if ([8, 46].includes(event.keyCode)) {
                        LC.execCommand('remove')
                    }
                }

                // 回撤（Ctrl + Z）
                if (event.code === 'KeyZ') {
                    // 有 dialog 弹框遮罩不响应快捷键操作
                    const dialogMaskEl = document.querySelector('[data-bkpop-mask]')
                    if (dialogMaskEl && dialogMaskEl.classList.contains('show-active')) {
                        return
                    }
                    // 画布页面禁用默认 Ctrl + Z 快捷键操作
                    event.preventDefault()
                    this.operationRollbacker()
                }
            },
            // 清空画布操作记录
            operationRecordClear () {
                if (this.db) {
                    this.db.tables.forEach(tableItem => {
                        tableItem.clear()
                    })
                }
            },
            /**
             * @desc 记录画布操作
             */
            operationRecorder: _.debounce(function () {
                this.db[RECORD_TABLE_NAME].add({
                    activeComponentId: this.activeComponentId,
                    componentIdList: this.recordComponentIdList,
                    lastContent: this.lastContent || [],
                    interactiveShowComponentId: this.interactiveShowComponentId
                }).catch((e) => {
                    console.log('Record Error : ')
                    console.dir(e)
                }).finally(() => {
                    this.recordComponentIdList = []
                    this.lastContent = LC.getRoot().toJSON().renderSlots.default
                })
            }, 200),
            /**
             * @desc 操作回滚
             */
            async operationRollbacker () {
                const collection = this.db[RECORD_TABLE_NAME].toCollection()

                const recordCount = await collection.count()
                if (recordCount < 1) {
                    return
                }

                collection.last(data => {
                    try {
                        this.isTimeTravel = true
                        const currentPageActiveNode = LC.getActiveNode()
                        if (currentPageActiveNode && currentPageActiveNode !== data.activeComponentId) {
                            currentPageActiveNode.activeClear()
                        }
                        LC.parseHistory(data.lastContent)
                        // 延迟执行，等页面状态完毕选中组件
                        setTimeout(() => {
                            LC.triggerEventListener('rollback')
                            // 回滚选中的节点
                            const nextActiveNode = LC.getNodeById(data.activeComponentId)
                            if (nextActiveNode) {
                                nextActiveNode.active()
                            }
                            // 回滚交互式组件的选中状态
                            if (data.interactiveShowComponentId) {
                                const interactiveNode = LC.getNodeById(data.interactiveShowComponentId)
                                if (interactiveNode) {
                                    interactiveNode.toggleInteractive(true)
                                }
                            }
                            // 重新渲染受影响的组件
                            data.componentIdList.forEach(componentId => {
                                LC.triggerEventListener('update', {
                                    target: {
                                        componentId
                                    }
                                })
                            })
                        })
                        // 删除记录
                        this.db[RECORD_TABLE_NAME].where('id').equals(data.id).delete()
                    } catch (error) {
                        console.log('Time Traverl Error: ', error)
                    } finally {
                        this.lastContent = LC.getRoot().toJSON().renderSlots.default
                        // 回退需要等待页面状态完毕， 200ms 控制充足的时间
                        setTimeout(() => {
                            this.isTimeTravel = false
                        }, 200)
                    }
                })
            }
        }
    }
</script>

<style lang="postcss">
    #quickOperationIntro {
        height: 230px;
        left: 0;
        top: 60px;
        color: #000;
        cursor: default;
        .operation-title {
            margin: 0;
            padding: 0;
            line-height: 26px;
            font-size: 20px;
            font-weight: normal;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 22px;
            .icon-close {
                position: absolute;
                font-size: 32px;
                right: 6px;
                top: 0;
                color: #979ba5;
                cursor: pointer;
            }
        }
        .operation-item {
            float: left;
            margin: 10px 0;
            line-height: 28px;
            font-size: 12px;
            color: #63656e;
            .operation-keys {
                margin-right: 26px;
                .operation-key {
                    display: inline-block;
                    text-align: center;
                    width: 40px;
                    height: 30px;
                    border: 1pt solid #c4c6cc;
                    border-radius: 2px;
                }
                .operation-plus {
                    display: inline-block;
                    margin: 0 15px;
                }
                >span:first-child .operation-key {
                    width: 80px;
                }
            }
            &:nth-child(odd) {
                margin-right: 50px;
            }
            &:last-child .operation-keys span.operation-key{
                width: 160px;
            }
        }
    }
</style>
