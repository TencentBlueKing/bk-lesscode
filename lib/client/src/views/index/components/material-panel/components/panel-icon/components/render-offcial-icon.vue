<template>
    <div class="lesscode-materials-panel-content">
        <search-box
            :placeholder="$t('图标名称')"
            :list="searchList"
            @on-change="handleSearchChange" />
        <div class="materials-group-box-list">
            <group-box
                v-for="(componentList, groupName) in renderGroupIconMap"
                :key="groupName"
                :list="componentList"
                :group-name="groupName">
                <render-icon
                    v-for="component in componentList"
                    :key="component.name"
                    :data="component" />
            </group-box>
        </div>
    </div>
</template>
<script>
    import vue2IconComponentList from '@/element-materials/materials/vue2/icon-list.js'
    import vue3IconComponentList from '@/element-materials/materials/vue3/icon-list.js'
    import GroupBox from '../../common/group-box'
    import SearchBox from '../../common/search-box'
    import RenderIcon from '../../common/group-box/render-icon'
    import LC from '@/element-materials/core'

    export default {
        name: '',
        components: {
            GroupBox,
            SearchBox,
            RenderIcon
        },
        data () {
            return {
                groupIconMap: {},
                renderGroupIconMap: {},
                searchList: []
            }
        },
        created () {
            // ['小图标', '填充图标', '线性图标']
            const groupIconMap = {
                '小图标': [],
                '填充图标': [],
                '线性图标': []
            }
            const searchList = []
            const iconComponentList = LC.getFramework() === 'vue3'
                ? vue3IconComponentList
                : vue2IconComponentList
            iconComponentList.forEach(icon => {
                groupIconMap[icon.group].push(icon)
                searchList.push(icon)
            })
            this.groupIconMap = Object.freeze(groupIconMap)
            this.renderGroupIconMap = Object.freeze(groupIconMap)
            this.searchList = Object.freeze(searchList)
        },
        methods: {
            /**
             * @desc icon搜索
             */
            handleSearchChange (data) {
                if (!data) {
                    this.renderGroupIconMap = Object.freeze(this.groupIconMap)
                    return
                }
                const renderGroupIconMap = {}
                Object.keys(this.groupIconMap).forEach(groupName => {
                    const groupList = this.groupIconMap[groupName]
                    groupList.forEach(icon => {
                        if (icon.name === data.name) {
                            if (!renderGroupIconMap[groupName]) {
                                renderGroupIconMap[groupName] = []
                            }
                            renderGroupIconMap[groupName].push(icon)
                        }
                    })
                })
                this.renderGroupIconMap = Object.freeze(renderGroupIconMap)
            }
        }
    }
</script>
