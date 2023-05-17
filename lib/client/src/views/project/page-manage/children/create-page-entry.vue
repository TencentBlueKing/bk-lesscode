<template>
    <section>
        <bk-dropdown-menu :align="'left'" ext-cls="create-dropdown-btn" ref="createDropdown">
            <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                <div class="trigger-content">
                    <bk-icon type="plus" width="11" height="11" />
                </div>
            </div>
            <ul class="bk-dropdown-list select-page-type" slot="dropdown-content">
                <li>
                    <a href="javascript:;" @click="handleCreate('PC', '')">
                        <i :style="{ color: NOCODE_TYPE_MAP['color'][''] }" class="bk-drag-icon bk-drag-page" style=""> </i>PC自定义页面
                    </a>
                </li>
                <li>
                    <a href="javascript:;" @click="handleCreate('PC', 'FORM')">
                        <i :style="{ color: NOCODE_TYPE_MAP['color']['FORM'] }" class="bk-drag-icon bk-drag-biaodan"> </i>PC表单页面
                    </a>
                </li>
                <li>
                    <a href="javascript:;" @click="handleCreate('PC', 'MARKDOWN')">
                        <i :style="{ color: NOCODE_TYPE_MAP['color']['MARKDOWN'] }" class="bk-drag-icon bk-drag-markdown"> </i>Markdown文档
                    </a>
                </li>
                <li>
                    <a href="javascript:;" @click="handleCreate('MOBILE', '')">
                        <i :style="{ color: NOCODE_TYPE_MAP['color'][''] }" class="bk-drag-icon bk-drag-mobilephone"> </i>Mobile自定义页面
                    </a>
                </li>
            </ul>
        </bk-dropdown-menu>
        <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" :init-page-data="initPageData" />
    </section>
</template>

<script>
    import createPageDialog from '@/components/project/create-page-dialog.vue'
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    
    export default {
        components: {
            createPageDialog
        },
        data () {
            return {
                NOCODE_TYPE_MAP,
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

    .canvas-theme .create-dropdown-btn {
        /deep/ .bk-dropdown-trigger .trigger-content {
            background: #EAEBF0;
            color: #63656E;
        }
    }
    
    .create-dropdown-btn {
        /deep/ .bk-dropdown-trigger .trigger-content {
            width: 32px;
            height: 32px;
            border-radius: 2px;
            background: $primaryColor;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            i {
                font-size: 24px !important;
            }
            &:hover {
                background: #5594FA;
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
