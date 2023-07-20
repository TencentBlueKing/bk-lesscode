<template>
    <div class="panel-component">
        <div class="category-tabs">
            <div
                class="tab-item base-component-box"
                :class="{ active: tab === 'baseComponent' }"
                @click="handleChangeTab('baseComponent')">
                <select-base-component v-model="baseComponent" />
            </div>
            <div
                class="tab-item"
                :class="{ active: tab === 'customComponent' }"
                @click="handleChangeTab('customComponent')">
                <span class="tab-item-label">{{ $t('自定义组件') }}</span>
            </div>
        </div>
        <div class="drag-component-list">
            <component :is="com" :base-component="baseComponent" />
        </div>
    </div>
</template>
<script>
    import SelectBaseComponent from './components/select-base-component.vue'
    import RenderBaseComponent from './components/render-base-component'
    import RenderCustomComponent from './components/render-custom-component'
    import { mapGetters } from 'vuex'

    export default {
        name: '',
        components: {
            SelectBaseComponent
        },
        data () {
            return {
                tab: 'baseComponent',
                baseComponent: 'bk'
            }
        },
        computed: {
            ...mapGetters('page', ['platform']),
            com () {
                const comMap = {
                    baseComponent: RenderBaseComponent,
                    customComponent: RenderCustomComponent
                }
                return comMap[this.tab]
            }
        },
        created () {
            this.initPlatform()
        },
        methods: {
            handleChangeTab (tab) {
                this.tab = tab
            },
            initPlatform () {
                const map = {
                    PC: 'bk',
                    MOBILE: 'vant'
                }
                this.baseComponent = map[this.platform]
            }
        }
    }
</script>
<style lang="postcss">
    @import "@/css/mixins/ellipsis";
    @import "@/css/mixins/scroller";

    .panel-component{
        height: 100%;
        .category-tabs {
            display: flex;
            height: 42px;
            user-select: none;

            .tab-item {
                display: flex;
                justify-content: center;
                /* align-items: center; */
                height: 42px;
                line-height: 42px;
                background: #F5F7FA;
                border-bottom: 1px solid #EAEBF0;
                border-right: 1px solid #EAEBF0;
                flex: 1 1;
                font-size: 12px;
                padding: 0 10px;
                white-space: nowrap;
                cursor: pointer;
                user-select: none;
                &:hover {
                    color: #3A84FF;
                    /* background: #FFF; */
                }
                &:first-child{
                    margin-right: auto;
                }
                &.active {
                    color: #3A84FF;
                    background: #FFF;
                    border-bottom: none;
                }
                .tab-item-label {
                    font-size: 12px;
                    @mixin ellipsis 110px;
                }
                .toggle-icon {
                    overflow: hidden;
                    display: inline-block;
                    padding-top: 1px;
                }
            }
        }
        .search-box{
            padding: 6px 12px;
        }
        .drag-component-list{
            height: calc(100% - 42px);
            padding-bottom: 10px;
            overflow-y: auto;
            @mixin scroller;
        }
    }
</style>
