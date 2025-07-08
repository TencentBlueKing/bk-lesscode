<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2025 Tencent. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <div class="apply-permission-page-container">
        <div class="wraper">
            <div class="apply-permission-page">
                <div class="page-main">
                    <ask-permission :permission-list="authResult.requiredPermissions" />
                    <div class="footer">
                        <bk-button
                            v-if="isAppleFlag"
                            theme="primary"
                            class="mr10"
                            @click="handleApply">
                            {{ applyText }}
                        </bk-button>
                        <bk-button
                            v-else
                            theme="primary"
                            @click="handleReload">
                            {{ appliedText }}
                        </bk-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import AskPermission from './ask-permission'

    export default {
        name: 'ApplyPage',
        components: {
            AskPermission
        },
        props: {
            authResult: {
                type: Object,
                default: () => ({}),
                required: true
            }
        },
        data () {
            return {
                applyText: window.i18n?.t('去申请')  || '去申请',
                appliedText: window.i18n?.t('已申请') || '已申请',
                isAppleFlag: true
            }
        },
        methods: {
            /**
             * @desc 跳转权限中心
             */
            handleApply () {
                window.open(this.authResult.applyUrl, '_blank')
                this.isAppleFlag = false
            },
            /**
             * @desc 已申请刷新页面
             */
            handleReload () {
                location.reload()
            }
        }
    }
</script>
<style lang='postcss' scoped>
    .apply-permission-page-container {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        min-height: calc(100vh - 120px);
        padding-top: 100px;
        .apply-permission-page {
            .page-main {
                width: 768px;
                padding: 24px;
                margin: 60px auto;
                background-color: #fff;
                border-radius: 2px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
            }

            .footer {
                margin: 24px auto 6px;
                text-align: center;
            }
        }
    }
</style>
