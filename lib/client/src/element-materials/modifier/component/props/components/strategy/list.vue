<template>
    <section>
        <vue-draggable
            class="group-list"
            handle=".bk-drag-grag-fill"
            :list="optionList"
            :group="{ name: 'table-col', pull: false, put: false }"
            @change="trigger">
            <bk-popover
                v-for="(item, index) in optionList"
                class="list-item"
                :key="`option${index}`"
                placement="left-start"
                trigger="click"
                theme="light"
                ext-cls="g-popover-empty-padding"
                width="320"
            >
                <span
                    class="item-content"
                    v-bk-overflow-tips="{
                        content: item[currentConfig.displayKey],
                        placement: 'left-start',
                        width: 200,
                        boundary: 'window'
                    }"
                >
                    <i class="bk-drag-icon bk-drag-grag-fill" />
                    {{ item[currentConfig.displayKey] }}
                </span>
                <i class="bk-icon icon-minus-circle" @click="handleDelete(index)"></i>
                <section slot="content">
                    <section class="template-item-list">
                        <div
                            v-for="(option, idx) in currentConfig.template"
                            class="template-item"
                            :key="idx"
                        >
                            <div class="label">{{option.name}}</div>
                            <bk-input
                                v-if="option.type === 'input'"
                                :value="item[option.key]"
                                @change="val => handleChange(val, option.key, index)" />
                            <bk-radio
                                v-else-if="option.type === 'radio'"
                                :checked="item[option.key]"
                                @change="val => handleCheckChange(val, option.key, index)" />
                            <bk-checkbox
                                v-else-if="option.type === 'checkbox'"
                                :checked="item[option.key]"
                                @change="val => handleChange(val, option.key, index)" />
                            <icon
                                v-else-if="option.type === 'icon'"
                                :default-value="item[option.key]"
                                :include-number="true"
                                :change="val => handleChange(val, option.key, index)"></icon>
                            <src-input v-else-if="option.type === 'src-input'"
                                :value="item[option.key]"
                                v-bind="option.props"
                                @change="val => handleChange(val, option.key, index)"
                            />
                        </div>
                    </section>
                </section>
            </bk-popover>
        </vue-draggable>
        <span class="content-add" @click="handleAdd">
            <i class="bk-icon icon-plus-circle"></i>
            {{ $t('添加') }} </span>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'
    import Icon from '@/components/modifier/icon-select.vue'
    import SrcInput from '@/components/src-input/index.vue'

    interface ICurrentConfig {
        displayKey: string,
        template: any[],
        generateFunc: (index) => {}
    }

    const configMap = {
        'step': {
            template: [
                {
                    name: 'title',
                    key: 'title',
                    type: 'input'
                }, {
                    name: 'icon',
                    key: 'icon',
                    type: 'icon'
                }, {
                    name: window.i18n.t('步骤描述'),
                    key: 'description',
                    type: 'input'
                }
            ],
            generateFunc: index => ({
                title: window.i18n.t('步骤{0}', [index]),
                icon: index,
                description: ''
            }),
            displayKey: 'title'
        },
        'srcset': {
            template: [
                {
                    name: 'url',
                    key: 'url',
                    type: 'src-input',
                    props: {
                        fileType: 'img'
                    }
                }, {
                    name: 'link',
                    key: 'link',
                    type: 'input'
                }
            ],
            generateFunc: index => ({
                url: '',
                link: ''
            }),
            displayKey: 'url'
        }
    }

    export default defineComponent({
        components: {
            Icon,
            SrcInput
        },

        props: {
            name: {
                type: String,
                required: true
            },
            defaultValue: {
                type: Array,
                required: true
            },
            payload: {
                type: Object,
                default: () => ({})
            },
            change: {
                type: Function,
                default: (slot) => {}
            },
            type: {
                type: String
            }
        },

        setup (props) {
            const optionList = ref<Array<any>>(props.defaultValue)
            const currentConfig = ref<ICurrentConfig>(configMap[props.type])

            const trigger = () => {
                props.change(props.name, JSON.parse(JSON.stringify(optionList.value)), props.type, props.payload)
            }

            const handleDelete = (index) => {
                if (optionList.value.length === 1) {
                    return
                }
                optionList.value.splice(index, 1)
                trigger()
            }

            const handleChange = (value, key, index) => {
                optionList.value[index][key] = value
                trigger()
            }

            const handleCheckChange = (value, key, index) => {
                if (value) {
                    optionList.value = optionList.value.map((item, itemIndex) => {
                        item[key] = itemIndex === index
                        return item
                    })
                } else {
                    optionList.value[index][key] = value
                }
                trigger()
            }

            const handleAdd = () => {
                optionList.value.push(currentConfig.value.generateFunc(optionList.value.length + 1))
                trigger()
            }

            return {
                optionList,
                currentConfig,
                trigger,
                handleDelete,
                handleChange,
                handleCheckChange,
                handleAdd
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .group-list {
        margin-top: 4px;
        .list-item {
            line-height: 32px;
            margin-bottom: 8px;
            font-size: 12px;
            display: block;
            .item-content {
                background: #F5F7FA;
                border-radius: 2px;
                height: 32px;
                display: inline-block;
                width: calc(100% - 26px);
                padding: 0 8px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &:hover {
                    background: #EAEBF0;
                }
            }
            .icon-minus-circle {
                cursor: pointer;
                margin-left: 6px;
                color: #979ba5;
                font-size: 14px;
                &:hover {
                    color: #63656e;
                }
            }
            ::v-deep .bk-tooltip-ref {
                display: flex;
                align-items: center;
            }
        }
    }
    .content-add {
        color: #3A84FF;
        cursor: pointer;
        font-size: 12px;
    }
    .template-item-list {
        padding: 10px 16px 16px;
    }
    .template-item {
        margin-top: 12px;
        &:first-child {
            margin-top: 0;
        }
        .label {
            font-size: 12px;
            line-height: 20px;
            margin-bottom: 6px;
        }
    }
</style>
