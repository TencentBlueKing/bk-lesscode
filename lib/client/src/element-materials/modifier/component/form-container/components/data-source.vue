<template>
    <prop-group :title="$t('表单数据')">
        <div class="data-source-setting">
            <section class="bk-button-group">
                <bk-button
                    :class="['type-btn-item', { 'is-selected': localVal.type === 'NEW_FORM' }]"
                    @click="handleTypeChange('NEW_FORM')">
                    <span class="btn-text">{{ $t('新建表') }}</span>
                </bk-button>
                <bk-popconfirm
                    :title="$t('确认切换成复用？')"
                    :content="$t('切换后将会替换掉表单容器后的所有内容，且不支持更改，请谨慎操作！')"
                    width="288"
                    trigger="click"
                    placement="bottom-end"
                    class="type-btn-item"
                    :disabled="localVal.type === 'USE_FORM'"
                    @confirm="handleReuseconfirm">
                    <bk-button
                        :class="{ 'is-selected': localVal.type === 'USE_FORM' }"
                        @click="handleTypeChange('USE_FORM')">
                        <span v-bk-tooltips.top="$t('可以通过“复用已有的表” 进行表单渲染以及数据存储')" class="btn-text subline">{{ $t('复用已有表') }}</span>
                    </bk-button>
                </bk-popconfirm>
            </section>
            <section v-if="localVal.type === 'NEW_FORM'">
                <span
                    v-bk-tooltips.top="$t('仅引用已有表进行表单渲染，可任意更改，不会影响原表数据')"
                    class="g-prop-sub-title subline g-mt8 g-mb6">
                    {{ $t('引用已有表') }}
                </span>
                <bk-select
                    :value="localVal.relatedId"
                    :loading="formListLoading"
                    :clearable="false"
                    @toggle="handleSelectOpen"
                    @selected="handleSeletedRelatedForm">
                    <bk-option v-for="item in formList" :key="item.id" :id="item.id" :name="item.formName" />
                </bk-select>
            </section>
            <section v-else>
                <span class="g-prop-sub-title g-mt8 g-mb6">{{ $t('复用数据表') }}</span>
                <bk-select
                    :value="localVal.relatedId"
                    size="small"
                    :loading="formListLoading"
                    :clearable="false"
                    @selected="handleSeletedRelatedForm">
                    <bk-option v-for="item in formList" :key="item.id" :id="item.id" :name="item.formName" />
                </bk-select>
            </section>
        </div>
    </prop-group>
</template>
<script>
import { mapGetters } from 'vuex'
import propGroup from './prop-group.vue'

export default {
    name: '',
    components: {
        propGroup
    },
    props: {
        value: {
            type: Object,
            default: () => {
                return {
                    type: 'NEW_FORM',
                    relatedId: 0,
                    id: 0
                }
            }
        }
    },
    data () {
        return {
            localVal: { ...this.value },
            formListLoading: false,
            formList: []
        }
    },
    computed: {
        ...mapGetters('projectVersion', ['currentVersionId'])
    },
    watch: {
        value (val) {
            this.localVal = { ...val }
        }
    },
    mounted () {
        this.getFormList()
    },
    methods: {
        async getFormList () {
            this.formListLoading = true
            const params = {
                projectId: this.$route.params.projectId,
                versionId: this.currentVersionId
            }
            const res = await this.$store.dispatch('nocode/form/getNewFormList', params)
            this.formList = res.filter(item => item.id !== this.localVal.id)
            this.formListLoading = false
        },
        handleTypeChange (val) {
            if (this.localVal.type === val || val === 'USE_FORM') {
                return
            }
            this.localVal.type = val
            this.localVal.relatedId = ''
            this.$emit('updateFields', [])
            this.change()
        },
        handleReuseconfirm () {
            this.localVal.type = 'USE_FORM'
            this.localVal.relatedId = ''
            this.$emit('updateFields', [])
            this.change()
        },
        handleSelectOpen (val) {
            if (val) {
                this.getFormList()
            }
        },
        handleSeletedRelatedForm (val) {
            this.localVal.relatedId = val
            const fields = JSON.parse(this.formList.find(item => item.id === val).content)
            this.$emit('updateFields', fields)
            this.change()
        },
        change () {
            this.$emit('change', { ...this.localVal })
        }
    }
}
</script>
<style lang="postcss" scoped>
    .bk-button-group {
        width: 100%;
        .type-btn-item {
            width: 50%;
        }
        .btn-text {
            font-size: 12px;
        }
        >>> .bk-tooltip-ref {
            width: 100%;
            .bk-button {
                width: 100%;
            }
        }
        >>> .bk-button {
            &.is-selected {
                background: #ffffff;
                .subline {
                    border-color: #3a84ff;
                }
            }
        }
    }
    .subline {
        border-bottom: 1px dashed #63656e;
        cursor: pointer;
    }
</style>
