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
    <div :class="[$style['code-viewer'], { [$style['fullscreen']]: isFullscreen }]">
        <div :class="$style['toolbar']">
            <div :class="$style['code-type']">
                <div v-for="type in typeList"
                    :key="type"
                    :class="[$style['code-type-item'], { [$style['isActive']]: type === codeType }]"
                    @click="$emit('change-code-type', type)"
                >
                    {{titleMap[type]}}
                </div>
                <span class="seperate-line">|</span>
            </div>
            <div :class="$style['buttons']">
                <span v-if="codeType === 'code'" :class="$style['with-nav']">
                    <bk-switcher :value="withNav" theme="primary" size="small" @change="switchWithNav" style="margin-right: 10px;" />
                    {{ withNav ? $t('不包含导航源码') : $t('包含导航源码') }}
                </span>
                <i v-bk-tooltips="{ boundary: 'window', content: $t('复制{n}',{ n: typeName }) }" :class="['bk-drag-icon', 'bk-drag-copy', $style['icon']]" @click="handleCodeCopy"></i>
                <i v-bk-tooltips="{ boundary: 'window', content: $t('下载{n}',{ n: typeName }) }" :class="['bk-drag-icon', 'bk-drag-download', $style['icon']]" @click="handleDownloadFile"></i>
                <i v-if="codeType === 'json'" v-bk-tooltips="{ boundary: 'window', content: $t('导入JSON') }" :class="['bk-drag-icon', 'bk-drag-upload', $style['icon']]" @click="showEditData"></i>
                <i v-bk-tooltips="{ boundary: 'window', content: $t('全屏') }" :class="['bk-drag-icon', 'bk-drag-full-screen', $style['icon']]" @click="handleScreenfull"></i>
                <i :class="['bk-drag-icon', 'bk-drag-close-line', $style['icon']]" @click="$emit('close')"></i>
            </div>
        </div>
        <div :class="$style['content']">
            <div :class="$style['code-panel']" style="height: 100%">
                <monaco :value.sync="code" :language="renderLang" :show-header="false" :read-only="true" height="100%" :class="$style['monaco-code']" ref="monaco"></monaco>
            </div>
        </div>
    </div>
</template>

<script>
    import screenfull from 'screenfull'
    import monaco from '@/components/monaco'
    import { mapGetters } from 'vuex'

    export default {
        components: {
            monaco
        },
        props: {
            code: {
                type: String,
                default: ''
            },
            typeList: {
                type: Array,
                default: () => (['code', 'json'])
            },
            codeType: {
                type: String,
                default: 'code'
            }
        },
        data () {
            return {
                withNav: true,
                isFullscreen: false,
                titleMap: {
                    json: 'JSON',
                    code: '源码'
                }
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            typeName () {
                return this.codeType === 'json' ? 'JSON' : this.$t('源码')
            },
            filename () {
                const suffix = this.codeType === 'json' ? 'json' : 'vue'
                return `bklesscode-page-${this.pageDetail?.pageCode}.${suffix}`
            },
            renderLang () {
                return this.codeType === 'code' ? 'html' : 'json'
            }
        },
        mounted () {
            this.screenfullChange = () => {
                this.isFullscreen = screenfull.isFullscreen
            }
            if (screenfull.isEnabled) {
                screenfull.on('change', this.screenfullChange)
            }
        },
        destroyed () {
            screenfull.off('change', this.screenfullChange)
        },
        methods: {
            switchWithNav (val) {
                this.withNav = val
                this.$emit('change-with-nav', val)
            },
            showEditData () {
                this.$emit('show-edit-data')
            },
            handleDownloadFile () {
                const downlondEl = document.createElement('a')
                const blob = new Blob([this.code])
                downlondEl.download = this.filename
                downlondEl.href = URL.createObjectURL(blob)
                downlondEl.style.display = 'none'
                document.body.appendChild(downlondEl)
                downlondEl.click()
                document.body.removeChild(downlondEl)
            },
            handleScreenfull () {
                const el = document.querySelector(`.${this.$style['code-viewer']}`)
                if (!screenfull.isEnabled) {
                    this.$bkMessage({
                        message: this.$t('浏览器不支持全屏'),
                        theme: 'error'
                    })
                    return false
                }
                screenfull.request(el)
            },
            handleCodeCopy () {
                const code = this.code
                const el = document.createElement('textarea')
                el.value = code
                el.setAttribute('readonly', '')
                el.style.position = 'absolute'
                el.style.left = '-9999px'
                document.body.appendChild(el)
                const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
                if (selected) {
                    document.getSelection().removeAllRanges()
                    document.getSelection().addRange(selected)
                }
                this.$bkMessage({ theme: 'primary', message: this.$t('复制成功'), delay: 2000, dismissable: false })
            }
        }
    }
</script>

<style lang="postcss" module>
    @import "@/css/mixins/scroller";

    .code-viewer {
        --toolbar-height: 40px;
        height: 100%;
        background: #1A1A1A;
        border-radius: 2px;

        &.fullscreen {
            --toolbar-height: 0px;
            .toolbar {
                display: none;
            }
        }

        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: var(--toolbar-height);
            padding-right: 22px;
            background: #2E2E2E;

            .code-type {
                display: flex;
                align-items: center;
                cursor: pointer;
                .code-type-item {
                    display: flex;
                    align-items: center;
                    height: 40px;
                    padding: 0 24px;
                    color: #8A8F99;
                    font-size: 12px;
                }
                .code-type-item.isActive {
                    background: #1A1A1A;
                    border-top: 3px solid #3A84FF;
                    color: #C4C6CC;
                }
                .seperate-line {
                    height: 20px;
                    color: #45464D;
                }
            }

            .buttons {
                display: flex;
                align-items: center;
                .with-nav {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    margin-right: 30px;
                    color: #979BA5;
                }
                .icon {
                    font-size: 16px;
                    color: #C4C6CC;
                    cursor: pointer;
                    display: inline-block;

                    & + .icon {
                        margin-left: 16px;
                    }

                    &:hover {
                        color: #fff;
                    }
                }
            }

            .without-nav {
                transform: rotateY(180deg);
            }
        }

        .content {
            height: calc(100% - var(--toolbar-height));
            min-height: 400px;
            overflow: auto;
            background: #1e1e1e;
            @mixin scroller #63656E;

            .code-panel {
                white-space: pre;
                .monaco-code {
                    height: 100%;
                }
            }
        }
    }
</style>
