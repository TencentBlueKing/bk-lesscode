<template>
    <div class="project-layout-props-modifier">
        <div v-for="prop in propList" :key="prop.id" class="prop-box">
            <div class="prop-name">
                <i
                    :class="{
                        'bk-icon icon-angle-down': true,
                        close: !prop.isShow
                    }"
                    @click="toggleShowProp(prop.id)"
                ></i>
                <div
                    :class="{ 'label': true, 'has-tips': prop.tips }"
                    v-bk-tooltips="{
                        placements: ['left-start'],
                        boundary: 'window',
                        content: prop.tips,
                        disabled: !prop.tips
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
                        <div class="prop-subTitle">顶部导航背景色</div>
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
                        <div class="prop-subTitle">顶部导航主色调</div>
                        <bk-select
                            style="margin-bottom:12px;"
                            :clearable="false"
                            :value="calcValue(prop, 'topMenuTheme')"
                            @change="value => handleValueChange(prop.name, value, prop.defaultValue, 'topMenuTheme')">
                            <bk-option
                                v-for="option in themeColorList"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                                <span>{{option.name}}</span>
                            </bk-option>
                        </bk-select>
                    </template>
                    <template v-if="isSideNav || isComplexNav">
                        <div class="prop-subTitle">侧边导航背景</div>
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
                        <div class="prop-subTitle">侧边导航主色调</div>
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
                propList: [
                    {
                        id: 'theme',
                        name: '主题配置',
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
                        tips: this.layoutType === 'left-right' ? 'logo栏的高度' : '顶部导航的高度',
                        defaultValue: 52,
                        isShow: true
                    }
                ],
                backgroundColorList: [
                    { id: '#182132', name: '科技蓝' },
                    { id: '#0549BB', name: '蓝色' },
                    { id: '#1a1a1a', name: '黑色' },
                    { id: '#7C0000', name: '红色' },
                    { id: '#815E01', name: '棕黄色' },
                    { id: '#1C8D50', name: '绿色' },
                    { id: '#266994', name: '青色' },
                    { id: '#374DC6', name: '紫色' },
                    { id: '#ffffff', name: '白色' }
                ],
                themeColorList: [
                    { id: '#3c96ff', name: '蓝色' },
                    { id: '#1A1A1A', name: '黑色' },
                    { id: '#7C0000', name: '红色' },
                    { id: '#815E01', name: '棕黄色' },
                    { id: '#1C8D50', name: '绿色' },
                    { id: '#266994', name: '青色' },
                    { id: '#374DC6', name: '紫色' },
                    { id: '#ffffff', name: '白色' }
                ]
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
                    tips: '是否默认展开左侧栏',
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
                if (name === '主题配置') {
                    return this.themeConfig[option] || defaultValue[option]
                }
                if (this.renderProps.hasOwnProperty(name)) {
                    return this.renderProps[name]
                }
                return defaultValue
            },
            handleValueChange (name, value, defaultValue, prop) {
                if (name === '主题配置') {
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
