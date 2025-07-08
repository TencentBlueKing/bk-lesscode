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
    <bk-dialog
        v-model="isShowDialog"
        class="apply-permission-dialog"
        :mask-close="false"
        :esc-close="false"
        :width="768">
        <ask-permission
            v-if="isShowDialog"
            :loading="isLoading"
            :permission-list="permissionList"
            :max-height="360" />
        <template #footer>
            <template v-if="!isLoading">
                <bk-button
                    theme="primary"
                    class="mr10"
                    @click="handleApply"
                    v-if="isAppleFlag">
                    {{ applyText }}
                </bk-button>
                <bk-button
                    theme="primary"
                    class="mr10"
                    @click="handleHasApplyed"
                    v-else>
                    {{ appliedText }}
                </bk-button>
            </template>
            <bk-button @click="handleCancle">{{ cancelText }}</bk-button>
        </template>
    </bk-dialog>
</template>
<script>
    import AskPermission from './ask-permission'

    import store from '@/store'

    export default {
        components: {
            AskPermission
        },
        data () {
            return {
                applyText: window.i18n.t('去申请'),
                appliedText: window.i18n.t('已申请'),
                cancelText: window.i18n.t('取消'),
                isLoading: false,
                isShowDialog: false,
                isAppleFlag: true,
                authParams: null,
                authResult: {}
            }
        },
        computed: {
            permissionList () {
                if (this.isLoading) {
                    return []
                }
                if (this.authResult.requiredPermissions) {
                    return this.authResult.requiredPermissions
                }
                return []
            }
        },
        methods: {
            /**
             * @desc 申请资源权限
             */
            async fetchPermission () {
                this.isLoading = true
                try {
                    const resData = await store.dispatch('iam/check', {
                        data: this.authParams
                    })
                    this.hasPermission = resData.pass
                    this.authResult = resData
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            /**
             * @desc 供外部调用，显示权限申请弹框
             */
            show () {
                this.isShowDialog = true
                if (this.authParams && !this.authResult.requiredPermissions) {
                    this.fetchPermission()
                }
            },
            /**
             * @desc 跳转权限中心
             */
            handleApply () {
                window.open(this.authResult.applyUrl, '_blank')
                this.isAppleFlag = false
            },
            /**
             * @desc 权限已申请刷新页面
             */
            handleHasApplyed () {
                this.handleCancle()
                window.location.reload()
            },
            handleCancle () {
                this.isAppleFlag = true
                this.isShowDialog = false
                this.authResult = {}
            }
        }
    }
</script>
