<template>
    <section class="default-value">
        <bk-input
            v-if="['textarea', 'description'].includes(field.type)"
            type="textarea"
            :disabled="disabled"
            :value="value"
            @change="handleChange" />
        <bk-input
            v-else-if="field.type === 'int'"
            type="number"
            :disabled="disabled"
            :value="value"
            @change="handleChange" />
        <bk-date-picker
            v-else-if="['date', 'datetime'].includes(field.type)"
            :type="field.type"
            :transfer="true"
            :disabled="disabled"
            :value="value"
            @change="handleChange"/>
        <bk-select
            v-else-if="['select', 'multiple-select', 'radio', 'checkbox'].includes(field.type)"
            :multiple="['multiple-select', 'checkbox'].includes(field.type)"
            :disabled="disabled"
            :value="value"
            @change="handleChange">
            <bk-option
                v-for="item in dataSourceList"
                :key="item.id"
                :id="item.id"
                :name="item.label">
            </bk-option>
        </bk-select>
        <bk-rate v-else-if="field.type === 'rate'" :rate="value" :edit="!disabled" @score="handleChange" />
        <bk-user-selector
            v-else-if="['member', 'members'].includes(field.type)"
            :api="`${host}/api/c/compapi/v2/usermanage/fs_list_users/`"
            :multiple="field.type === 'members'"
            :disabled="disabled"
            :value="value"
            @change="handleChange" />
        <rich-text-value-editor v-else-if="field.type === 'rich-text'" :value="value" :disabled="disabled" @change="handleChange" />
        <bk-input
            v-else
            :placeholder="$t('默认值')"
            :disabled="disabled"
            :value="value"
            @change="handleChange">
        </bk-input>
    </section>
</template>
<script>
import bkUserSelector from '@blueking/user-selector'
import { transDataSourceValue } from '../../utils/data-source'
import richTextValueEditor from './rich-text-value-editor'

export default {
    name: 'defaultValue',
    components: {
        bkUserSelector,
        richTextValueEditor
    },
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
        disabled: Boolean,
        value: [String, Array, Number, Object]
    },
    data () {
        return {
            host: process.env.BK_USER_MANAGE_HOST || '',
            dataSourceList: [],
            dataSourceListLoding: false
        }
    },
    computed: {
        dataSource () {
            return this.field.configure?.dataSource || null
        }
    },
    watch: {
        'dataSource': {
            handler: async function (config) {
                if (config) {
                    this.dataSourceList = []
                    this.dataSourceListLoding = true
                    this.dataSourceList = await transDataSourceValue(config, this)
                    this.dataSourceListLoding = false
                }
            },
            immediate: true
        }
    },
    methods: {
        handleChange (val) {
            this.$emit('change', val)
        }
    }
}
</script>
<style lang="postcss" scoped>
    .user-selector,
    .bk-date-picker {
        width: 100%;
    }
    .bk-select {
        background: #ffffff;
    }
</style>
