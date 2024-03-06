<template>
    <lc-sideslider
        :is-show="isShow"
        :width="740"
        :title="title"
        :transfer="true"
        @update:isShow="closeForm"
    >
        <div slot="content">
            <lc-form
                class="edit-data-form"
                ref="formRef"
                form-type="vertical"
                :model="editForm"
                :label-width="300"
            >
                <lc-form-item
                    :label="$t('域名')"
                    :required="true"
                    :rules="getRequireRule('域名')"
                    property="host"
                    error-display-type="normal"
                >
                    <bk-input
                        v-model="editForm.host"
                        :disabled="!!form.id"
                    ></bk-input>
                </lc-form-item>
                <lc-form-item
                    :label="$t('端口')"
                    :required="true"
                    :rules="getRequireRule('端口')"
                    property="port"
                    error-display-type="normal"
                >
                    <bk-input
                        v-model="editForm.port"
                        :disabled="!!form.id"
                    ></bk-input>
                </lc-form-item>
                <lc-form-item
                    :label="$t('数据库名')"
                    :required="true"
                    property="dbName"
                    :rules="getRequireRule('数据库名')"
                    error-display-type="normal"
                >
                    <bk-input
                        v-model="editForm.dbName"
                        :disabled="!!form.id"
                    ></bk-input>
                </lc-form-item>
                <lc-form-item
                    :label="$t('用户名')"
                    :required="true"
                    property="username"
                    :rules="getRequireRule('用户名')"
                    error-display-type="normal"
                >
                    <bk-input
                        v-model="editForm.username"
                    ></bk-input>
                </lc-form-item>
                <lc-form-item
                    :label="$t('密码')"
                    :required="true"
                    property="password"
                    :rules="getRequireRule('密码')"
                    error-display-type="normal"
                >
                    <bk-input
                        v-model="editForm.password"
                        type="password"
                    ></bk-input>
                </lc-form-item>
                <lc-form-item style="margin-top: 20px;">
                    <bk-button
                        theme="primary"
                        class="mr5"
                        :loading="isSaving"
                        @click="confirmSubmitData"
                    >{{ $t('提交') }}</bk-button>
                    <bk-button
                        :disabled="isSaving"
                        @click="closeForm"
                    >{{ $t('取消') }}</bk-button>
                </lc-form-item>
            </lc-form>
        </div>
    </lc-sideslider>
</template>

<script>
    export default {
        props: {
            form: Object,
            isShow: Boolean,
            isSaving: Boolean,
            title: String
        },

        data () {
            return {
                editForm: {}
            }
        },

        watch: {
            isShow () {
                if (this.isShow) {
                    this.editForm = JSON.parse(JSON.stringify(this.form))
                }
            }
        },

        methods: {
            getRequireRule (name) {
                return [{
                    required: true,
                    message: window.i18n.t('{0} 是必填项', [name]),
                    trigger: 'blur'
                }]
            },

            confirmSubmitData () {
                this.$refs.formRef.validate().then(() => {
                    this.$emit('submit', this.editForm)
                })
            },

            closeForm () {
                this.$emit('close')
            }
        }
    }
</script>

<style lang="postcss">
.edit-data-form {
    padding: 20px;
}
</style>
