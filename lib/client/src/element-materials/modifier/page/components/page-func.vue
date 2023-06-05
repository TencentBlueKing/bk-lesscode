<template>
    <div class="page-setting-container">
        <style-layout
            :key="groupName"
            :title="groupName">
            <template v-for="func in lifeCycleList">
                <section :key="func.id">
                    <div class="setting-content">
                        <choose-function
                            class="choose-event"
                            :choosen-function="lifeCycle[func.id] || {}"
                            @change="(val) => chooseFunction(func.id, val)"
                            @clear="chooseFunction(func.id, '')"
                        >
                            <template v-slot:header>
                                <div class="setting-label">
                                    <span v-bk-tooltips="{ content: func.desc, maxWidth: 400, disabled: !func.desc }" class="field-display-name">{{func.name}}</span>：
                                </div>
                            </template>
                        </choose-function>
                    </div>
                </section>
            </template>
        </style-layout>
    </div>
</template>

<script>
    import StyleLayout from '@/element-materials/modifier/component/styles/layout/index'
    import ChooseFunction from '@/components/methods/choose-function/index.vue'
    import { defineComponent, computed } from '@vue/composition-api'
    import store from '@/store'

    export default defineComponent({
        components: {
            StyleLayout,
            ChooseFunction
        },
        setup () {
            const groupName = window.i18n.t('生命周期')
            const lifeCycleDescMap = {
                created: window.i18n.t('在页面创建完成后被立即调用，这个时候页面还未渲染，可以做获取远程数据的操作'),
                beforeMount: window.i18n.t('在页面挂载开始之前被调用'),
                mounted: window.i18n.t('页面被挂载后调用，这个时候页面已经渲染完成，可以做 DOM 操作'),
                beforeUpdate: window.i18n.t('在数据更新后，页面实时更新前调用，这里适合在更新之前访问现有的 DOM'),
                updated: window.i18n.t('在数据更新后，页面实时更新后调用'),
                activated: window.i18n.t('被 keep-alive 缓存的组件激活时调用'),
                deactivated: window.i18n.t('被 keep-alive 缓存的组件停用时调用'),
                beforeDestroy: window.i18n.t('页面关闭之前调用，页面中的数据仍然完全可用，可以做离开页面前的操作'),
                destroyed: window.i18n.t('页面关闭后调用，该钩子被调用后，页面中的数据不可用')
            }
            const lifeCycleList = computed(() => {
                const lifeCycleKeys = Object.keys(lifeCycleDescMap) || []
                return lifeCycleKeys.map((lifeCycleKey) => {
                    return {
                        id: lifeCycleKey,
                        name: lifeCycleKey,
                        type: 'selectFunc',
                        desc: lifeCycleDescMap[lifeCycleKey]
                    }
                })
            })
            const lifeCycle = computed(() => {
                return store.getters['page/pageDetail']?.lifeCycle
            })
            function chooseFunction (key, value) {
                const newData = {
                    ...lifeCycle.value,
                    [key]: value
                }
                store.commit('page/setPageDetail', Object.assign({}, store.getters['page/pageDetail'], { lifeCycle: newData }))
            }
            return {
                groupName,
                lifeCycle,
                lifeCycleList,
                chooseFunction
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .setting-label {
        margin-bottom: 6px;
    }
    .setting-content {
        margin-bottom: 12px;
        .choose-event {
            background: #f0f1f5;
            border-radius: 2px;
            padding: 8px;
            &:hover {
                box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 20%);
            }
        }
    }
</style>
