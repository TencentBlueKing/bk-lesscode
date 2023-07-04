<template>
    <div class="project-layout-props-modifier">
        <div v-for="prop in propList" :key="prop.id" class="prop-box">
            <div class="prop-name" @click="toggleShowProp(prop.id)">
                <i
                    :class="{
                        'bk-icon icon-angle-down': true,
                        close: !prop.isShow
                    }"
                ></i>
                <div
                    :class="{ 'label': true, 'has-tips': prop.tips }"
                    v-bk-tooltips="{
                        placements: ['left-start'],
                        boundary: 'window',
                        content: prop.tips,
                        disabled: !prop.tips,
                        maxWidth: 400
                    }">
                    {{ prop.name }}
                    <span v-if="prop.type">({{ prop.type }})</span>
                </div>
            </div>
            <div class="prop-action" v-if="prop.isShow">
                <template v-if="prop.type === 'Boolean'">
                    <bk-switcher
                        theme="primary"
                        size="small"
                        :value="calcValue(prop)"
                        @change="value => handleValueChange(prop.name, value, prop.defaultValue)" />
                </template>
                <template v-else-if="prop.type === 'Number'">
                    <bk-input
                        type="number"
                        :value="calcValue(prop)"
                        @change="value => handleValueChange(prop.name, value, prop.defaultValue)" />
                </template>
                <template v-else>
                    <template v-if="isTopNav || isComplexNav">
                        <div class="prop-subTitle">{{ $t('顶部导航背景色') }}</div>
                        <bk-select
                            style="margin-bottom:12px;"
                            :clearable="false"
                            :value="calcValue(prop, 'topMenuBackground')"
                            @change="value => handleValueChange(prop.name, value, prop.defaultValue, 'topMenuBackground')">
                            <bk-option
                                v-for="option in backgroundColorList"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                                <span>{{option.name}}</span>
                            </bk-option>
                        </bk-select>
                    </template>
                    <template v-if="isTopNav || isComplexNav">
                        <div class="prop-subTitle">{{ $t('顶部导航主色调') }}</div>
                        <bk-select
                            style="margin-bottom:12px;"
                            :clearable="false"
                            :value="calcValue(prop, 'topMenuTheme')"
                            @change="value => handleValueChange(prop.name, value, prop.defaultValue, 'topMenuTheme')">
                            <bk-option
                                v-for="option in topMenuMainColor"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                                <span>{{option.name}}</span>
                            </bk-option>
                        </bk-select>
                    </template>
                    <template v-if="isSideNav || isComplexNav">
                        <div class="prop-subTitle">{{ $t('侧边导航背景') }}</div>
                        <bk-select
                            style="margin-bottom:12px;"
                            :clearable="false"
                            :value="calcValue(prop, 'sideMenuBackground')"
                            @change="value => handleValueChange(prop.name, value, prop.defaultValue, 'sideMenuBackground')">
                            <bk-option
                                v-for="option in backgroundColorList"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                                <span>{{option.name}}</span>
                            </bk-option>
                        </bk-select>
                    </template>
                    <template v-if="isSideNav || isComplexNav">
                        <div class="prop-subTitle">{{ $t('侧边导航主色调') }}</div>
                        <bk-select
                            :clearable="false"
                            :value="calcValue(prop, 'sideMenuTheme')"
                            @change="value => handleValueChange(prop.name, value, prop.defaultValue, 'sideMenuTheme')">
                            <bk-option
                                v-for="option in themeColorList"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                                <span>{{option.name}}</span>
                            </bk-option>
                        </bk-select>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
    import {
        BG_COLOR_OPTIONS,
        MAIN_COLOR_OPTIONS,
        TOP_MENU_THEME_OPTIONS
    } from './color-options'

    export default {
        name: '',
        inheritAttrs: false,
        props: {
            panelActive: String,
            theme: String,
            layoutType: String, // top-bottom | left-right | complex
            themeConfig: {
                type: Object,
                default: () => ({})
            },
            renderProps: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                backgroundColorList: BG_COLOR_OPTIONS,
                topMenuMainColor: TOP_MENU_THEME_OPTIONS,
                propList: [
                    {
                        id: 'theme',
                        name: this.$t('主题配置'),
                        type: '',
                        defaultValue: {
                            topMenuBackground: '#182132',
                            topMenuTheme: '#ffffff',
                            sideMenuBackground: '#182132',
                            sideMenuTheme: '#3c96ff'
                        },
                        isShow: true
                    },
                    {
                        id: 'headHeight',
                        name: 'head-height',
                        type: 'Number',
                        tips: this.layoutType === 'left-right' ? this.$t('logo栏的高度') : this.$t('顶部导航的高度'),
                        defaultValue: 52,
                        isShow: true
                    }
                ],
                themeColorList: MAIN_COLOR_OPTIONS
            }
        },
        computed: {
            isTopNav () {
                return this.layoutType === 'top-bottom'
            },
            isSideNav () {
                return this.layoutType === 'left-right'
            },
            isComplexNav () {
                return this.layoutType === 'complex'
            }
        },
        created () {
            // 横向型导航布局不支持 default-open 配置
            if (this.panelActive !== 'topMenu') {
                this.propList.push({
                    id: 'defaultOpen',
                    name: 'default-open',
                    type: 'Boolean',
                    tips: this.$t('是否默认展开左侧栏'),
                    defaultValue: false,
                    isShow: true
                })
            }
        },
        methods: {
            calcValue (prop, option = '') {
                const {
                    name,
                    defaultValue
                } = prop
                if (name === this.$t('主题配置')) {
                    return this.themeConfig[option] || defaultValue[option]
                }
                if (this.renderProps.hasOwnProperty(name)) {
                    return this.renderProps[name]
                }
                return defaultValue
            },
            handleValueChange (name, value, defaultValue, prop) {
                console.log(name, value, defaultValue, prop, 12)
                if (name === this.$t('主题配置')) {
                    const themeConfig = Object.assign({}, this.themeConfig)
                    themeConfig[prop] = value
                    this.$emit('on-change', 'themeConfig', themeConfig)
                    return
                }
                const renderProps = Object.assign({}, this.renderProps)
                if (value === defaultValue || value === '') {
                    delete renderProps[name]
                } else {
                    renderProps[name] = value
                }
                this.$emit('on-change', 'renderProps', renderProps)
            },
            toggleShowProp (id) {
                this.propList = this.propList.map(item => {
                    return {
                        ...item,
                        isShow: item.id === id ? !item.isShow : item.isShow
                    }
                })
            }
        }
    }
</script>
<style lang='postcss'>
    .project-layout-props-modifier{
        padding: 0 10px;
        .title{
            font-size: 12px;
            font-weight: bold;
            color: #63656E;
            line-height: 16px;
        }
        .prop-box{
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            border-bottom: 1px solid #EAEBF0;
            .prop-name{
                display: flex;
                align-items: center;
                height: 40px;
                font-size: 12px;
                font-weight: bold;
                color: #313238;
                word-break: keep-all;
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
                .label {
                    padding-bottom: 1px;
                    cursor: pointer;
                    &.has-tips {
                        border-bottom: 1px dashed #979BA5;
                    }
                }
            }
            .prop-action{
                width: 100%;
                margin: 4px 0 16px;
            }
            .prop-subTitle {
                margin-bottom: 6px;
                font-size: 12px;
            }
        }
    }
</style>
