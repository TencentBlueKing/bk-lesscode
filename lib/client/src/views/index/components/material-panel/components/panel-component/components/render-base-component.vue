<template>
    <div class="lesscode-materials-panel-content">
        <search-box
            :placeholder="$t('组件名称')"
            :list="searchList"
            @on-change="handleSearchChange" />
        <div class="materials-group-box-list">
            <group-box
                v-for="(comList, groupName) in renderGroupComponentMap"
                :key="groupName"
                :list="comList"
                :group-name="$t(groupName)">
                <template v-for="component in comList">
                    <render-icon
                        v-if="groupName === '图标集合'"
                        :key="component.name"
                        :data="component" />
                    <render-component
                        v-else
                        :key="component.name"
                        :data="component" />
                </template>
            </group-box>
        </div>
    </div>
</template>
<script>
    import Vue2MaterialConfig from '@/element-materials/materials/vue2'
    import Vue3MaterialConfig from '@/element-materials/materials/vue3'
    import SearchBox from '../../common/search-box'
    import GroupBox from '../../common/group-box'
    import RenderComponent from '../../common/group-box/render-component'
    import RenderIcon from '../../common/group-box/render-icon'
    import store from '@/store'

    export default {
        components: {
            SearchBox,
            GroupBox,
            RenderComponent,
            RenderIcon
        },
        props: {
            baseComponent: {
                type: String,
                validator: function (value) {
                    return ['bk', 'element', 'vant'].includes(value)
                }
            }
        },
        data () {
            return {
                renderGroupComponentMap: {},
                searchList: []
            }
        },
        computed: {
            materialConfig () {
                const project = store.getters['project/currentProject']
                return project.framework === 'vue3' ? Vue3MaterialConfig : Vue2MaterialConfig
            },
            /**
             * @desc 选中组件库的分组列表
             * @returns { Array }
             */
            groupList () {
                const groupNameMap = {
                    bk: 'bkComponentGroupList',
                    element: 'elementComponentGroupList',
                    vant: 'vantComponentGroupList'
                }
                return this.materialConfig[groupNameMap[this.baseComponent]]
            },
            /**
             * @desc 选中组件库的组件列表
             * @returns { Array }
             */
            componentList () {
                return this.materialConfig[this.baseComponent]
            }
        },
        watch: {
            baseComponent: {
                handler () {
                    this.init()
                },
                immediate: true
            }
        },
        methods: {
            init () {
                const searchList = []

                const groupComponentMap = this.groupList.reduce((result, groupName) => {
                    result[groupName] = []
                    return result
                }, {})

                this.componentList.forEach(component => {
                    if (component.display === 'none' || !component.group) {
                        return
                    }
                    searchList.push(component)
                    groupComponentMap[component.group].push(component)
                })

                this.searchList = searchList
                this.groupComponentMap = Object.freeze(groupComponentMap)
                this.renderGroupComponentMap = Object.freeze(groupComponentMap)
            },
            /**
             * @desc 组件搜索
             */
            handleSearchChange (data) {
                if (!data) {
                    this.renderGroupComponentMap = Object.freeze(this.groupComponentMap)
                    return
                }
                const renderGroupComponentMap = {}
                Object.keys(this.groupComponentMap).forEach(groupName => {
                    const groupList = this.groupComponentMap[groupName]
                    groupList.forEach(component => {
                        if (component.name === data.name) {
                            if (!renderGroupComponentMap[groupName]) {
                                renderGroupComponentMap[groupName] = []
                            }
                            renderGroupComponentMap[groupName].push(component)
                        }
                    })
                })
                this.renderGroupComponentMap = Object.freeze(renderGroupComponentMap)
            }
        }
    }
</script>
