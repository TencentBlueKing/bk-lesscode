<template>
    <bk-form
        ref="formRef"
        :label-width="100"
        :model="formData"
    >
        <bk-form-item
            label="名称"
            property="name"
            :required="true"
        >
            <bk-input
                :value="formData.name"
                @change="update('name', ...arguments)"
            ></bk-input>
        </bk-form-item>
        <bk-form-item
            label="标识"
            property="code"
            :required="true"
        >
            <bk-input
                :value="formData.code"
                @change="update('code', ...arguments)"
            ></bk-input>
        </bk-form-item>
        <bk-form-item
            label="分类"
            property="categoryId"
            :required="true"
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
            :required="true"
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
            const isLoadingCategory = ref(false)
            const formRef = ref(null)

            const {
                update
            } = useForm(emit)

            const getCategoryList = () => {
                isLoadingCategory.value = true
                const params = {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId']
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
                    query: {},
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

            onBeforeMount(getCategoryList)

            return {
                API_METHOD,
                categoryList,
                isLoadingCategory,
                formRef,
                update,
                handleCategoryToggle,
                handleMethodChange,
                validate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .basic-compose-url {
        width: 100%;
        .compose-method {
            width: 150px;
        }
        .compose-url {
            width: calc(100% - 150px);
        }
    }
</style>
