<template>
    <section class="render-prop">
        <div class="prop-name" @click="fold = !fold">
            <i :class="['bk-icon icon-angle-down', { fold }]"></i>
            <div
                :class="{ 'has-tips': showTips }"
                v-bk-tooltips="{
                    disabled: !showTips,
                    content: config.tips,
                    maxWidth: 400
                }">
                {{ config.propertyDisplayName }}
                <template v-if="config.type">({{ config.type | caseConversion }})</template>
            </div>
        </div>
        <div v-if="!fold" class="prop-value">
            <icon-select
                v-if="['icon', 'icon-right'].includes(config.propertyDisplayName)"
                type="string"
                :default-value="localVal.val || ''"
                :name="config.propertyDisplayName"
                :change="handleIconChange">
            </icon-select>
            <bk-switcher v-else-if="config.type === 'boolean'" v-model="localVal.val" theme="primary" size="small" @change="$emit('change', localVal)"></bk-switcher>
            <bk-select v-else-if="Array.isArray(config.options)" v-model="localVal.val" @change="$emit('change', localVal)">
                <bk-option v-for="item in config.options" :key="item" :id="item" :name="item"></bk-option>
            </bk-select>
            <bk-input v-else v-model="localVal.val" @change="$emit('change', localVal)"></bk-input>
        </div>
    </section>
</template>
<script>
    import { toPascal } from 'shared/util'
    import IconSelect from '@/element-materials/modifier/component/props/components/strategy/icon.vue'

    export default {
        name: 'RenderProp',
        filters: {
            caseConversion (val) {
                return toPascal(val)
            }
        },
        components: {
            IconSelect
        },
        props: {
            config: Object
        },
        data () {
            return {
                fold: false,
                localVal: { ...this.config }
            }
        },
        computed: {
            showTips () {
                return !!this.config.tips
            }
        },
        watch: {
            config (val) {
                this.localVal = { ...val }
            }
        },
        methods: {
            handleIconChange (name, val) {
                this.localVal.val = val
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .prop-name {
        display: flex;
        align-items: center;
        height: 40px;
        font-size: 12px;
        font-weight: bold;
        color: #313238;
        border-top: 1px solid #eaebf0;
        cursor: pointer;
        .icon-angle-down {
            margin-left: -5px;
            margin-right: 3px;
            font-size: 20px;
            cursor: pointer;
            transition: transform 200ms;
            &.fold {
                transform: rotate(-90deg);
            }
        }
        .has-tips {
            border-bottom: 1px dashed #313238;
        }
    }
    .prop-value {
        margin-bottom: 16px;
    }
</style>
