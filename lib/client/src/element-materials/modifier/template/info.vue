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
                <bk-input :value="siteName" @change="(val) => handleChange('siteName', val)" />
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
                <src-input :value="logo" file-type="img" @change="(val) => handleChange('logo', val)" />
            </div>
        </div>
        <div class="prop-box">
            <div class="action-title" @click="() => showLinkProp = !showLinkProp">
                <i
                    :class="{
                        'bk-icon icon-angle-down': true,
                        close: !showLinkProp
                    }"
                ></i>
                <div>{{ $t('logo点击跳转页面') }}</div>
            </div>
            <div class="action-content" v-if="showLinkProp">
                <bk-select
                    class="menu-page"
                    :placeholder="$t('请选中路由')"
                    style="width: 100%"
                    clearable
                    :value="logoLink"
                    @change="(val) => handleChange('logoLink', val)">
                    <bk-option
                        v-for="page in pageRouteList"
                        v-bk-tooltips="{ disabled: !page.disabled, content: $t('未设置路由') }"
                        :key="page.pageCode"
                        :id="page.pageCode"
                        :disabled="page.disabled"
                        :name="page.pageName" />
                </bk-select>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import SrcInput from '@/components/src-input/index.vue'

    export default {
        name: '',
        components: {
            SrcInput
        },
        props: {
            logo: String,
            siteName: String,
            logoLink: String
        },
        data () {
            return {
                showNameProp: true,
                showLogoProp: true,
                showLinkProp: true
            }
        },
        computed: {
            ...mapState('route', ['layoutPageList']),
            pageRouteList () {
                const pageRouteList = this.layoutPageList.reduce((acc, cur) => {
                    const pageType = cur.pageType || 'PC'
                    if (pageType === LC.platform) { // 只允许调准同平台路由
                        const { id, layoutPath, path } = cur
                        const disabled = !id
                        acc.push({
                            ...cur,
                            disabled,
                            fullPath: `${layoutPath}${layoutPath.endsWith('/') ? '' : '/'}${path}`
                        })
                    }
                    return acc
                }, [])

                pageRouteList.sort((p1, p2) => p1.disabled - p2.disabled)
                return pageRouteList
            }
        },
        methods: {
            handleChange (key, value) {
                this.$emit('on-change', key, value)
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
