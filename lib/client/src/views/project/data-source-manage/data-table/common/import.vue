<template>
    <section>
        <bk-button class="import-button" @click="toggleShowDialog(true)">{{ $t('导入') }}</bk-button>

        <bk-dialog
            theme="primary"
            header-position="left"
            width="640"
            v-model="isShowImport">
            <span slot="header">
                {{ title }}
                <i
                    v-if="tips"
                    v-bk-tooltips="{ content: tips, maxWidth: 400 }"
                    class="bk-icon icon-info"
                ></i>
            </span>

            <h5 class="import-title">{{$t('文件类型')}}</h5>
            <bk-radio-group
                v-model="fileType"
                class="import-content"
            >
                <bk-radio-button :value="DATA_FILE_TYPE.XLSX">
                    XLSX
                </bk-radio-button>
                <bk-radio-button :value="DATA_FILE_TYPE.SQL">
                    SQL
                </bk-radio-button>
            </bk-radio-group>

            <slot :file-type="fileType"></slot>

            <bk-upload
                with-credentials
                :accept="`.${fileType}`"
                :limit="1"
                :size="10"
                :multiple="false"
                :custom-request="handleRequest"
                :key="uploadKey + fileType"
                v-if="isShowImport"
            ></bk-upload>

            <span class="import-tip">
                {{ $t('支持 {0} 文件格式，', [fileType]) }}<slot name="tips" :file-type="fileType"></slot>
                <bk-link theme="primary" @click="downloadTemplate(fileType)" style="min-width: 100px;">
                    <i class="bk-drag-icon bk-drag-download"></i>{{ $t('{0} 模板', [fileType]) }}
                </bk-link>
            </span>

            <h5 class="result-message">
                {{ resultMessage }}
            </h5>

            <h5 class="error-message">
                {{ errorMessage }}
            </h5>

            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="isLoadingData"
                    @click="confirmImport">{{ $t('导入') }}</bk-button>
                <bk-button
                    :disabled="isLoadingData"
                    @click="toggleShowDialog(false)"
                >{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        DATA_FILE_TYPE,
    } from 'shared/data-source'

    export default defineComponent({
        props: {
            title: String,
            tips: String,
            typeTips: String,
            uploadKey: String,
            parseImport: Function,
            handleImport: Function
        },

        setup (props, { emit }) {
            const isShowImport = ref<boolean>(false)
            const isLoadingData = ref(false)
            const resultMessage = ref('')
            const errorMessage = ref('')
            const parseData = ref([])
            const fileType = ref(DATA_FILE_TYPE.XLSX)

            // 清空状态
            const clearStatus = () => {
                resultMessage.value = ''
                errorMessage.value = ''
                parseData.value = []
            }
            // 展示导入 dialog
            const toggleShowDialog = (isShow) => {
                isShowImport.value = isShow
                clearStatus()
            }
            // 执行导入请求并解析文件格式
            const handleRequest = (options) => {
                const {
                    fileObj,
                    fileList,
                    onProgress,
                    onSuccess
                } = options
                const [tableName, type] = fileList?.[0]?.name?.split('.')

                // 每次导入需要清空上次导入的结果信息
                clearStatus()
                // 检测文件类型
                if (type !== fileType.value) {
                    errorMessage.value = `上次的文件类型不是【${fileType.value}】，请重新上传`
                    return
                }
                // 读取文件
                const reader = new FileReader()
                if (type === DATA_FILE_TYPE.XLSX) {
                    reader.readAsBinaryString(fileList[0].origin)
                } else {
                    reader.readAsText(fileList[0].origin, 'utf-8')
                }
                // 读取完成
                reader.onload = (event) => {
                    props
                        .parseImport({
                            data: {
                                tableName,
                                content: event.target.result
                            },
                            type
                        })
                        .then(({ data, message }) => {
                            resultMessage.value = message
                            parseData.value = data
                            onSuccess({ code: 0 }, fileObj)
                        })
                        .catch((err) => {
                            fileObj.errorMsg = err.message
                        })
                }
                // 发生错误
                reader.onerror = () => {
                    fileObj.errorMsg = window.i18n.t('上传文件失败')
                }
                // 执行完成
                reader.onloadend = () => {
                    fileObj.progress = '100%'
                    onProgress({}, 100)
                }
            }
            const confirmImport = () => {
                resultMessage.value = ''
                isLoadingData.value = true
                return props
                    .handleImport(parseData.value, fileType.value)
                    .then(() => {
                        isShowImport.value = false
                        clearStatus()
                    })
                    .catch((err) => {
                        errorMessage.value = err.message || err
                    })
                    .finally(() => {
                        isLoadingData.value = false
                    })
            }
            // 下载模板
            const downloadTemplate = (type) => {
                emit('downloadTemplate', type)
            }

            watch(
                [
                    () => props.uploadKey,
                    () => fileType.value
                ],
                () => {
                    clearStatus()
                }
            )

            return {
                DATA_FILE_TYPE,
                isShowImport,
                isLoadingData,
                resultMessage,
                errorMessage,
                fileType,
                toggleShowDialog,
                handleRequest,
                confirmImport,
                downloadTemplate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .import-tip, ::v-deep .bk-link-text {
        font-size: 12px;
        line-height: 16px;
    }
    .import-tip {
        display: inline-flex;
        align-items: center;
        margin-bottom: 5px;
    }
    .bk-drag-download {
        font-size: 14px;
        margin-right: 4px;
    }
    .tip-divider {
        margin: 0 4px !important;
    }
    .icon-info {
        font-size: 14px;
        vertical-align: middle;
        cursor: pointer;
    }
    .result-message {
        margin: 0 0 5px;
    }
    .error-message {
        margin: 0 0 5px;
        color: #ff5656;
    }
    .import-title {
        font-weight: normal;
        font-size: 12px;
        line-height: 20px;
        margin: 0 0 6px;
    }
    .import-content {
        margin-bottom: 20px;
        .bk-form-radio-button {
            width: 50%;
        }
        /deep/ .bk-radio-button-text {
            width: 100%;
        }
    }
</style>
