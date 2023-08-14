<template>
    <div class="lesscode-materials-panel-content">
        <template v-if="!iconList.length">
            <bk-exception
                class="project-icon-empty"
                type="empty"
                scene="part">
                <p class="empty-content"><span>{{$t('暂无图标')}}，</span><span class="to-icon-link" @click="toIconManage">{{$t('跳转绑定')}}</span></p>
            </bk-exception>
        </template>
        <template v-else>
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
        </template>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import GroupBox from '../../common/group-box'
    import SearchBox from '../../common/search-box'
    import RenderIcon from '../../common/group-box/render-icon'

    export default {
        name: '',
        components: {
            GroupBox,
            SearchBox,
            RenderIcon
        },
        data () {
            return {
                renderGroupIconMap: {},
                searchList: []
            }
        },
        computed: {
            ...mapState('iconManage', ['iconList']),
            projectId () {
                return this.$route.params.projectId
            }
        },
        async created () {
            if (!this.iconList.length) {
                await this.$store.dispatch('iconManage/list', {
                    belongProjectId: this.projectId
                })
            }
            const groupIconMap = {
                '自定义图标': []
            }
            const searchList = []

            // 注册自定义 icon
            if (this.iconList.length > 0) {
                groupIconMap['自定义图标'] = Object.freeze(this.iconList.map(data => ({
                    name: data.name,
                    displayName: '自定义图标',
                    type: 'bk-custom-icon',
                    icon: data.icon,
                    events: [{ name: 'click' }],
                    group: '',
                    order: 1,
                    styles: ['margin', 'size', 'font'],
                    renderStyles: {
                        display: 'inline-block',
                        fontSize: '14px'
                    },
                    props: {
                        type: {
                            type: 'hidden',
                            val: data.name
                        },
                        svg: {
                            type: 'boolean',
                            val: true
                        }
                    }
                })))
            }
            
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
            },
            toIconManage () {
                const route = this.$router.resolve({
                    name: 'iconManage',
                    params: {
                        projectId: this.projectId
                    }
                })
                window.open(route.href, '_blank')
            }
        }
    }
</script>
<style lang="postcss" scoped>

    .project-icon-empty {
        font-size: 12px;
        .to-icon-link {
            cursor: pointer;
            color: #3A84FF;
        }
    }

</style>
