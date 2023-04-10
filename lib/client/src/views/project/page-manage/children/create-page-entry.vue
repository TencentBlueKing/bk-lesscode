<template>
    <section>
        <bk-dropdown-menu :align="'left'" ext-cls="create-dropdown-btn" ref="createDropdown">
            <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                <div class="trigger-content">
                    <bk-icon type="plus" width="11" height="11" />
                </div>
            </div>
            <ul class="bk-dropdown-list select-page-type" slot="dropdown-content">
                <li><a href="javascript:;" @click="handleCreate('PC', '')"><i class="bk-drag-icon bk-drag-pc"> </i>PC自定义页面</a></li>
                <li><a href="javascript:;" @click="handleCreate('PC', 'FORM')"><i class="bk-drag-icon bk-drag-pc"> </i>PC表单页面</a></li>
                <li><a href="javascript:;" @click="handleCreate('PC', 'MARKDOWN')"><i class="bk-drag-icon bk-drag-pc"> </i>Markdown文档</a></li>
                <li><a href="javascript:;" @click="handleCreate('MOBILE', '')"><i class="bk-drag-icon bk-drag-mobilephone"> </i>Mobile自定义页面</a></li>
            </ul>
        </bk-dropdown-menu>
        <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" :init-page-data="initPageData" />
    </section>
</template>

<script>
    import createPageDialog from '@/components/project/create-page-dialog.vue'
    
    export default {
        components: {
            createPageDialog
        },
        data () {
            return {
                createPlatform: 'PC',
                createNocodeType: '',
                initPageData: {}
            }
        },
        methods: {
            handleCreate (platform, nocodeType, initPageData = {}) {
                this.createPlatform = platform
                this.createNocodeType = nocodeType
                this.initPageData = initPageData
                this.$refs.createDropdown.hide()
                this.$refs.createPageDialog.isShow = true
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/variable";
    
    .create-dropdown-btn {
        /deep/ .bk-dropdown-trigger .trigger-content {
            width: 32px;
            height: 32px;
            background: $primaryColor;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            i {
                font-size: 24px !important;
            }
        }
        .select-page-type {
            font-size: 12px;
            color:#63656E;
            a:hover i {
                color: #3a84ff;
            }
            i {
                color: #979ba5;
                margin-right: 4px;
            }
        }
    }
</style>
