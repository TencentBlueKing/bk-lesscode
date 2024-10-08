<template>
    <section class="bkform-engine-setter">
        <template v-for="group in groups">
            <section v-if="group.children.length > 0" class="properties-group" :key="group.name">
                <div class="group-header" @click="group.open = !group.open">
                    <span class="group-name-text">{{ group.name }}</span>
                    <i :class="['bk-icon icon-angle-down arrow-icon', { closed: !group.open }]"></i>
                </div>
                <div v-show="group.open" class="group-content">
                    <div v-for="property in group.children" class="property-item" :key="`${field.id}_${property}`">
                        <component
                            :is="property"
                            :field="field"
                            :list="list"
                            :current-form-id="dataSource.type === 'NEW_FORM' ? dataSource.id : dataSource.relatedId"
                            :value="field.configure[property]"
                            :disabled="isReuseForm"
                            @change="$emit('change', property, $event)" />
                    </div>
                </div>
            </section>
        </template>
    </section>
</template>
<script>
    import setters from './setters'
    import materials from '../material/materials'

    const basicProperties = ['name', 'key', 'dataSource']

    export default {
        name: 'bkform-engine-setter',
        props: {
            field: {
                type: Object,
                default: () => ({
                    id: '',
                    type: '',
                    configure: {
                        name: '',
                        key: ''
                    }
                })
            },
            dataSource: {
                type: Object,
                default: () => ({
                    type: 'NEW_FORM',
                    id: '',
                    relatedId: ''
                })
            },
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                groups: [
                    {
                        name: window.i18n.t('基础属性'),
                        open: true,
                        children: []
                    },
                    {
                        name: window.i18n.t('填写属性'),
                        open: true,
                        children: []
                    }
                ]
            }
        },
        computed: {
            // 表单容器数据源是否为复用数据表
            isReuseForm () {
                return this.dataSource.type === 'USE_FORM'
            }
        },
        watch: {
            field (val) {
                this.setGroups(val)
            }
        },
        beforeCreate () {
            Object.keys(setters).forEach(key => {
                const setter = setters[key]
                this.$options.components[key] = setter.component
            })
        },
        created () {
            if (this.field?.id) {
                this.setGroups(this.field)
            }
        },
        methods: {
            setGroups (val) {
                this.groups.forEach(group => {
                    group.open = true
                    group.children = []
                })
                const list = materials.find(item => item.type === val.type)?.properties || []
                list.forEach(item => {
                    if (basicProperties.includes(item)) {
                        this.groups[0].children.push(item)
                    } else {
                        this.groups[1].children.push(item)
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .properties-group {
        border-bottom: 1.25px solid #EAEBF0;
    }
    .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 8px 0 12px;
        height: 40px;
        cursor: pointer;
        .arrow-icon {
            font-size: 24px;
            color: #63656e;
            transition: all .1s .linear;
            &.closed {
                transform: rotate(-90deg);
            }
        }
        .group-name-text {
            font-size: 12px;
            font-weight: 700;
            color: #313238;
        }
    }
    .group-content {
        padding: 0 12px;
    }
    .property-item {
        margin-bottom: 14px;
    }
</style>
