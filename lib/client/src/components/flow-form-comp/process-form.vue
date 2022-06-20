<template>
    <div class="process-form-comp">
        <template v-if="fields.length > 0">
            <form-fields
                :fields="fields"
                :value="value"
                @change="(key,$event) => value = $event">
            </form-fields>
            <div class="operate-btns">
                <bk-button
                    theme="primary"
                    style="min-width: 88px; margin-right: 4px;">
                    提交
                </bk-button>
                <bk-button>暂存</bk-button>
            </div>
        </template>
        <bk-exception v-else type="empty" class="empty-form-fields">暂无数据</bk-exception>
    </div>
</template>
<script>
    import FormFields from './form/index.vue'

    export default {
        name: 'ProcessForm',
        components: {
            FormFields
        },
        props: {
            type: {
                type: String,
                default: ''
            },
            fields: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                value: {}
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .process-form-comp {
        padding: 24px;
        height: 100%;
        background: #ffffff;
    }
    .empty-form-fields {
        padding: 200px 0 140px;
        >>> .bk-exception-text {
            margin-top: -40px;
            font-size: 14px;
        }
    }
    .operate-btns {
        margin-top: 32px;
    }
</style>
