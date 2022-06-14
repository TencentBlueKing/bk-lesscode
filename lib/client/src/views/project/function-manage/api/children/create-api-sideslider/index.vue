<template>
    <bk-sideslider
        transfer
        :title="title"
        :is-show.sync="isShow"
        :quick-close="true"
        :width="1200"
        :before-close="confirmClose"
        @hidden="handleClose">
        <section
            class="api-form-home"
            slot="content"
        >
            <h3 class="api-form-title">基本设置</h3>
            <render-basic
                class="api-form"
                ref="basicRef"
                :form-data="formData"
                @update="handleUpdate"
            />
            <h3 class="api-form-title">请求参数模型（{{ paramKey }}）</h3>
            <render-param
                class="api-form"
                ref="paramRef"
                :form-data="formData"
                @update="handleUpdate"
            />
            <h3 class="api-form-title">返回结果模型</h3>
            <render-response
                class="api-form"
                ref="responseRef"
                :form-data="formData"
                @update="handleUpdate"
            />
        </section>
        <section
            class="api-footer"
            slot="footer"
        >
            <bk-button
                theme="primary"
                class="mr10"
                :loading="isSubmitting"
                @click="submitApi"
            >提交</bk-button>
            <bk-button
                @click="confirmClose"
            >取消</bk-button>
        </section>
    </bk-sideslider>
</template>

<script>
    import RenderBasic from './basic.vue'
    import RenderParam from './param.vue'
    import RenderResponse from './response.vue'
    import {
        defineComponent,
        ref,
        watch,
        computed,
        getCurrentInstance
    } from '@vue/composition-api'
    import {
        getDefaultApi,
        METHODS_WITHOUT_DATA
    } from 'shared/api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import {
        messageError
    } from '@/common/bkmagic'

    export default defineComponent({
        components: {
            RenderBasic,
            RenderParam,
            RenderResponse
        },

        props: {
            title: {
                type: String
            },
            isShow: {
                type: Boolean,
                require: true
            },
            form: {
                type: Object
            },
            isEdit: {
                type: Boolean
            }
        },

        setup (props, { emit }) {
            // 状态
            const isSubmitting = ref(false)
            const formChanged = ref(false)
            const formData = ref({})
            const instance = getCurrentInstance()
            const basicRef = ref(null)
            const paramRef = ref(null)
            const responseRef = ref(null)
            // use data
            const store = useStore()
            const route = useRoute()
            // 计算变量
            const paramKey = computed(() => {
                if (METHODS_WITHOUT_DATA.includes(formData.value.method)) {
                    return 'query'
                } else {
                    return 'body'
                }
            })

            // 方法
            const confirmClose = () => {
                if (formChanged.value) {
                    instance.proxy.$bkInfo({
                        title: '请确认是否关闭',
                        subTitle: '存在未保存的 API，关闭后不会保存更改',
                        confirmFn: handleClose
                    })
                } else {
                    handleClose()
                }
            }

            const handleClose = () => {
                emit('update:isShow', false)
                emit('update:form', {})
            }

            const validate = () => {
                return new Promise((resolve, reject) => {
                    Promise
                        .all([
                            basicRef.value.validate(),
                            paramRef.value.validate(),
                            responseRef.value.validate()
                        ])
                        .then((res) => {
                            resolve(res)
                        })
                        .catch((err) => {
                            messageError(err.message || err)
                            reject(err.message || err)
                        })
                })
            }

            const submitApi = () => {
                isSubmitting.value = true
                validate()
                    .then(([
                        basicData,
                        paramData,
                        responseData
                    ]) => {
                        const form = {
                            projectId: route.params.projectId,
                            versionId: store.getters['projectVersion/currentVersionId'],
                            ...basicData,
                            ...paramData,
                            ...responseData
                        }
                        const submitMethod = formData.value.id ? editApi : createApi
                        return submitMethod(form).then(() => {
                            emit('success-submit')
                            handleClose()
                        })
                    })
                    .finally(() => {
                        isSubmitting.value = false
                    })
            }

            const createApi = (form) => {
                return store.dispatch('api/createApi', form)
            }

            const editApi = (form) => {
                return store.dispatch('api/editApi', form)
            }

            const handleUpdate = (formItem) => {
                formChanged.value = true
                Object.assign(formData.value, formItem)
            }

            watch(
                () => props.form,
                () => {
                    formData.value = Object.assign(getDefaultApi(), props.form)
                },
                {
                    immediate: true
                }
            )

            return {
                isSubmitting,
                formData,
                basicRef,
                paramRef,
                responseRef,
                paramKey,
                confirmClose,
                handleClose,
                submitApi,
                handleUpdate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .api-form-home {
        padding: 20px 30px;
        height: calc(100vh - 114px);
    }
    .api-form-title {
        color: #444;
        font-size: 14px;
        margin: 0;
        padding-left: 17px;
        position: relative;
        line-height: 40px;
        margin-bottom: 5px;
        &:before {
            content: '';
            background-color: #3a84ff;
            height: 16px;
            left: 0;
            position: absolute;
            top: 12px;
            width: 4px;
        }
    }
    .api-form {
        margin-bottom: 25px;
        &:last-child {
            padding-bottom: 30px;
        }
    }
    .api-footer {
        padding-left: 30px;
    }
</style>
