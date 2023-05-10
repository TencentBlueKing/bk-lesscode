<template>
    <div class="determine-value">
        <bk-input
            v-if="!field.type"
            v-model="localVal"
            :disabled="disabled"
            @change="update">
        </bk-input>
        <bk-select
            :key="field.key"
            v-else-if="['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(field.type)"
            v-model="localVal"
            :multiple="['MULTISELECT', 'CHECKBOX'].includes(field.type)"
            :disabled="disabled"
            @change="update">
            <bk-option v-for="choice in field.choice" :key="choice.key" :id="choice.key" :name="choice.name"> </bk-option>
        </bk-select>
        <bk-input
            v-else-if="field.type === 'DESC'"
            type="textarea"
            v-model="localVal"
            :disabled="disabled"
            @change="update">
        </bk-input>
        <bk-button
            v-else-if="field.type === 'RICHTEXT'"
            style="padding: 0"
            size="small"
            theme="primary"
            :text="true"
            @click="richTextVisible = true">
            {{ $t('前往设置') }} </bk-button>
        <field-item
            v-else
            :field="field"
            :use-fixed-data-source="true"
            :value="localVal"
            :disabled="disabled"
            :show-label="false"
            @change="handleFieldValueChange">
        </field-item>
        <bk-dialog
            v-model="richTextVisible"
            theme="primary"
            :title="$t('内容配置')"
            header-position="left"
            :width="960"
            :mask-close="false"
            @confirm="update"
            @cancel="localVal = ''">
            <field-item
                :field="field"
                :use-fixed-data-source="true"
                :value="localVal"
                :disabled="disabled"
                :show-label="false"
                @change="localVal = $event">
            </field-item>
        </bk-dialog>
    </div>
</template>
<script>
    // 表单字段编辑时填写默认值组件
    import cloneDeep from 'lodash.clonedeep'
    import FieldItem from '@/components/flow-form-comp/form/fieldItem.vue'
    
    export default {
        name: 'DetermineValue',
        components: {
            FieldItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
           
                richTextVisible: false,
                localVal: this.getLocalVal()
            }
        },
        computed: {
            selectType () {
                return ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(this.field.type)
            }
        },
        watch: {
            field () {
                this.localVal = this.getLocalVal()
            }
        },
        methods: {
            getLocalVal () {
                const { type, default: defaultVal } = this.field
                let dftVal
                if (['MULTISELECT', 'CHECKBOX', 'MEMBERS', 'MEMBER'].includes(type) && !Array.isArray(defaultVal)) {
                    dftVal = defaultVal ? defaultVal.split(',') : []
                } else {
                    dftVal = cloneDeep(defaultVal)
                }
                return dftVal
            },
            
            handleFieldValueChange (val) {
                this.localVal = val
                this.update()
            },
            update () {
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    /deep/ .field-form-item{
        margin-top: 0;
    }
    .bk-select {
        background: #ffffff;
    }
</style>
