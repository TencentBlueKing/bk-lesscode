<template>
    <section class="tag-view">
        <template v-for="(tag, index) in defaultTags">
            <bk-tag
                :closable="!disabled"
                :key="index"
                @close="closeTag(tag)">
                {{tag}}
            </bk-tag>
        </template>
        <bk-button
            v-show="!isAddTag"
            ext-cls="new-tag-btn"
            icon="plus"
            theme="default"
            :disabled="disabled"
            @click="addTag">
        </bk-button>
        <bk-input
            v-show="isAddTag"
            ref="tagInput"
            class="new-tag-input"
            v-model="userInput"
            @enter="handleAddTag"
            @blur="handleAddTag">
        </bk-input>
    </section>
</template>

<script>
    export default {
        props: {
            value: {
                type: Array,
                default: () => ([])
            },

            disabled: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                isAddTag: false,
                userInput: '',
                defaultTags: []
            }
        },

        watch: {
            value: {
                handler () {
                    this.defaultTags = [...this.value]
                },
                immediate: true
            }
        },

        methods: {
            addTag () {
                this.isAddTag = !this.isAddTag
                setTimeout(() => {
                    this.$refs?.tagInput?.$refs?.input?.focus()
                })
            },
            handleAddTag () {
                if (this.userInput) {
                    this.defaultTags.push(this.userInput)
                    this.triggleChange()
                }
                this.isAddTag = false
                this.userInput = ''
            },
            closeTag (key) {
                const index = this.defaultTags.findIndex(item => item === key)
                this.defaultTags.splice(index, 1)
                this.triggleChange()
            },
            triggleChange () {
                this.$emit('update:value', this.defaultTags)
                this.$emit('change', this.defaultTags)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .tag-view {
        /deep/ .bk-tag {
            float: left;
            margin: 2px 6px 2px 0;
            background: #FAFBFD;
            border: 1px solid #DCDEE5;
            border-radius: 2px;
            height: 32px;
            line-height: 32px;
        }
        .new-tag-btn {
            float: left;
            color: #979ba5;
            padding: 0;
            margin: 2px 0;
            position: static !important;
            transform: none !important;
            &.is-disabled {
                color: #c4c6cc;
            }
        }
        &:after {
            display: table;
            content: '';
            clear: both;
        }
    }
    .new-tag-input {
        float: left;
        width: 100px;
        margin: 2px 0;
    }
</style>
