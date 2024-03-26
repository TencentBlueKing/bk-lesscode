<template>
    <div class="module-category-wrapper">
        <div style="margin: 0 16px 16px">
            <bk-input v-model="searchStr" :right-icon="'bk-icon icon-search'" clearable />
        </div>
        <div class="module-list-container" v-bkloading="{ isLoading }" >
            <div v-for="item in renderList"
                :key="item.id"
                class="flex-item module-item"
                :class="{ 'active-item': currentModule.moduleCode === item.moduleCode }"
                @click="changeModule(item)">
                <i class="bk-drag-icon bk-drag-custom-comp-default"></i>
                <span>{{item.moduleCode}}</span>
            </div>
            <div class="add-module-row" v-if="editing || renderList.length">
                <bk-form class="add-module-form" :label-width="0" v-if="editing" :model="formModel" :rules="formRules" ref="moduleForm" style="width: 100%;">
                    <bk-form-item property="moduleCode">
                        <bk-input
                            v-model="formModel.moduleCode"
                            :placeholder="$t('请输入模块名称，按enter保存')"
                            ref="moduleInput"
                            @blur="resetInput"
                            @enter="createModule" />
                    </bk-form-item>
                    <p>tips：{{moduleCodeTips}}</p>
                </bk-form>
                <div class="add-module-entry flex-item" v-else-if="renderList.length" @click="inputModule">
                    <i class="bk-drag-icon bk-drag-plus-circle"></i>
                    <span>{{$t('添加模块')}}</span>
                </div>
            </div> 
            <empty-status v-if="!renderList.length && !editing" :type="emptyType" :part="false" @clearSearch="searchStr = ''">
                <div>
                    <span>{{$t('尚未创建模块，')}}</span>
                    <span @click="inputModule" style="color: #3A84FF;cursor: pointer;">
                        {{$t('立即创建')}}</span>
                </div>
            </empty-status>
        </div>
    </div>
</template>

<script>
    import { defineComponent, ref, computed, getCurrentInstance, onBeforeMount, nextTick } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute, useRouter } from '@/router'

    export default defineComponent({
        props: {
            moduleChange: {
                type: Function,
                required: true
            }
        },
        setup (props) {
            const moduleCodeTips = window.i18n.t('小写字母开头，只能包含小写字母、数字、中划线, 长度为1-16个字符')
            const currentInstance = getCurrentInstance()
            const store = useStore()
            const route = useRoute()
            const router = useRouter()

            const editing = ref(false)
            const isLoading = ref(false)
            const currentModule = ref({})
            const searchStr = ref('')

            const dataList = ref([])

            const formModel = ref({
                moduleCode: ''
            })
            const formRules = {
                moduleCode: [
                    {
                        regex: /^[a-z][a-z0-9-]{0,15}$/,
                        message: moduleCodeTips,
                        trigger: 'change'
                    }
                ]
            }

            const renderList = computed(() => {
                return dataList.value.filter(item => item.moduleCode.indexOf(searchStr.value) !== -1)
            })

            const projectDetail = computed(() => {
                return store.getters['project/currentProject']
            })

            const emptyType = computed(() => {
                return searchStr.value ? 'search' : 'custom'
            })

            const getModuleList = async () => {
                isLoading.value = true
                const data = await store.dispatch('saasBackend/getModuleList', projectDetail.value.id)
                isLoading.value = false
                dataList.value = data
                // 如果没有选中， 选中路由或者第一个
                if (data.length && !currentModule.value?.moduleCode) {
                    const queryModule = route.query?.module
                    const findItem = data.find(item => item.moduleCode === queryModule)
                    if (findItem) {
                        changeModule(findItem)
                    } else {
                        changeModule(data[0] || {})
                    }
                }
            }

            const resetInput = () => {
                editing.value = false
                formModel.value.moduleCode = ''
            }

            const inputModule = () => {
                editing.value = true
                nextTick(() => {
                    currentInstance.proxy.$refs.moduleInput?.focus()
                })
            }

            const createModule = async () => {
                const formRef = currentInstance.proxy.$refs.moduleForm
                const validate = await formRef.validate()
                if (validate) {
                    try {
                        isLoading.value = true
                        const param = {
                            projectId: projectDetail.value.id,
                            createUser: projectDetail.value.createUser,
                            appCode: projectDetail.value?.appCode,
                            moduleCode: formModel.value.moduleCode,
                            
                        }
                        const data = await store.dispatch('saasBackend/createModule', param)
                        if (data?.module) {
                            await getModuleList()
                            currentInstance.proxy.$bkMessage({
                                theme: 'success',
                                message: window.i18n.t('模块创建成功')
                            })
                            isLoading.value = false
                            editing.value = false
                        }
                    } catch (err) {
                        isLoading.value = false
                        editing.value = false
                        console.error(err.message || err)
                    }
                }
            }
            const changeModule = (moduleItem) => {
                currentModule.value = moduleItem
                props.moduleChange(moduleItem)
                if (route.query?.module !== moduleItem?.moduleCode) {
                    router.push({  
                        query: { module: moduleItem?.moduleCode }
                    })
                }
            }

            onBeforeMount(() => {
                getModuleList()
            })
            return {
                isLoading,
                moduleCodeTips,
                renderList,
                currentModule,
                emptyType,
                editing,
                searchStr,
                formModel,
                formRules,
                projectDetail,
                changeModule,
                createModule,
                resetInput,
                inputModule
            }
        }
    })
</script>

<style lang="postcss">
    .module-category-wrapper {
        height: 100%;
        padding: 16px 0;
        background-color: #fff;
        .module-list-container {
            .flex-item {
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 0 16px;
                font-size: 12px;
                span {
                    margin-left: 12px;
                }
            }
            .module-item {
                height: 36px;
                color: #63656E;
                .i {
                    color: #979BA5;
                }
                &:hover, &.active-item {
                    background-color: #E1ECFF;
                    color: #3A84FF;
                    .i {
                        color: #3A84FF;
                    }
                }
            }
            .add-module-row {
                height: auto;
                color: #3A84FF;
                i {
                    font-size: 14px;
                }
                span {
                    margin-left: 10px;
                }
            }
            .add-module-entry {
                height: 36px;
            }
            .add-module-form {
                margin: 4px 0;
                padding: 0 16px;
                font-size: 12px;
                p {
                    margin: 2px;
                    color: #979ba5;
                }
            }
        }
    }
</style>