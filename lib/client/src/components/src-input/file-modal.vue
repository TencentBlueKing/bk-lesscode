<script>
    import { computed, defineComponent, onBeforeUnmount, reactive, ref } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { messageError, messageSuccess } from '@/common/bkmagic'

    import useUploadHandler from '@/components/filelib/use-upload-handler.js'
    import useUploadList from '@/components/filelib/use-upload-list.js'

    import Upload from '@/components/filelib/upload.vue'
    import ListCard from '@/components/filelib/list-card.vue'

    import { FILE_MAX_LIMIT, isImageFile } from '@/components/filelib/helper'

    export default defineComponent({
        components: {
            ListCard,
            Upload
        },
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            fileType: {
                type: String,
                default: '*',
                validator (value) {
                    return ['*', 'img', 'zip', 'doc'].includes(value)
                }
            },
            projectId: {
                type: [String, Number],
                default: ''
            }
        },
        setup (props, { emit }) {
            const store = useStore()
            const route = useRoute()

            const uploadRef = ref(null)

            const projectId = computed(() => route.params.projectId || props.projectId)
            const paramsData = computed(() => ({ projectId: projectId.value }))

            const {
                keyword,
                isSearch,
                loading: listLoading,
                displayList,
                handleSearch
            } = useUploadList({ projectId: projectId.value })

            const baseUploadProps = reactive({
                fileList: displayList,
                maxImageSize: FILE_MAX_LIMIT.IMAGE_SIZE,
                maxFileSize: FILE_MAX_LIMIT.FILE_SIZE,
                maxlength: 20,
                beforeRemove: async (file) => {
                    if (!file.id) {
                        return
                    }

                    try {
                        await store.dispatch('file/del', { ...paramsData.value, fileId: file.id })
                        messageSuccess(window.i18n.t('删除成功'))
                    } catch (err) {
                        messageError(window.i18n.t('删除失败'))
                        console.error(err)
                        return false
                    }
                },
                onSuccess: async (res) => {
                    const data = {
                        ...paramsData.value,
                        fileData: {
                            ...res.data,
                            status: 'success'
                        }
                    }
                    try {
                        await store.dispatch('file/create', data)
                    } catch (err) {
                        messageError(window.i18n.t('保存上传文件失败'))
                        console.error(err)
                    }
                }
            })

            const {
                uploadFiles,
                handleStart,
                handleError,
                handleSuccess,
                handleProgress,
                handleRemove
            } = useUploadHandler(baseUploadProps, uploadRef)

            const uploadProps = computed(() => ({
                params: paramsData.value,
                showTips: false,
                maxImageSize: baseUploadProps.maxImageSize,
                maxFileSize: baseUploadProps.maxFileSize,
                maxlength: baseUploadProps.maxlength,
                onStart: handleStart,
                onProgress: handleProgress,
                onSuccess: handleSuccess,
                onError: handleError
            }))

            onBeforeUnmount(() => {
                uploadFiles.value.forEach(({ url }) => {
                    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
                })
            })

            const handleSelect = (file) => {
                emit('select', file)
            }
            const handleView = (file) => {
                emit('view', file)
            }

            const handleCancel = () => {
                show.value = false
            }

            const show = computed({
                get () {
                    return props.isShow
                },
                set (val) {
                    emit('update:isShow', val)
                }
            })

            const isDisabled = (file) => {
                if (props.fileType === 'img') {
                    return !isImageFile(file)
                }
                return false
            }

            return {
                FILE_MAX_LIMIT,
                show,
                keyword,
                isSearch,
                displayList,
                listLoading,
                uploadRef,
                uploadProps,
                uploadFiles,
                isDisabled,
                handleSearch,
                handleRemove,
                handleSelect,
                handleView,
                handleCancel
            }
        }
    })
</script>

<template>
    <bk-dialog v-model="show"
        :class="'filelib-dialog'"
        :render-directive="'if'"
        :width="980"
        :esc-close="false"
        :mask-close="false"
        header-position="left"
        :title="$t('文件管理')">
        <div :class="$style['modal-container']">
            <div :class="$style['modal-head']">
                <div :class="$style['buttons']">
                    <upload ref="uploadRef" v-bind="uploadProps" />
                </div>
                <div :class="$style['search-bar']">
                    <span :class="$style['total']" v-show="displayList.length">{{ $t('共') }}<em :class="$style['count']">{{displayList.length}}</em>{{ $t('个文件') }}</span>
                    <bk-input :placeholder="$t('请输入文件名')"
                        style="width: 360px"
                        :clearable="true"
                        right-icon="bk-icon icon-search"
                        v-model="keyword"
                        @input="handleSearch">
                    </bk-input>
                </div>
                <div :class="$style['tip']">
                    {{ $t('支持上传图片大小 {0}M 以内，文件大小 {1}M 以内的素材，格式支持 jpg，png，gif，svg，zip，doc，pdf，excel 等', [FILE_MAX_LIMIT.IMAGE_SIZE, FILE_MAX_LIMIT.FILE_SIZE]) }} </div>
            </div>
            <div :class="$style['modal-body']">
                <list-card
                    class="model-list-card"
                    :files="uploadFiles"
                    :card-height="166"
                    :card-width="218"
                    :image-height="114"
                    :is-search="isSearch"
                    @remove="handleRemove">
                    <template #use-action="file">
                        <div :class="$style['use-action-inner']">
                            <bk-button
                                :disabled="isDisabled(file)"
                                :class="$style['action-button']"
                                theme="primary"
                                @click="handleSelect(file)">
                                {{ $t('使用') }} </bk-button>
                            <bk-button
                                :class="$style['action-button']"
                                @click="handleView(file)">
                                {{ $t('查看') }} </bk-button>
                        </div>
                    </template>
                </list-card>
            </div>
            <div :class="$style['modal-foot']"></div>
        </div>
        <template #footer>
            <div :class="$style['modal-foot']">
                <bk-button @click="handleCancel">{{ $t('取消') }}</bk-button>
            </div>
        </template>
    </bk-dialog>
</template>

<style lang="postcss" module>
    .modal-container {
        .modal-head {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;

            .search-bar {
                display: flex;
                align-items: center;

                .total {
                    font-size: 12px;
                    margin-right: 8px;
                    white-space: nowrap;

                    .count {
                        font-style: normal;
                        margin: 0 .1em;
                    }
                }
            }

            .tip {
                flex-basis: 100%;
                margin-top: 8px;
                font-size: 12px;
                color: #979ba5;
            }
        }
        .modal-body {
            height: 45vh;
        }
    }

    .use-action-inner {
        .action-button {
            margin: 0 4px;
        }
    }
</style>

<style lang="postcss" scoped>
    .filelib-dialog {
        ::v-deep .bk-dialog-header {
            padding-bottom: 8px;
        }
    }

    .model-list-card {
        ::v-deep {
            .card-item {
                &:nth-child(4n) {
                    margin-right: 0;
                }
            }
        }
    }
</style>
