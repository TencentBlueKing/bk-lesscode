<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <section>
        <!-- <auth-button
            :permission="ACTION_PERM"
            auth="develop_app,deploy_app"
            :resource-id="30"
            class="edit-btn"
            theme="primary"
            @click="xxx">
            xxx
        </auth-button> -->

        <h3 class="empty-perms" style="margin-top: 5px;">
            <span class="perms-tip">{{ $t('权限设置仅在应用生产环境生效，若设置多个权限操作需同时拥有所有操作权限才可生效') }}</span>
        </h3>
        <h3 class="empty-perms" v-if="isShowSelectAction">
            <span class="perms-tip">{{ $t('可配置操作权限') }}</span>
            <bk-link theme="primary" icon="bk-icon icon-plus-circle" class="plus-perms-icon" @click="addPerms">{{ $t('绑定权限') }}</bk-link>
        </h3>
        <select-action class="choose-event" v-else
            :selected-actions="renderPerms"
            @select-action="selectAction"
            @clear-action="clearAction">
            <template v-slot:header>
                <h3 class="perms-title">
                    <span class="label mr10">{{ $t('权限操作名称') }}</span>
                </h3>
                <i class="bk-icon icon-close-line panel-minus" @click="delPerms"></i>
            </template>
        </select-action>
    </section>
</template>

<script>
    import LC from '@/element-materials/core'
    import SelectAction from './components/select-action.vue'

    export default {
        name: 'modifier-perms',

        components: {
            SelectAction
        },

        props: {
            custom: Boolean, // 使用自定义的方式使用组件，数据不通过LC管理
            customVal: Array // custom为true时，传入配置数据
        },

        data () {
            return {
                renderPerms: [],
                currentComponentNode: {},
                isShowSelectAction: false
            }
        },

        created () {
            let perms = []
            if (!this.custom) {
                this.currentComponentNode = LC.getActiveNode()
                perms = this.currentComponentNode.renderPerms
            } else {
                perms = this.customVal
            }

            this.renderPerms.splice(0, this.renderPerms.length, ...perms)

            // 兼容老数据展示
            // Object.keys(renderPerms || {}).forEach((key) => {
            //     const renderEvent = renderPerms[key]
            //     if (typeof renderEvent === 'string') {
            //         this.renderEvents[key] = {
            //             enable: true,
            //             methodCode: renderEvent,
            //             params: []
            //         }
            //     } else {
            //         this.renderEvents[key] = renderEvent
            //     }
            // })

            // const updateCallback = _.debounce(() => {
            //     if (jsonSafeStringify(this.renderEvents) === jsonSafeStringify(this.currentComponentNode.renderEvents)) {
            //         return
            //     }
            //     this.renderEvents = _.cloneDeep(this.currentComponentNode.renderEvents)
            // }, 100)

            // LC.addEventListener('mergeRenderEvents', updateCallback)
            // this.$once('hook:beforeDestroy', () => {
            //     LC.removeEventListener('mergeRenderEvents', updateCallback)
            // })
        },

        methods: {
            addPerms () {
                this.isShowSelectAction = true
            },

            delPerms () {
                this.isShowSelectAction = false
            },

            selectAction (actions) {
                const renderPerms = [...actions]
                this.renderPerms.splice(0, this.renderPerms.length, ...renderPerms)
                this.updateTargetData()
            },

            clearAction () {
                this.renderPerms.splice(0, this.renderPerms.length, ...[])
                this.updateTargetData()
            },

            updateTargetData () {
                if (typeof this.currentComponentNode.setRenderPerms === 'function') {
                    this.currentComponentNode.setRenderPerms(this.renderPerms)
                }
                this.$emit('change', this.renderPerms)
            }
        }
    }
</script>

<style lang='postcss' scoped>
    .perms-tip {
        margin: 10px;
        padding: 0;
        font-size: 12px;
        font-weight: normal;
    }
    .empty-perms {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 21px 0 6px;
    }
    .plus-perms-icon {
        ::v-deep .bk-link-text {
            font-size: 12px;
            font-weight: 400;
        }
    }

    .perms-title {
        margin: 4px 0 8px;
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        font-weight: normal;
        color: #63656E;
        word-break: keep-all;
        padding: 0;
    }
    .choose-event {
        margin: 0 10px 0;
        background: #f0f1f5;
        border-radius: 2px;
        padding: 8px;
        &:hover {
            box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 20%);
            .panel-minus {
                display: block;
            }
        }
        .panel-minus {
            position: absolute;
            cursor: pointer;
            right: 10px;
            top: 10px;
            font-size: 12px;
            display: none;
        }
    }
</style>
