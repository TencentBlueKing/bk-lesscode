<template>
    <lc-form :label-width="180" :model="form" ref="funcForm" :form-type="formType" class="func-form-bottom">
        <lc-form-item
            :rules="[requireRule($t('应用'))]"
            :label="$t('应用')"
            property="projectId"
            error-display-type="normal"
            required>
            <bk-select
                :clearable="false"
                :loading="isLoading"
                :disabled="disabled"
                @toggle="handleToggleSelect"
                @selected="handleSelectProject">
                <bk-option v-for="option in projectList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.projectName">
                </bk-option>
            </bk-select>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'
    import { mapActions } from 'vuex'

    export default {
        mixins: [mixins],

        data () {
            return {
                projectList: [],
                isLoading: false
            }
        },

        methods: {
            ...mapActions('project', ['query']),

            handleToggleSelect (isExpand) {
                if (isExpand) {
                    this.isLoading = true
                    this.query({}).then((res = {}) => {
                        this.projectList = res.projectList || []
                    }).catch((err) => {
                        this.messageError(err.message || err)
                    }).finally(() => {
                        this.isLoading = false
                    })
                }
            },

            handleSelectProject (projectId) {
                this.updateValue({
                    projectId,
                    funcGroupId: ''
                })
            }
        }
    }
</script>
