<template>
    <div>
        <bk-sideslider
            class="create-sideslider"
            :is-show.sync="isVisible"
            :quick-close="false"
            :title="isEdit ? '编辑操作' : '新建操作'"
            :width="696"
            @hidden="hide">
            <div class="wrapper" slot="content" v-bkloading="{ isLoading: isLoading }">
                <bk-form :label-width="120" :model="formData" :rules="rules" ref="validateForm">
                    <bk-form-item label="操作 ID" required property="actionId">
                        <bk-input v-model="formData.actionId" placeholder="请输入操作 ID：如 access_page" clearable></bk-input>
                    </bk-form-item>
                    <bk-form-item label="操作名称" required property="actionName">
                        <bk-input v-model="formData.actionName" placeholder="请输入操作名称：如页面访问" clearable :show-word-limit="true" maxlength="32"></bk-input>
                    </bk-form-item>
                    <bk-form-item label="操作名称英文" required property="actionNameEn">
                        <bk-input v-model="formData.actionNameEn" placeholder="请输入操作名称英文：如 View Page" clearable></bk-input>
                    </bk-form-item>
                    <bk-form-item label="操作类型" property="actionType">
                        <bk-select v-model="formData.actionType" @change="actionTypeChange">
                            <bk-option v-for="item in actionTypeList" :key="item.id"
                                :id="item.id" :name="item.name">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                    <template v-if="isDefaultAction">
                        <bk-form-item label="是否关联资源" property="hasRelated" required>
                            <bk-radio-group v-model="formData.hasRelated">
                                <bk-radio :value="'1'" class="mr15" :disabled="!isEdit">是</bk-radio>
                                <bk-radio :value="'0'" :disabled="!isEdit">否</bk-radio>
                            </bk-radio-group>
                        </bk-form-item>
                        <bk-form-item label="关联资源" property="relatedResource" v-if="formData.hasRelated === '1'">
                            <bk-select v-model="formData.relatedResource" @change="relatedResourceChange" placeholder="请选择资源" multiple>
                                <bk-option v-for="item in relatedResourceList" :key="item.id"
                                    :id="item.id" :name="item.name">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                    </template>
                    <bk-form-item label="操作描述" property="actionDesc">
                        <bk-input v-model="formData.actionDesc" :type="'textarea'" :rows="3" maxlength="255" placeholder="请输入操作描述" clearable></bk-input>
                    </bk-form-item>
                    <bk-form-item label="操作描述英文" property="actionDescEn">
                        <bk-input v-model="formData.actionDescEn" :type="'textarea'" :rows="3" maxlength="255" placeholder="操作描述英文" clearable></bk-input>
                    </bk-form-item>
                    <bk-form-item>
                        <bk-button ext-cls="mr5" theme="primary" title="提交" @click.stop.prevent="validate" :loading="isChecking">提交</bk-button>
                        <bk-button ext-cls="mr5" theme="default" title="取消" @click="hide">取消</bk-button>
                    </bk-form-item>
                </bk-form>
            </div>
        </bk-sideslider>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        props: {
            isShow: {
                type: Boolean,
                default: true
            },
            isDefaultAction: {
                type: Boolean,
                default: true
            },
            curUpdate: {
                type: Object,
                default: () => ({})
            }
        },

        data () {
            return {
                isLoading: false,
                isVisible: false,
                isChecking: false,
                formData: {},
                actionTypeList: [
                    { id: 'create', name: '创建(create)' },
                    { id: 'delete', name: '删除(delete)' },
                    { id: 'view', name: '查看(view)' },
                    { id: 'edit', name: '编辑(edit)' },
                    { id: 'list', name: '列表(list)' },
                    { id: 'manage', name: '管理(manage)' },
                    { id: 'execute', name: '执行(execute)' },
                    { id: 'use', name: '使用(use)' }
                ],
                relatedResourceList: [],
                rules: {
                    name: [
                        {
                            required: true,
                            message: '请填写组名',
                            trigger: 'blur'
                        },
                        {
                            validator: this.checkName,
                            message: '组名已被占用',
                            trigger: 'blur'
                        }
                    ],
                    member: [
                        {
                            validator: (val) => {
                                return val.length >= 1
                            },
                            message: '请选择用户',
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },

        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            isEdit () {
                return Object.keys(this.curUpdate).length > 0
            }
        },

        watch: {
            isShow: {
                async handler (newVal) {
                    this.isVisible = newVal
                    if (this.isVisible) {
                        console.error(this.curUpdate)
                        this.resetFormData()
                        this.isLoading = true
                        if (this.isDefaultAction) {
                            await this.getRelatedResourceList()
                        }
                        this.isLoading = false
                    }
                },
                immediate: true
            }
        },

        created () {
        },

        methods: {
            resetFormData () {
                this.formData = Object.assign({}, {
                    actionName: '',
                    actionNameEn: '',
                    actionId: '',
                    actionType: '',
                    hasRelated: '0',
                    relatedResource: [],
                    actionDesc: '',
                    actionDescEn: ''
                })
            },

            async getRelatedResourceList () {
                this.isLoading = true
                try {
                    const list = await this.$store.dispatch('page/getList', { projectId: this.projectId, versionId: this.versionId })
                    this.relatedResourceList.splice(0, this.relatedResourceList.length, ...list)
                    console.warn(this.relatedResourceList)
                    this.relatedResourceList.forEach(item => {
                        item.name = item.pageName
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },

            actionTypeChange () {

            },

            relatedResourceChange () {

            },

            validate () {
                this.$emit('success')
                // this.isChecking = true

                // const form = this.$refs.validateForm
                // form.validate().then(async () => {
                //     try {
                //         const params = {
                //             userList: [],
                //             name: this.formData.name
                //         }
                //         this.formData.member.forEach((item) => {
                //             const arr = item.split('|||')
                //             params.userList.push({
                //                 username: arr[0],
                //                 chinese_name: arr[1]
                //             })
                //         })
                //         await this.$store.dispatch('createUserGroup', params)
                //         this.$emit('success')
                //     } catch (e) {
                //         console.error(e)
                //     }
                // }, () => {
                //     this.isChecking = false
                // })
            },

            /**
             * 隐藏创建 sideslider
             */
            hide () {
                this.$emit('hide-sideslider', false)
                this.resetFormData()
                this.isChecking = false
                const form = this.$refs.validateForm
                form && form.clearError()
            },
            showUpdate (row) {
                this.isShowSideslider = true
                this.curUpdate = Object.assign({}, row)
            },

            hideSideslider () {
                this.isShowSideslider = false
                this.curUpdate = Object.assign({}, {})
            },

            async sidesliderSuccess () {
                this.hideSideslider()
                this.setLoading(true)
                setTimeout(async () => {
                    await this.preload()
                    this.setLoading(false)
                }, 300)
            },

            deleteAction (row) {
                if (row.actionId === 'access_page') {
                    return
                }
                console.error(row)
            }
        }
    }

    // @Component
    // export default class Create extends Vue {
    //     @Prop({ type: Boolean, default: false })
    //     isShow!: boolean;

    //     private isLoading = false
    //     private isVisible = false

    //     private formData: any = {
    //         name: '',
    //         member: []
    //     }

    //     private rules: any = {
    //         name: [
    //             {
    //                 required: true,
    //                 message: '请填写组名',
    //                 trigger: 'blur'
    //             },
    //             {
    //                 validator: this.checkName,
    //                 message: '组名已被占用',
    //                 trigger: 'blur'
    //             }
    //         ],
    //         member: [
    //             {
    //                 validator: (val: string) => {
    //                     return val.length >= 1
    //                 },
    //                 message: '请选择用户',
    //                 trigger: 'blur'
    //             }
    //         ]
    //     }

    //     private isChecking = false

    //     @State('user') user!: any
    //     @State('allRTXList') allRTXList!: any[]

    //     @Watch('isShow', { immediate: true })
    //     isShowChange (newVal: boolean) {
    //         this.isVisible = newVal
    //         if (this.isVisible) {
    //             this.isLoading = true
    //         }
    //     }

    //     async preload () {
    //         // }
    //     }

    //     /**
    //      * 服务名字校验
    //      *
    //      * @param {string} val 要校验的服务名字
    //      */
    //     async checkName (val: string) {
    //         try {
    //             await this.$store.dispatch('checkUserGroupName', {
    //                 id: 0,
    //                 name: val.trim()
    //             })
    //             return true
    //         } catch (e) {
    //             console.error(e)
    //             return false
    //         }
    //     }

    //     /**
    //      * form 验证函数
    //      */
    //     validate () {
    //         this.isChecking = true

    //         const form: any = this.$refs.validateForm
    //         form.validate().then(async () => {
    //             try {
    //                 const params: any = {
    //                     userList: [],
    //                     name: this.formData.name
    //                 }
    //                 this.formData.member.forEach((item: any) => {
    //                     const arr: any[] = item.split('|||')
    //                     params.userList.push({
    //                         username: arr[0],
    //                         chinese_name: arr[1]
    //                     })
    //                 })
    //                 await this.$store.dispatch('createUserGroup', params)
    //                 this.$emit('create-success')
    //             } catch (e) {
    //                 console.error(e)
    //             }
    //         }, () => {
    //             this.isChecking = false
    //         })
    //     }

</script>

<style lang="postcss" scoped>
    .create-sideslider {
        .wrapper {
            width: 100%;
            height: calc(100vh - 60px);
            padding: 30px 25px;
        }
    }

</style>
