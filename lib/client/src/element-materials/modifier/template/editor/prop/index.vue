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
                    {{ prop.name }}({{ prop.type }})
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
                <template v-else-if="prop.type === 'String'">
                    <bk-select
                        :clearable="false"
                        :value="calcValue(prop)"
                        @change="value => handleValueChange(prop.name, value, prop.defaultValue)">
                        <bk-option
                            v-for="option in themeColorList"
                            :key="option.id"
                            :id="option.id"
                            :name="option.name">
                            <span>{{option.name}}</span>
                        </bk-option>
                    </bk-select>
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
                        name: '导航主题',
                        type: 'String',
                        defaultValue: '#182132',
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
                themeColorList: [
                    { id: '#182132', name: '默认' },
                    { id: '#0549BB', name: '蓝色' },
                    { id: '#1A1A1A', name: '黑色' },
                    { id: '#7C0000', name: '红色' },
                    { id: '#815E01', name: '棕黄色' },
                    { id: '#1C8D50', name: '绿色' },
                    { id: '#266994', name: '青色' },
                    { id: '#374DC6', name: '紫色' },
                    { id: '#FFFFFF', name: '白色' }
                ]
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
            calcValue (prop) {
                const {
                    name,
                    defaultValue
                } = prop
                if (name === '导航主题') {
                    return this.theme || defaultValue
                }
                if (this.renderProps.hasOwnProperty(name)) {
                    return this.renderProps[name]
                }
                return defaultValue
            },
            handleValueChange (name, value, defaultValue) {
                if (name === '导航主题') {
                    this.$emit('on-change', 'theme', value)
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
        }
    }
</style>
