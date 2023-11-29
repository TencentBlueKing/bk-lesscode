<template>
    <bk-popover
        ref="popover"
        placement="bottom"
        theme="light"
        ext-cls="g-popover-empty-padding"
        :on-show="handleShow"
        :tippy-options="{
            trigger: 'manual',
            arrow: false,
            appendTo: 'parent'
        }"
    >
        <section
            :style="{
                '--text-height': textHeight + 'px'
            }"
        >
            <bk-input
                ref="inputRef"
                :placeholder="$t('您可以键入 “/” 查看更多Prompt')"
                type="textarea"
                row="1"
                class="send-prompt"
                :native-attributes="{ autofocus: 'autofocus' }"
                :value="value"
                @change="handleChangePrompt"
                @keydown="handleKeyDown"
            >
            </bk-input>
        </section>
        <div slot="content">
            <section
                v-bkloading="{ isLoading }"
                class="prompt-list g-scrollbar"
            >
                <bk-input
                    v-model="search"
                    behavior="simplicity"
                    class="input-search"
                >
                </bk-input>
                <section
                    class="search-group"
                >
                    <span
                        v-bk-tooltips="{
                            content: prompt.prompt,
                            placement: 'right',
                            theme: 'light',
                            width: 300,
                            zIndex: 9999999,
                            extCls: 'prompt-tips'
                        }"
                        v-for="prompt in prompts"
                        :key="prompt.id"
                        class="group-prompt g-flex-row"
                        @click="handleChoosePrompt(prompt.prompt)"
                    >
                        <span
                            class="prompt-content g-ellipsis"
                        >{{ prompt.prompt }}</span>
                    </span>
                    <bk-exception class="exception-wrap-item exception-part" type="search-empty" scene="part" v-if="!prompts.length"> </bk-exception>
                </section>
            </section>
        </div>
    </bk-popover>
</template>

<script>
    import {
        mapActions
    } from 'vuex'

    export default {
        props: {
            value: String,
            isShowAi: Boolean
        },

        data () {
            return {
                isLoading: false,
                prompts: [],
                search: '',
                textHeight: 38
            }
        },

        watch: {
            isShowAi (val) {
                if (val) {
                    this.autoFocus()
                }
            },
            value () {
                this.handleChangeTextHeight()
                this.handleShowPopover()
            },
            search () {
                this.handleShow()
            }
        },

        methods: {
            ...mapActions('ai', ['getPrompts']),

            handleChangePrompt (val) {
                this.$emit('input', val)
            },

            handleShowPopover () {
                if (this.value === '/') {
                    this.showPrompts()
                } else {
                    this.hidePrompts()
                }
            },

            handleChangeTextHeight () {
                const lines = this.value.split(/\r?\n/)
                let height = 22 + lines.length * 16
                if (height >= 200) {
                    height = 200
                }
                this.textHeight = height
            },

            handleChoosePrompt (content) {
                this.$emit('input', content)
                this.hidePrompts()
                this.autoFocus()
            },

            handleShow () {
                this.isLoading = true
                this.getPrompts({
                    search: this.search
                }).then(res => {
                    this.prompts = res.list
                }).finally(() => {
                    this.isLoading = false
                })
            },

            handleKeyDown (value, event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    this.$emit('enter')
                }
            },

            autoFocus () {
                const $autoFocusItem = this.$refs.inputRef?.$el.querySelector('[autofocus="autofocus"]')
                $autoFocusItem?.focus()
            },

            showPrompts () {
                this.$refs['popover'].showHandler()
            },

            hidePrompts () {
                this.$refs['popover'].hideHandler()
            }
        }
    }
</script>

<style lang="postcss" scoped>
.prompt-list {
  max-height: 300px;
}
.bk-tooltip {
    position: relative;
    >>> .tippy-popper {
        width: 100%;
    }
}
>>> .bk-tooltip-ref {
    width: 100%;
}
.input-search {
    margin: 4px 12px 0;
    width: calc(100% - 24px);
}
.send-prompt {
  width: 100%;
  flex-direction: row;
  >>> .bk-textarea-wrapper {
    border: none;
  }
  >>> textarea {
    font-size: 14px;
    line-height: 16px;
    height: 38px;
    min-height: 38px;
    padding: 11px 38px 10px 11px;
    resize: none !important;
    background: #f5f7fa;
    border-color: transparent;
    border-radius: 2px;
    color: #63656e;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      height: 5px;
      border-radius: 3px;
      background-color: #dcdee5;
    }
    &::placeholder {
      line-height: 16px;
    }
  }
  &.control-active >>> textarea {
    height: var(--text-height);
    padding: 10px 38px 10px 10px;
    border: 1px solid #3A84FF;
  }
}
.search-group {
    margin-top: 4px;
    line-height: 32px;
    font-size: 12px;
    +.search-group {
        margin-top: 8px;
    }
    .group-label {
        padding: 0 12px;
        color: #979BA5;
        display: block;
    }
    .group-prompt {
        padding: 0 12px 0 24px;
        cursor: pointer;
        justify-content: space-between;
        &:hover {
            background: #F5F7FA;
        }
        &.active {
            background: #E1ECFF;
            color: #3A84FF;
        }
        .prompt-tag {
            background: #EAEBF0;
            border-radius: 2px;
            line-height: 16px;
            color: #979BA5;
            padding: 0 8px;
            margin-right: 6px;
            white-space:nowrap;
            &:last-child {
                margin-right: 0;
            }
        }
    }
}
</style>
