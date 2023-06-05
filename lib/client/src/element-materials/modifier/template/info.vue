<template>
    <div class="project-info-modifier">
        <div class="prop-box">
            <div class="action-title" @click="() => showNameProp = !showNameProp">
                <i
                    :class="{
                        'bk-icon icon-angle-down': true,
                        close: !showNameProp
                    }"
                ></i>
                <div>{{ $t('应用名称') }}</div>
            </div>
            <div class="action-content" v-if="showNameProp">
                <bk-input :value="siteName" @change="handleSiteNameChange" />
            </div>
        </div>
        <div class="prop-box">
            <div class="action-title" @click="() => showLogoProp = !showLogoProp">
                <i
                    :class="{
                        'bk-icon icon-angle-down': true,
                        close: !showLogoProp
                    }"
                ></i>
                <div>{{ $t('logo 设置') }}</div>
            </div>
            <div class="action-content" v-if="showLogoProp">
                <src-input :value="logo" file-type="img" @change="handleLogoChange" />
            </div>
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
        data () {
            return {
                showNameProp: true,
                showLogoProp: true
            }
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

<style lang="postcss">
    .project-info-modifier {
        .prop-box {
            border-bottom: 1px solid #EAEBF0;
            .action-title {
                display: flex;
                align-items: center;
                height: 40px;
                font-size: 12px;
                font-weight: bold;
                color: #313238;
                margin-bottom: 0;
                cursor: pointer;
                .bk-icon {
                    margin-left: -5px;
                    margin-right: 3px;
                    font-size: 20px;
                    color: #63656E;
                    display: inline-block;
                    transition: transform 200ms;
                    cursor: pointer;
                    &.close {
                        transform: rotate(-90deg);
                    }
                }
            }
            .action-content {
                margin: 4px 0 16px;
            }
        }
    }
</style>
