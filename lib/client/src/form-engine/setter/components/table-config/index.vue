<template>
    <div class="setter-table-config">
        <vue-draggable
            class="group-list"
            handle=".item-drag"
            @end="handleDragEnd"
            :group="{ name: 'top-col' }">
            <transition-group type="transition" :name="'flip-list'">
                <header-config-item
                    v-for="(config, index) in list"
                    :key="config.key"
                    :config="config"
                    @remove="handleRemove(index)"
                    @change="handleChange(index, $event)">
                </header-config-item>
            </transition-group>
        </vue-draggable>
        <bk-button text class="add-btn" size="small" theme="primary" @click="handleAdd">{{ $t('添加') }}</bk-button>
    </div>
</template>

<script>
    import { uuid } from '../../../utils/index'
    import headerConfigItem from './components/header-config-item.vue'

    export default {
        name: 'setter-table-config',
        inheritAttrs: false,
        components: {
            headerConfigItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            value: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                list: this.value.slice()
            }
        },
        watch: {
            value (val) {
                this.list = val.slice()
            }
        },
        methods: {
            handleAdd () {
                const len = this.list.length
                this.list.push({
                    key: `col_${uuid()}`,
                    label: this.$t('列{0}', [len + 1]),
                    type: '',
                    required: false,
                    dataSource: []
                })
                this.change()
            },
            handleDragEnd (e) {
                const { oldIndex, newIndex } = e
                const col = this.list[oldIndex]
                this.list.splice(oldIndex, 1)
                this.list.splice(newIndex, 0, col)
                this.change()
            },
            handleRemove (index) {
                this.list.splice(index, 1)
                this.change()
            },
            handleChange (index, $event) {
                this.list.splice(index, 1, $event)
                this.change()
            },
            change () {
                this.$emit('change', this.list.slice())
            }
        }
    }
</script>
<style scoped lang='postcss'>
    @import "@/css/mixins/scroller";
    .header-setting-wrapper{
        .menu-wraper{
            margin-bottom:  10px;
            max-height: calc(100% - 76px);
            overflow-y: auto;
            @mixin scroller;
        }
    }
    .add-btn {
        margin-top: 4px;
        padding: 0;
    }
</style>
