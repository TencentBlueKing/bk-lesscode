<template>
    <section>
        <bk-radio-group
            class="g-prop-radio-group "
            :value="buildInVariableStatus.buildInVariableType"
            @change="handleVariableTypeChange">
            <bk-radio-button
                v-for="(item, index) in BUILDIN_VARIABLE_TYPE_LIST"
                :key="index"
                :value="item.VAL">
                {{ $t(item.NAME) }}
            </bk-radio-button>
        </bk-radio-group>
        <div
            class="inner-variable"
            v-if="buildInVariableStatus.buildInVariableType === 'SYSTEM'"
        >
            <span class="inner-variable-txt">{{$t('内置变量：')}}{{ buildInVariableStatus.buildInVariable }}</span>
            <i
                class="bk-icon icon-info"
                v-bk-tooltips="{
                    content: buildInVariableTip,
                    maxWidth: '300',
                    placements: ['left-start'],
                    boundary: 'window'
                }"
            ></i>
            <i class="bk-icon icon-copy" @click="copyBuildInVariable"></i>
        </div>
        <template v-else>
            <span class="custom-variable">{{ $t('自定义变量') }}</span>
            <variable-select
                :options="option"
                :form-data="{ code: buildInVariableStatus.payload.customVariableCode }"
                :remote-config="{ show: false }"
                :is-choose-custom-variable="true"
                @on-change="handleCustomVariableChange"
            />
        </template>
    </section>
</template>

<script lang="ts">
    import {
        BUILDIN_VARIABLE_TYPE_LIST
    } from 'shared/variable'
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        execCopy
    } from '@/common/util'
    import variableSelect from './variable-select/components/variable.vue'

    export default defineComponent({
        components: {
            variableSelect
        },

        props: {
            // 内置变量名
            buildInVariable: {
                type: String,
                default: ''
            },
            // 变量类型
            buildInVariableType: {
                type: String
            },
            // 内含变量 code
            payload: {
                type: Object
            },
            // 组件 id
            componentId: {
                type: String
            },
            // 属性或者插槽名称
            name: {
                type: String
            },
            option: {
                type: Object
            }
        },

        setup (props, { emit }) {
            // 状态
            const buildInVariableStatus = ref({
                buildInVariable: props.buildInVariable,
                buildInVariableType: props.buildInVariableType || BUILDIN_VARIABLE_TYPE_LIST[0].VAL,
                payload: {
                    ...props.payload,
                    customVariableCode: props.payload?.customVariableCode
                }
            })
            const buildInVariableTip = window.i18n.t('{0} 属性有内置变量，可以在函数中使用【lesscode.{1}.{2}】关键字唤起自动补全功能来使用该变量，或直接使用 this.{3} 来使用该变量。属性面板配置的值将作为变量的初始值。通过变量可以获取或者修改本属性的值', [props.name, props.componentId, props.name, props.buildInVariable])

            // 方法
            const copyBuildInVariable = () => {
                execCopy(`this.${props.buildInVariable}`)
            }

            const handleVariableTypeChange = (buildInVariableType) => {
                buildInVariableStatus.value.buildInVariableType = buildInVariableType
                triggleChange()
            }

            const handleCustomVariableChange = ({ code }) => {
                buildInVariableStatus.value.payload.customVariableCode = code
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', buildInVariableStatus.value)
            }

            watch(
                () => props.buildInVariableType,
                (buildInVariableType) => {
                    buildInVariableStatus.value.buildInVariableType = buildInVariableType || BUILDIN_VARIABLE_TYPE_LIST[0].VAL
                }
            )

            watch(
                () => props.payload.customVariableCode,
                (val) => {
                    buildInVariableStatus.value.payload.customVariableCode = val
                }
            )

            return {
                BUILDIN_VARIABLE_TYPE_LIST,
                buildInVariableStatus,
                buildInVariableTip,
                copyBuildInVariable,
                handleVariableTypeChange,
                handleCustomVariableChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";
    .inner-variable {
        font-size: 12px;
        line-height: 32px;
        display: block;
        width: 100%;
        background: #F5F7FA;
        padding: 0 6px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        .bk-icon {
            cursor: pointer;
            color: #3A84FF;
            &:nth-child(2) {
                margin-left: 12px;
            }
            &:last-child {
                margin-left: 8px;
            }
        }
        .inner-variable-txt {
             @mixin ellipsis 75%, inline-block;
        }
    }
    .custom-variable {
        font-size: 12px;
        line-height: 20px;
        margin: 4px 0 6px;
        display: inline-block;
    }
</style>
