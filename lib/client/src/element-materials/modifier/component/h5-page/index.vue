<template>
    <div v-if="show" class="h5-container-config-wrapper">
        <div class="h5-container-title">{{ $t('H5容器页面配置') }}</div>
        <div class="h5-container-page-setting">
            <div class="h5-page"
                v-for="(page, index) in h5Pages"
                :key="index"
                @click="toView(page, index)">
                <span class="h5-page-title">{{ $t('第{0}页', [index + 1]) }}</span>
                <bk-button>{{page.componentId}}</bk-button>
                <i class="bk-icon icon-minus-circle" @click="handleDelete(page)" />
            </div>
        </div>
        <div
            v-show="pageCount <= 11"
            class="page-add"
            @click="handleAdd">
            <span>{{ $t('添加 1 页') }}</span>
            <i class="bk-icon icon-plus-circle" />
        </div>
    </div>
</template>

<script>
    import LC from '@/element-materials/core'
    export default {
        data () {
            return {
                h5Pages: [],
                componentNode: null
            }
        },
        computed: {
            show () {
                const activeNode = LC.getActiveNode()
                return activeNode.type === 'h5-container'
            },
            pageCount () {
                return this.h5Pages?.length
            }
        },
        created () {
            this.componentNode = LC.getActiveNode()
            this.h5Pages = Object.freeze([...this.componentNode.children])
            const updateCallback = (event) => {
                if (this.componentNode.componentId === event.target.componentId
                    || (
                        event.target.parentNode
                        && event.target.parentNode.componentId === this.componentNode.componentId
                    )) {
                    this.h5Pages = Object.freeze([...this.componentNode.children])
                    this.$forceUpdate()
                }
            }

            LC.addEventListener('update', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('update', updateCallback)
            })
        },
        methods: {
            toView (page, index) {
                page.$elm.scrollIntoView({ behavior: 'smooth' })
                page.parentNode.setProp('initialSlide', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: index,
                    renderValue: index
                }))
            },
            handleDelete (page) {
                this.componentNode.removeChild(page)
            },
            handleAdd () {
                const newPage = LC.createNode('h5-page')
                LC.getActiveNode().appendChild(newPage)
                this.$nextTick(() => {
                    newPage.$elm.scrollIntoView({ behavior: 'smooth' })
                })
            }
        }
    }
</script>

<style lang="postcss">
.h5-container-config-wrapper {
    padding: 10px;
    .h5-container-title {
        border-bottom: 1px dashed #313238;
        cursor: pointer;
        line-height: 19px;
        display: inline-block;
        font-size: 12px;
        font-weight: bold;
        color: #313238;
        margin-bottom: 10px;
    }
    .h5-container-page-setting {
        display: flex;
        flex-direction: column;
        .h5-page {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 10px;
            .h5-page-title {
                display: inline-block;
                width: 50px;
            }
            .bk-button {
                flex: 1;
            }
            .icon-minus-circle {
                margin-left: 8px;
                cursor: pointer;
                font-size: 16px;
                &:hover {
                    color: #3a84ff
                }
            }
        }
    }
    .page-add {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: 12px;
        cursor: pointer;
        color: #3a84ff;
    }
}
</style>
