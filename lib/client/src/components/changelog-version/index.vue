
<template>
    <bk-version-detail
        :min-left-width="200"
        :current-version="(versionMassage.versionList[0] || '').title"
        :finished="finished"
        :show.sync="isShow"
        :version-list="versionMassage.versionList"
        :version-detail="versionMassage.versionDetail"
        :get-version-detail="handleGetVersionDetail"
        :get-version-list="handleGetVersionList">
        <template v-slot:default="content">
            <div v-if="content.detail">
                <h2>【{{content.detail}}】版本更新明细</h2>
                <div v-for="(currentDetail, index) in versionMassage.currentDetailList" :key="index">
                    <h1 class="change-log-header">{{currentDetail.reviseTitle}}</h1>
                    <ul>
                        <li class="change-log-msg" v-for="(massage,index1) in currentDetail.logMassage" :key="index1">[{{currentDetail.reviseTitle}}] {{massage}}</li>
                    </ul>
                </div>
            </div>
        </template>
    </bk-version-detail>
</template>
<script>
    import { defineComponent, ref, reactive } from '@vue/composition-api'
    import logMassageList from './changelog-data'
    export default defineComponent({
        setup () {
            const finished = ref(false)
            const isShow = ref(false)
            const versionMassage = reactive({
                versionList: [],
                versionDetail: '',
                currentDetailList: []
            })
            const handleGetVersionList = () => {
                return new Promise(resolve => {
                    const titleList = logMassageList.map(item => {
                        return {
                            title: item.date
                        }
                    })
                    versionMassage.versionList = titleList
                    finished.value = true
                    resolve()
                })
            }
            const handleGetVersionDetail = (v) => {
                return new Promise(resolve => {
                    versionMassage.versionDetail = v.title
                    const currentIndex = logMassageList.findIndex(item => item.date === v.title)
                    versionMassage.currentDetailList = logMassageList[currentIndex].detailList
                    resolve()
                })
            }
            const changeIsShow = () => {
                isShow.value = !isShow.value
            }
            return {
                finished,
                versionMassage,
                isShow,
                handleGetVersionList,
                handleGetVersionDetail,
                changeIsShow
            }
        }
    })
</script>
<style lang="postcss" scoped>

    .change-log-header {
        padding-bottom: 5px;
        font-size: 18px;
        line-height: 1.225;
        border-bottom: 1px solid #eee;
            }

    .change-log-msg {
        line-height: 24px;

        &::before {
            width: 5px;
            height: 5px;
            margin: 0px 10px;
            background-color: #63656e;
            border-radius: 50%;
            content: "";
            display: inline-block;
    }
    }
    
</style>
