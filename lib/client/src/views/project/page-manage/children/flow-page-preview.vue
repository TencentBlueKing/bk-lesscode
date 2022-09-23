<template>
    <div class="preview-thumb">
        <img ref="img" loading="lazy" :src="flowPreviewImg">
        <!-- <div class="flow-name">
            <i class="bk-icon icon-assembly" />
            flow提单页
        </div> -->
    </div>
</template>

<script>
    import flowPreviewImg from '@/images/flow-page-img.png'

    export default {
        props: {
            pageName: String
        },
        data () {
            return {
                flowPreviewImg
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .preview-thumb {
        height: 100%;
        img {
            width: 100%;
            object-fit: contain;
        }
    }
    /* .flow-name {
        position: absolute;
        top: 40%;
        display: flex;
        align-items: center;
        justify-content: center;
    } */
</style>
