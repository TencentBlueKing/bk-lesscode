<template>
    <article class="page-variable-home">
        <header class="page-variable-header">
            <h3 class="variable-header-title">{{ $t('本页面可用变量详情') }}
                <bk-button :text="true" title="primary" @click="showVariableForm" class="add-button">
                    <i class="bk-drag-icon bk-drag-add-line"></i>
                    {{ $t('新建变量') }} </bk-button>
            </h3>
            <span>{{ $t('应用级变量的修改，请跳转至') }}
                <a :href="`/project/${projectId}/variable-manage`" target="_blank" class="variable-header-link">
                    {{ $t('变量管理') }} <i class="bk-drag-icon bk-drag-jump-link"></i>
                </a>
            </span>
        </header>

        <variable-table simple-display />

        <variable-form
            :is-show.sync="variableFormData.isShow"
            :form-data="variableFormData.formData"
        />
    </article>
</template>

<script>
    import variableTable from '@/components/variable/variable-table.vue'
    import VariableForm from '@/components/variable/variable-form/index.vue'

    export default {
        components: {
            variableTable,
            VariableForm
        },

        data () {
            return {
                variableFormData: {
                    isShow: false,
                    formData: {}
                }
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },

        methods: {
            showVariableForm () {
                this.variableFormData = {
                    isShow: true,
                    formData: {}
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .page-variable-home {
        padding: 28px 30px;
        overflow: auto;
        /* border: 1px solid #DCDEE5; */
    }
    .page-variable-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 19px;
        font-size: 12px;
        margin-bottom: 15px;
        .variable-header-title {
            margin: 0 38px 0 0;
            font-size: 14px;
        }
        .variable-header-link {
            color: #3a84ff;
            .bk-drag-jump-link {
                font-size: 14px;
            }
        }
    }
    .add-button {
        font-size: 12px;
        margin-left: 6px;
        /deep/ span {
            display: flex;
            align-items: center;
            .bk-drag-add-line {
                margin-right: 3px;
            }
        }
    }
</style>
