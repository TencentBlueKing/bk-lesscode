<template>
    <div class="project-info-modifier">
        <div>
            <div class="action-title">应用名称配置</div>
            <bk-input :value="siteName" @change="handleSiteNameChange" />
        </div>
        <div style="margin-top: 10px;">
            <div class="action-title">应用 LOGO 配置</div>
            <src-input :value="logo" file-type="img" @change="handleLogoChange" />
        </div>
    </div>
</template>
<script>
    import SrcInput from '@/components/src-input/index.vue'

    export default {
        name: '',
        components: {
            SrcInput
        },
        props: {
            logo: String,
            siteName: String
        },
        methods: {
            handleSiteNameChange (value) {
                this.$emit('on-change', 'siteName', value)
            },
            handleLogoChange (value) {
                this.$emit('on-change', 'logo', value)
            }
        }
    }
</script>
