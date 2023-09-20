<template>
    <render-wrapper @delete="handleDelete">
        <render-type
            :type="action.type"
            @change="handleTypeChange"
        >
            <bk-select
                ref="select"
                style="width: 165px;height: 32px"
                :value="action.id"
                :clearable="false"
                @toggle="handleGetComponents"
            >
                <bk-big-tree
                    ref="tree"
                    class="component-tree"
                >
                    <template #default="{ data }">
                        <span
                            v-bk-overflow-tips
                            class="tree-item"
                            @click="handleSelectComponent(data.id)"
                        >
                            {{ data.name }}
                        </span>
                    </template>
                </bk-big-tree>
            </bk-select>
        </render-type>
        <section
            v-for="item,index in action.value"
            :key="index"
            class="component-value"
        >
            <bk-select
                class="value-select"
                searchable
                :value="item.key"
                :clearable="false"
                @change="(key) => handleKeyChange(key, index)"
            >
                <bk-option
                    v-for="cssProperty in cssProperties"
                    :key="cssProperty"
                    :id="cssProperty"
                    :name="cssProperty"
                />
            </bk-select>
            <span class="value-equal">=</span>
            <bk-input
                class="value-input"
                v-bk-tooltips="{ content: $t('可以使用 ${args[0]} 的形式获取获取事件参数值') }"
                :value="item.value"
                @change="(val) => handleValueChange(val, index)"
            />
            <i
                class="bk-drag-icon bk-drag-add-fill"
                @click="handlePlusValue"
            ></i>
            <i
                :class="['bk-drag-icon bk-drag-reduce-fill', action.value.length <= 1 ? 'disable' : '']"
                @click="handleReduceValue(index)"
            ></i>
        </section>
    </render-wrapper>
</template>

<script>
    import RenderWrapper from './components/render-wrapper.vue'
    import RenderType from './components/render-type.vue'
    import LC from '@/element-materials/core'
    import {
        cssProperties
    } from '@/common/util'

    const getDataFromNodeTree = tree => {
        if (!tree) {
            return []
        }

        return tree.map(node => Object.freeze({
            id: node.componentId,
            name: node.componentId,
            children: getDataFromNodeTree(node.children)
        }))
    }

    export default {
        components: {
            RenderWrapper,
            RenderType
        },
        props: {
            action: Object
        },
        data () {
            return {
                cssProperties
            }
        },
        mounted () {
            this.handleGetComponents(true)
        },
        methods: {
            handleTypeChange (type) {
                this.$emit('change', {
                    ...this.action,
                    ...type
                })
            },

            handleKeyChange (key, index) {
                this.action.value[index].key = key
                this.$emit('change', this.action)
            },

            handleValueChange (val, index) {
                this.action.value[index].value = val
                this.$emit('change', this.action)
            },

            handlePlusValue () {
                this.$emit('change', {
                    ...this.action,
                    value: [
                        ...this.action.value,
                        {
                            key: '',
                            value: ''
                        }
                    ]
                })
            },

            handleReduceValue (index) {
                if (this.action.value.length <= 1) return
                this.action.value.splice(index, 1)
                this.$emit('change', {
                    ...this.action,
                    value: this.action.value
                })
            },

            handleSelectComponent (id) {
                this.$refs.select.close()

                if (id !== this.action.id) {
                    this.$emit('change', {
                        ...this.action,
                        id
                    })
                }
            },

            handleGetComponents (isCollapse) {
                if (!isCollapse) return
                const data = getDataFromNodeTree(LC.getRoot().children)
                this.$refs.tree.setData(data)
            },

            handleDelete () {
                this.$emit('delete')
            }
        }
    }
</script>

<style lang="postcss" scoped>
@import "@/css/mixins/ellipsis";

.component-tree {
  max-height: 216px;
}
.tree-item {
    color: #63656e;
    font-size: 12px;
    @mixin ellipsis 100%, inline-block;
}
.component-value {
    display: flex;
    align-items: center;
    margin-top: 8px;
    .value-equal {
        min-width: 32px;
        height: 32px;
        background: #FFFFFF;
        border: 1px solid #C4C6CC;
        border-radius: 2px;
        margin: 0 4px;
        line-height: 32px;
        text-align: center;
        color: #E76E0B;
    }
    .value-select {
      min-width: 110px;
    }
    .value-input {
      min-width: 50px;
    }
    .bk-drag-icon {
      font-size: 13px;
      color: #C4C6CC;
      margin-left: 4px;
      cursor: pointer;
      &.disable {
        color: #DCDEE5 !important;
        cursor: not-allowed;
      }
      &:hover {
        color: #979BA5;
      }
    }
}
</style>
