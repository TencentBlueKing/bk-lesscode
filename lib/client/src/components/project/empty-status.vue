<template>
    <div :class="{ 'empty-type': part } ">
        <bk-exception v-if="type === 'search'" class="component-list-empty" type="search-empty" scene="part">
            <div class="empty-text search-empty">
                搜索结果为空
            </div>
            <div class="tooltip-text">
                <span>可以尝试 调整关键词 或 </span>
                <bk-button text theme="primary" auth="create_app" @click="handlerClear" class="clear-text">清空筛选条件</bk-button>
            </div>
        </bk-exception>
        <bk-exception v-else class="component-list-empty" type="empty" scene="part">
            <div class="empty-text">
                暂无数据
            </div>
        </bk-exception>
    </div>
</template>
<script>
    export default {
        name: 'empty-status',
        components: {},
        props: {
            type: {
                type: String,
                default: 'noData'
            },
            part: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {}
        },
        methods: {
            handlerClear () {
                this.$emit('clearSearch', '')
            }
        }
    }
</script>
<style lang="postcss" scoped>
.empty-type{
    .component-list-empty{
        height: 240px;
    }
    .bk-table-empty-text{
        padding: 20px;
    }
     /deep/.bk-table-empty-text{
        padding: 20px;
}
    /deep/.bk-exception-img.part-img{
        height: 170px;
    }
}

.component-list-empty{
    height: 280px;
    justify-content: center;
    .empty-text {
        color: #63656E;
    }
    .search-empty{
        padding-bottom: 8px;
    }
    .clear-text {
        font-size: 12px;
        font-color: #3A84FF;
    }
    .tooltip-text{
        font-size: 12px;
        color: #aeb2bb;
    }
    
}

</style>
<style>
.bk-table-empty-text {
    padding: 20px;
}
</style>
