<template>
    <section class="choose-perm-action-main">
        <slot name="header"></slot>
        <bk-select class="choose-perm-action-select" :loading="iamAppPermActionLoading"
            ref="selectRef"
            searchable
            multiple
            display-tag
            v-model="selectVals"
            @selected="handleSelected"
            @clear="handleClear">
            <bk-option v-for="option in iamAppPermActionList"
                :key="option.id"
                :id="option.id"
                :name="option.displayName">
            </bk-option>
            <div slot="extension" @click="showCreatePermSlider = true" style="cursor: pointer;">
                <i class="bk-icon icon-plus-circle"></i> {{ $t('新建操作') }}
            </div>
        </bk-select>
        <app-perm-model-sideslider
            :is-show="showCreatePermSlider"
            :iam-app-perm="iamAppPerm"
            :is-default-action="false"
            @hide-sideslider="showCreatePermSlider = false"
            @success="sidesliderSuccess"
        />
    </section>
</template>

<script>
    import { IAM_APP_PERM_BUILDIN_ACTION } from 'shared/constant'
    import AppPermModelSideslider from '@/views/project/app-perm-model/app-perm-model-sideslider.vue'

    export default {
        components: {
            AppPermModelSideslider
        },

        props: {
            selectedActions: {
                type: Array,
                default: () => []
            }
        },

        data () {
            return {
                iamAppPerm: {},
                iamAppPermActionList: [],
                iamAppPermActionLoading: false,
                selectVals: [],
                showCreatePermSlider: false
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },

        async created () {
            await Promise.all([
                this.fetchIamAppPerm(),
                this.fetchIamAppPermAction()
            ])
            this.selectVals.splice(0, this.selectVals.length, ...this.selectedActions.map(item => item.id))
        },

        methods: {
            async fetchIamAppPerm () {
                try {
                    const res = await this.$store.dispatch('iam/getIamAppPerm', { projectId: this.projectId })
                    this.iamAppPerm = Object.assign({}, res)
                } catch (e) {
                    console.error(e)
                }
            },
            async fetchIamAppPermAction () {
                this.iamAppPermActionLoading = true
                try {
                    const list = await this.$store.dispatch('iam/getIamAppPermAction', { projectId: this.projectId })
                    list.forEach(item => {
                        item.displayName = `${item.actionId}(${item.actionName})`
                    })
                    this.iamAppPermActionList.splice(
                        0,
                        this.iamAppPermActionList.length,
                        ...list.filter(
                            item => item.actionId !== IAM_APP_PERM_BUILDIN_ACTION
                        ).map(item => {
                            return {
                                id: item.id,
                                actionId: item.actionId,
                                actionName: item.actionName,
                                displayName: item.displayName
                            }
                        })
                    )
                } catch (e) {
                    console.error(e)
                } finally {
                    this.iamAppPermActionLoading = false
                }
            },

            handleSelected (vals) {
                this.$emit('select-action', this.iamAppPermActionList.filter(item => vals.indexOf(item.id) > -1))
            },

            handleClear () {
                this.$emit('clear-action')
            },

            async sidesliderSuccess () {
                this.$bkMessage({
                    theme: 'success',
                    message: this.$t('新建操作成功')
                })
                this.showCreatePermSlider = false
                await this.fetchIamAppPermAction()
                this.$refs.selectRef.show()
            }
        }
    }
</script>

<style lang='postcss' scoped>
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .choose-perm-action-main {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .choose-perm-action-select {
        width: 264px;
        /deep/ .bk-select-dropdown {
            background-color: #fff;
        }
    }
</style>
