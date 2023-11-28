<template>
    <section class="material-group-item">
        <div class="group-header" @click="open = !open">
            <i :class="['bk-icon icon-angle-down arrow-icon', { closed: !open }]"></i>
            <span class="group-name-text">{{ $t(name) }}</span>
        </div>
        <div v-show="open" class="group-content">
            <bk-exception
                v-if="list.length === 0"
                class="group-list-empty"
                type="empty"
                scene="part">
                <span>{{ $t('暂无数据') }}</span>
            </bk-exception>
            <vue-draggable
                v-else
                class="card-list-wrapper"
                :list="list"
                :sort="false"
                :group="{
                    name: 'bkform-engine-material',
                    pull: 'clone',
                    put: false
                }"
                :force-fallback="false"
                @choose="handleChoose($event)">
                <div class="card-item" v-for="item in list" :key="item.type">
                    <i :class="['card-icon', item.icon]"></i>
                    <span class="card-name">{{ $t(item.name) }}</span>
                </div>
            </vue-draggable>
        </div>
    </section>
</template>
<script>
    import vueDraggable from 'vuedraggable'

    export default {
        name: 'materialGroupItem',
        components: {
            vueDraggable
        },
        props: {
            name: String,
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                open: true
            }
        },
        methods: {
            handleChoose (event) {
                // console.log('dragEvent------>', event)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .group-header {
        display: flex;
        align-items: center;
        padding: 0 7px;
        height: 40px;
        border-top: 1px solid #dde4eb;
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
        padding: 0 12px 8px;
        .card-list-wrapper {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        .card-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 4px 0 12px;
            width: 134px;
            height: 32px;
            font-size: 12px;
            color: #63656e;
            border: 1px solid #dcdee5;
            border-radius: 4px;
            user-select: none;
            cursor: move;
            &:hover {
                color: #3a84ff;
            }
            .card-icon {
                font-size: 16px;
            }
            .card-name {
                flex: 1;
                margin-left: 10px;
            }
        }
    }
</style>
