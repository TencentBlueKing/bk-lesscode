<template>
    <bk-form
        ref="formRef"
        form-type="vertical"
        :label-width="100"
        :model="formData"
    >
        <bk-form-item
            label="名称"
            property="name"
            error-display-type="normal"
            :required="true"
            :rules="[
                getRequireRule('名称'),
                getNameRepeatRule()
            ]"
            v-bkloading="{ isLoading: isLoadingApi }"
        >
            <bk-input
                placeholder="请输入名称"
                :value="formData.name"
                @change="update('name', ...arguments)"
            ></bk-input>
        </bk-form-item>
        <bk-form-item
            label="标识"
            property="code"
            error-display-type="normal"
            :required="true"
            :rules="[
                getRequireRule('标识'),
                getCodeRule(),
                getCodeRepeatRule()
            ]"
            v-bkloading="{ isLoading: isLoadingApi }"
        >
            <bk-input
                placeholder="请输入标识，由大小写英文字母组成"
                :value="formData.code"
                :disabled="!!formData.id"
                @change="update('code', ...arguments)"
            ></bk-input>
        </bk-form-item>
        <bk-form-item
            label="分类"
            property="categoryId"
            error-display-type="normal"
            :required="true"
            :rules="[
                getRequireRule('分类')
            ]"
        >
            <bk-select
                :clearable="false"
                :value="formData.categoryId"
                :loading="isLoadingCategory"
                @change="update('categoryId', ...arguments)"
                @toggle="handleCategoryToggle"
            >
                <bk-option
                    v-for="category in categoryList"
                    :key="category.id"
                    :id="category.id"
                    :name="category.name"
                ></bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            label="接口路径"
            property="url"
            error-display-type="normal"
            :required="true"
            :rules="[
                getRequireRule('接口路径')
            ]"
        >
            <bk-compose-form-item class="basic-compose-url">
                <bk-select
                    class="compose-method"
                    :clearable="false"
                    :value="formData.method"
                    @change="handleMethodChange"
                >
                    <bk-option
                        v-for="(api, key) in API_METHOD"
                        :key="api"
                        :id="api"
                        :name="key"
                    ></bk-option>
                </bk-select>
                <bk-input
                    class="compose-url"
                    placeholder="请输入接口地址"
                    :value="formData.url"
                    @change="update('url', ...arguments)"
                ></bk-input>
            </bk-compose-form-item>
        </bk-form-item>
        <bk-form-item
            property="withToken"
        >
            <bk-checkbox
                :true-value="1"
                :false-value="0"
                :value="formData.withToken"
                v-bk-tooltips="{
                    content: '勾选后会在请求中携带 Api gateway 所需的认证信息（该认证信息根据发送请求用户和绑定应用生成）'
                }"
                @change="update('withToken', ...arguments)"
            >蓝鲸应用认证</bk-checkbox>
        </bk-form-item>
        <bk-form-item
            label="备注"
            property="summary"
        >
            <bk-input
                type="textarea"
                placeholder="请输入备注"
                :value="formData.summary"
                @change="update('summary', ...arguments)"
            ></bk-input>
        </bk-form-item>
    </bk-form>
</template>

<script>
    import {
        defineComponent,
        ref,
        onBeforeMount
    } from '@vue/composition-api'
    import useForm from './use-form'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import {
        API_METHOD
    } from 'shared/api'

    export default defineComponent({
        props: {
            formData: Object
        },

        setup (props, { emit }) {
            const store = useStore()
            const route = useRoute()
            const categoryList = ref([])
            const apiList = ref([])
            const isLoadingCategory = ref(false)
            const isLoadingApi = ref(false)
            const formRef = ref(null)

            const {
                update
            } = useForm(emit)

            const getApiList = () => {
                isLoadingApi.value = true
                const params = {
                    projectId: route.params.projectId
                }
                return store
                    .dispatch('api/getApiList', params)
                    .then((list) => {
                        apiList.value = list
                    })
                    .finally(() => {
                        isLoadingApi.value = false
                    })
            }

            const getCategoryList = () => {
                isLoadingCategory.value = true
                const params = {
                    projectId: route.params.projectId
                }
                return store
                    .dispatch('api/getCategoryList', params)
                    .then((list) => {
                        categoryList.value = list
                    })
                    .finally(() => {
                        isLoadingCategory.value = false
                    })
            }

            const handleCategoryToggle = (isOpen) => {
                if (isOpen) {
                    getCategoryList()
                }
            }

            const handleMethodChange = (method) => {
                emit('update', {
                    method,
                    query: [],
                    body: {}
                })
            }

            const validate = () => {
                return new Promise((resolve, reject) => {
                    formRef.value.validate().then(() => {
                        resolve(props.formData)
                    }).catch((err) => {
                        reject(err.content || err)
                    })
                })
            }

            // 数据校验方法
            const getRequireRule = (name) => {
                return {
                    required: true,
                    message: `${name}是必填项，请修改后重试`,
                    trigger: 'blur'
                }
            }

            const getCodeRule = () => {
                return {
                    validator: (val) => /^[A-Za-z]*$/.test(val),
                    message: '由大小写英文字母组成',
                    trigger: 'blur'
                }
            }

            const getCodeRepeatRule = () => {
                return {
                    validator: (val) => !apiList.value.find(api => api.code === val && api.id !== props.formData.id),
                    message: '标识在当前应用下重复，请修改后重试',
                    trigger: 'blur'
                }
            }

            const getNameRepeatRule = () => {
                return {
                    validator: (val) => !apiList.value.find(api => api.name === val && api.id !== props.formData.id),
                    message: '名称在当前应用下重复，请修改后重试',
                    trigger: 'blur'
                }
            }

            onBeforeMount(() => {
                getApiList()
                getCategoryList()
            })

            return {
                API_METHOD,
                categoryList,
                isLoadingCategory,
                isLoadingApi,
                formRef,
                update,
                handleCategoryToggle,
                handleMethodChange,
                validate,
                getRequireRule,
                getCodeRule,
                getCodeRepeatRule,
                getNameRepeatRule
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .basic-compose-url {
        display: block;
        width: 100%;
        .compose-method {
            width: 150px;
        }
        .compose-url {
            width: calc(100% - 150px);
        }
    }
</style>
