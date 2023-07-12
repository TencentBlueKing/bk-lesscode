<template>
    <section class="template-area" v-if="showTemplateIntro">
        <div class="template-header">
            <div class="template-title" @click="toggleShowTemplate">
                <i 
                    class="bk-drag-icon" :class="{ 'bk-drag-angle-up-fill': isOpenTemplate, 'bk-drag-icon bk-drag-angle-right-fill': !isOpenTemplate }">
                </i>
                <span class="title-content">{{ $t('推荐的应用模板') }}</span>
            </div>
            <div class="header-operate-btns">
                <span @click="toTemplateMarket" class="operate-btn" style="margin-right: 6px;">
                    <span>{{ $t('跳转查看更多模板') }}</span>
                    <i class="bk-drag-icon bk-drag-cc-jump-link"></i>
                </span>
                <span @click="confirmHide" class="operate-btn">
                    <span>{{ $t('不再显示') }}</span>
                    <i class="bk-drag-icon bk-drag-close-small"></i>
                </span>
            </div>
        </div>
        <project-template-list v-show="isOpenTemplate" :project-list="appTemplateList" />
    </section>
</template>

<script>
    import { defineComponent, ref, computed, onBeforeMount } from '@vue/composition-api'
    import store from '@/store'
    import router from '@/router'
    import { bkInfoBox } from 'bk-magic-vue'
    import ProjectTemplateList from './project-template-list'

    export default defineComponent({
        components: {
            ProjectTemplateList
        },
        setup () {
            const stoageTemplatFlag = localStorage.getItem('hideTemplateList') || false
            const showTemplateIntro = ref(!stoageTemplatFlag)
            const isOpenTemplate = ref(true)
            const appTemplateList = ref([])

            onBeforeMount(async () => {
                await initTemplate()
            })

            async function initTemplate () {
                if (showTemplateIntro) {
                    const params = { filter: 'official', officialType: '' }
                    const res = await store.dispatch('project/query', { config: { params } })
                    appTemplateList.value =  res.projectList || []
                }
            }

            function toggleShowTemplate () {
                isOpenTemplate.value = !isOpenTemplate.value
            }

            function toTemplateMarket () {
                window.open('/marketplace/template', '_blank')
            }

            function confirmHide () {
                bkInfoBox({
                    title: window.i18n.t('确认不再显示'),
                    okText: window.i18n.t('确认'),
                    subTitle: window.i18n.t('确认后将不再展示推荐模板，后续可以前往【资源市场】查看'),
                    confirmFn: async () => {
                        showTemplateIntro.value = false
                        localStorage.setItem('hideTemplateList', true)
                    }
                })
            }

            return {
                showTemplateIntro,
                isOpenTemplate,
                appTemplateList,
                toggleShowTemplate,
                toTemplateMarket,
                confirmHide
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .template-area {
        margin: 24px 0;
        width: 100%;
        .template-header {
            padding: 6px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .template-title {
                cursor: pointer;
                font-size: 14px;
                color: #313238;
                font-weight: 700;
                i {
                    color: #63656E;
                    transition: all .1s linear;
                }
            }
            .header-operate-btns {
                .operate-btn {
                    font-size: 12px;
                    padding: 4px 6px;
                    border-radius: 2px;
                    color: #63656E;
                    background-color: #F0F1F5;
                    cursor: pointer;
                    &:hover {
                        color: #3A84FF;
                        background-color: #EDF4FF;
                    }
                }
            }
        }
    }
</style>