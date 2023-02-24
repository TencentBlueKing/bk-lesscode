<template>
    <div class="comp-box">
        <div v-if="selectedComp.data.id === comp.id" class="action-area">
            <span class="id">{{ comp.id }}</span>
            <span class="tool-btn"><i class="bk-icon icon-copy" @click.stop="$emit('copy', comp)"></i></span>
            <span class="tool-btn"><i class="bk-drag-icon bk-drag-shanchu" @click.stop="$emit('delete', comp)"></i></span>
        </div>
        <div :class="['comp-wrapper', { selected: selectedComp.data.id === comp.id }]" @click.stop="handleSelect"><slot></slot></div>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'

    export default {
        name: 'CompBox',
        props: {
            type: {
                type: String,
                default: '' // 可选值为buttons、tableActions
            },
            comp: Object
        },
        computed: {
            ...mapState('nocode/dataManage', ['selectedComp']),
            ...mapGetters('drag', ['curTemplateData'])
        },
        methods: {
            handleSelect () {
                this.$store.commit('nocode/dataManage/setSelectedComp', { type: this.type, data: this.comp })
                this.hideNavLayoutPanel()
            },
            hideNavLayoutPanel () {
                this.$store.commit('drag/setCurTemplateData', {
                    ...this.curTemplateData,
                    panelActive: ''
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .comp-box {
        position: relative;
    }
    .action-area {
        position: absolute;
        top: -25px;
        left: 0;
        display: inline-flex;
        z-index: 999;
        > span{
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
        .id{
            display: block;
            padding:0 4px ;
            font-size: 12px;
            line-height: 20px;
            max-width: 300px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .tool-btn{
            width: 20px;
            height: 20px;
            font-size: 14px;
            cursor: pointer;
        }
    }
    .comp-wrapper {
        border: 1px solid transparent;
        border-radius: 2px;
        &.selected {
            border-color: #3a84ff;
        }
    }
</style>
