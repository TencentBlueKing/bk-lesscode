<template>
    <section class="default-value">
        <bk-input
            v-if="['textarea', 'description'].includes(field.type)"
            type="textarea"
            :value="value"
            @change="handleChange" />
        <bk-input
            v-else-if="field.type === 'int'"
            type="number"
            :value="value"
            @change="handleChange" />
        <bk-date-picker
            v-else-if="['date', 'datetime'].includes(field.type)"
            :type="field.type"
            :value="value"
            @change="handleChange"/>
        <bk-select
            v-else-if="['select', 'multiple-select', 'radio', 'checkbox'].includes(field.type)"
            :multiple="['multiple-select', 'checkbox'].includes(field.type)"
            :value="value"
            @change="handleChange">
            <bk-option
                v-for="item in field.configure.dataSource.data"
                :key="item.id"
                :id="item.id"
                :name="item.label">
            </bk-option>
        </bk-select>
        <bk-rate v-else-if="field.type === 'rate'" :rate="value" @score="handleChange" />
        <bk-user-selector
            v-else-if="['member', 'members'].includes(field.type)"
            :api="`${host}/api/c/compapi/v2/usermanage/fs_list_users/`"
            :multiple="field.type === 'members'"
            :value="value"
            @change="handleChange" />
        <bk-input
            v-else
            placeholder="默认值"
            :value="value"
            @change="handleChange">
        </bk-input>
    </section>
</template>
<script>
import bkUserSelector from '@blueking/user-selector'

export default {
    name: 'defaultValue',
    components: {
        bkUserSelector
    },
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
        value: [String, Array, Number, Object]
    },
    data () {
        return {
            host: process.env.BK_USER_MANAGE_HOST || ''
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
</style>
