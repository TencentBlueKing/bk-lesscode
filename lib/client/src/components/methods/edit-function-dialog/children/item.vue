<template>
    <li :class="['func-item', { select: functionData.funcName === chosenFunctionName }]" @click="handleChooseFunction">
        <span class="func-name" :title="`${functionData.funcName}(${functionData.funcCode})`">
            {{ functionData.funcName }}（{{ functionData.funcCode }}）
        </span>
        <template v-if="functionData.id">
            <i
                class="bk-drag-icon bk-drag-copy hover-show"
                @click.stop="handleCopyFunction"
            ></i>
            <i
                :class="['bk-drag-icon', 'bk-drag-delet', 'hover-show', { disable: !computedPermissionInfo.hasPermission }]"
                v-bk-tooltips="{
                    disabled: computedPermissionInfo.hasPermission,
                    content: computedPermissionInfo.message,
                    placements: ['top'],
                    width: 250
                }"
                @click.stop="handleDeleteFunction"
            ></i>
        </template>
    </li>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'

    export default {
        props: {
            functionData: {
                type: Object
            },
            chosenFunctionName: {
                type: String
            }
        },

        computed: {
            ...mapGetters(['user']),
            ...mapGetters('projectVersion', ['currentVersionId']),

            projectId () {
                return parseInt(this.$route.params.projectId)
            },

            computedPermissionInfo () {
                if (this.functionData.useInfo?.funcCodes?.length > 0) {
                    return {
                        hasPermission: false,
                        message: this.$t('该函数被函数【函数标识：{0}】引用，无法删除', [this.functionData.useInfo?.funcCodes.join('，')])
                    }
                }

                if (this.functionData.useInfo?.pageNames?.length > 0) {
                    return {
                        hasPermission: false,
                        message: this.$t('该函数被页面【页面名称：{0}】引用，无法删除', [this.functionData.useInfo?.pageNames.join('，')])
                    }
                }

                if (this.functionData.useInfo?.variableCodes?.length > 0) {
                    return {
                        hasPermission: false,
                        message: this.$t('该函数被变量【变量标识：{0}】引用，无法删除', [this.functionData.useInfo?.variableCodes.join('，')])
                    }
                }

                return {
                    hasPermission: true
                }
            }
        },

        methods: {
            ...mapActions('functions', ['deleteFunction', 'getAllGroupAndFunction']),

            handleCopyFunction () {
                const { id, ...newFunction } = this.functionData
                newFunction.funcCode = ''
                this.$emit('insert-function', newFunction)
            },

            handleChooseFunction () {
                this.$emit('choose', this.functionData)
            },

            handleDeleteFunction () {
                if (!this.computedPermissionInfo.hasPermission) return

                this.$bkInfo({
                    title: this.$t('确认要删除函数【{0}】', [this.functionData.funcName]),
                    confirmLoading: true,
                    theme: 'danger',
                    confirmFn: () => {
                        return this.deleteFunction(this.functionData.id).then(() => {
                            this.$emit('refresh')
                            this.messageSuccess(this.$t('删除成功'))
                            // 更新画布数据
                            this.getAllGroupAndFunction({
                                projectId: this.projectId,
                                versionId: this.currentVersionId
                            }).then((functionData) => {
                                this.$store.commit('functions/setFunctionData', functionData)
                            })
                        })
                    }
                })
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .func-item {
        display: flex;
        align-items: center;
        padding: 0 9px 0 65px;
        color: #63656e;
        line-height: 32px;
        cursor: pointer;
        font-size: 12px;
        .hover-show {
            display: none;
        }
        .bk-drag-copy {
            margin-right: 4px;
        }
        .func-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .bk-drag-icon {
            font-size: 12px;
        }
        &:hover, &.select {
            background: #e1ecff;
            color: #3a84ff;
            .hover-show {
                display: block;
            }
        }
        .disable {
            cursor: not-allowed;
        }
    }
    .item-tool {
        height: 22px;
        width: 22px;
        line-height: 22px;
        text-align: center;
        font-size: 16px;
        display: inline-block;
        cursor: pointer;
        &:hover {
            border-radius: 100px;
            background: #fafbfd;
        }
    }
</style>
