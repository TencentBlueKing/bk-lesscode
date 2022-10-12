<template>
    <section class="choose-perm-action-main">
        <slot name="header"></slot>
        <bk-select class="choose-perm-action-select" :loading="iamAppPermActionLoading"
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
            <div slot="extension" @click="goCreateAction" style="cursor: pointer;">
                <i class="bk-icon icon-plus-circle"></i> 新增操作
            </div>
        </bk-select>
    </section>
</template>

<script>
    import { IAM_APP_PERM_BUILDIN_ACTION } from 'shared/constant'

    export default {
        components: {
        },

        props: {
            selectedActions: {
                type: Array,
                default: () => []
            }
        },

        data () {
            return {
                iamAppPermActionList: [],
                iamAppPermActionLoading: false,
                selectVals: []
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },

        async created () {
            await this.fetchIamAppPermAction()
            this.selectVals.splice(0, this.selectVals.length, ...this.selectedActions.map(item => item.id))
        },

        methods: {
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
                        ...list.filter(item => item.registeredStatus !== -1 && item.actionId !== IAM_APP_PERM_BUILDIN_ACTION)
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

            goCreateAction () {
                this.$router.push({
                    name: 'appPermModel'
                })
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
