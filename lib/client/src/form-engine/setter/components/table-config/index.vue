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
                    @change="handleChange($event,index)">
                </header-config-item>
            </transition-group>
        </vue-draggable>
    </div>
</template>

<script>
    import headerConfigItem from './components/header-config-item.vue'

    export default {
        name: 'setter-table-config',
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
            handleDragEnd (e) {
                console.log('move', e.newIndex, e.oldIndex)
            },
            handleRemove (index) {
                console.log('remove', index)
            },
            handleChange ($event, index) {
                console.log('update', $event, index)
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
</style>
