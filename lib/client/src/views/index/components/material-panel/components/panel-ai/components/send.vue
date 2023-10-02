<template>
    <bk-popover
        ref="popover"
        placement="bottom"
        theme="light"
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
                            content: prompt.content,
                            placement: 'right',
                            theme: 'light',
                            width: 300,
                            zIndex: 9999999,
                            extCls: 'prompt-tips'
                        }"
                        v-for="prompt in prompts"
                        :key="prompt.prompt_id"
                        class="group-prompt g-flex-row"
                        @click="handleChoosePrompt(prompt.content)"
                    >
                        <span
                            class="prompt-content g-ellipsis"
                        >{{ prompt.prompt_name }}</span>
                        <span class="g-flex-row">
                            <span
                                v-for="tag in prompt.tags.slice(0, 4)"
                                :key="tag"
                                class="prompt-tag"
                            >{{ tag }}</span>
                            <span
                                v-if="prompt.tags.length > 4"
                                class="prompt-tag"
                            >+{{ prompt.tags.length - 4 }}</span>
                        </span>
                    </span>
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
                textHeight: 48
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
            }
        },

        methods: {
            ...mapActions('ai', ['getPrompts']),

            handleChangePrompt (val) {
                if (val === '/' && !this.value.includes('/')) {
                    this.showPrompts()
                }
                this.$emit('input', val)
            },

            handleChangeTextHeight () {
                const lines = this.value.split(/\r?\n/)
                let height = 32 + lines.length * 16
                if (height >= 200) {
                    height = 200
                }
                this.textHeight = height
            },

            handleChoosePrompt (content) {
                this.$emit('input', content)
                this.hidePrompts()
            },

            handleShow () {
                this.isLoading = true
                this.getPrompts({
                    page: 1,
                    limit: 10000,
                    mine: false,
                    fuzzy: this.search,
                    tags: 'lesscode'
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
.send-prompt {
  width: 100%;
  flex-direction: row;
  >>> .bk-textarea-wrapper {
    border: none;
  }
  >>> textarea {
    font-size: 14px;
    line-height: 16px;
    height: 48px;
    min-height: 48px;
    padding: 16px 38px 16px 10px;
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
    padding: 15px 38px 15px 10px;
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
