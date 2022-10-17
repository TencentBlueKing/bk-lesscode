<template>
    <div class="flow-preview-thumb">
        <img ref="img" loading="lazy" :src="flowPreviewImg">
        <div class="flow-name">
            <i class="bk-drag-icon bk-drag-assembly-line-fill" style="color: #3A84FF" />
            <span>{{flowName}}</span>
        </div>
    </div>
</template>

<script>
    import flowPreviewImg from '@/images/flow-page-img.png'

    export default {
        props: {
            flowName: String
        },
        data () {
            return {
                flowPreviewImg
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .flow-preview-thumb {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        img {
            width: 100%;
            object-fit: contain;
            position: absolute;
        }
        .flow-name {
            display: block;
            color: 12px;
            font-weight: bold;
            z-index: 2;
        }
        &:hover.flow-name {
            display: none;
        }
    }
</style>
