<template>
    <!-- 渲染在表单页面的组件单位 -->
    <div
        :class="[
            'field-element',
            {
                'disabled': disabled,
                'half-row': field.layout === 'COL_6',
                'ms-enter': isHover && curfield.key !== field.key
            }
        ]"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="$emit('action', 'edit')">
        <div
            class="actions-area"
            v-show="!disabled && (curfield.key === field.key || isHover)">
            <span class="field-key">{{fieldKey}}</span>
            <span class="operate-btn"><i class="bk-icon icon-copy" @click.stop="$emit('action', 'copy')"></i></span>
            <span class="operate-btn"> <i class="bk-drag-icon bk-drag-shanchu" @click.stop="$emit('action', 'delete')"></i></span>
        </div>
        <div class="field-container">
            <div class="field-container-mask"></div>
            <!-- 渲染具体的表单组件 -->
            <field-item :field="field" :value="localValue[field.key]"></field-item>
        </div>
    </div>
</template>
<script>
    import FieldItem from '@/components/flow-form-comp/form/fieldItem.vue'

    export default {
        name: 'FieldElement',
        components: {
            FieldItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            curfield: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean
        },
        data () {
            return {
                isHover: false,
                localValue: {}
            }
        },
        computed: {
            fieldKey () {
                const field = this.isHover ? this.field : this.curfield
                const { type, key } = field
                return `${type}-${key}`
            }
        },
        watch: {
            field: {
                handler (val) {
                    this.getDefaultVal(val)
                },
                immediate: true
            }
        },
        methods: {
            getDefaultVal (val) {
                const fieldsValue = {}
                if ('default' in val) {
                    if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS', 'TABLE', 'IMAGE', 'FILE'].includes(val.type)) {
                        fieldsValue[val.key] = val.default ? val.default.split(',') : []
                    } else {
                        fieldsValue[val.key] = val.default
                    }
                }
                this.localValue = fieldsValue
            },
            handleMouseEnter () {
                if (this.disabled) {
                    return
                }
                this.isHover = true
            },
            handleMouseLeave () {
                if (this.disabled) {
                    return
                }
                this.isHover = false
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .field-element {
        position: relative;
        display: inline-block;
        padding: 12px;
        width: 100%;
        min-height: 86px;
        border: 1px solid transparent;
        vertical-align: top;
        transition: background 0.2s ease-in-out, border 0.2s ease-in-out;
        &:not(.disabled) {
            cursor: move;
        }
        &:first-child {
            margin-top: 24px;
        }
        &:hover {
            background: #fafbfd;
            border: 1px dashed #3a84ff;
        }
        &.ms-enter {
            .field-key {
                background: #a3c5fd;
            }
            .operate-btn {
                display: none;
            }
        }
        &.half-row {
            width: 50%;
            &:nth-of-type(2){
                margin-top: 24px;
            }
        }
    }
    .field-container {
        .field-container-mask {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
        }
        .field-form-item {
            margin: 0 !important;
            width: 100%;
        }
    }
    .drag-icon-wrapper {
        position: absolute;
        left: 12px;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        color: #c4c6cc;
        z-index: 2;
    }
    .actions-area {
        position: absolute;
        left: 0;
        top: -25px;
        display: inline-flex;
        padding-bottom: 5px;
        z-index: 999;
        cursor: pointer;
        span{
            display: block;
            text-align: center;
            margin-right: 2px;
            background: #3a84ff;
            color: #fff;
            border-radius: 2px;
            &:hover {
                background: #1964e1;
            }
        }
        .field-key{
            display: block;
            padding:0 4px ;
            font-size: 12px;
            line-height: 20px;
            max-width: 300px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .operate-btn{
            width: 20px;
            height: 20px;
        }
    }
    .slide-left-enter,
    .slide-left-leave-to {
        right: -36px;
    }
    .slide-left-enter-to,
    .slide-leave {
        right: 0;
    }
    .slide-left-enter-active,
    .slide-left-leave-active {
        transition: right 0.2s ease-in-out;
    }
</style>
