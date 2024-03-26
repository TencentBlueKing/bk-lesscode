<template>
    <layout
        class="api-manage"
        v-bkloading="{ isLoading }"
    >
        <api-category
            slot="left"
            ref="apiCategory"
            @categoryChange="handleCategoryChange"
        />
        <api-list
            :category-id="categoryId"
            :category-name="categoryName"
            @freshList="handleFresh"
        />
    </layout>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import Layout from '@/components/ui/layout'
    import ApiCategory from './children/category.vue'
    import ApiList from './children/list.vue'

    export default {
        components: {
            Layout,
            ApiCategory,
            ApiList
        },
        data () {
            return {
                categoryId: '',
                categoryName: '',
                isLoading: false
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', versionName: 'currentVersionName' }),

            projectId () {
                return parseInt(this.$route.params.projectId)
            }
        },
        created () {
            this.getVariableList()
        },
        methods: {
            ...mapActions('variable', [
                'getAllVariable'
            ]),

            getVariableList () {
                const params = {
                    projectId: this.projectId,
                    versionId: this.versionId,
                    effectiveRange: 0
                }
                this.isLoading = true
                this.getAllVariable(params).catch((err) => {
                    this.$bkMessage({ theme: 'error', message: err.message || err })
                }).finally(() => {
                    this.isLoading = false
                })
            },

            handleCategoryChange ({ id, name }) {
                this.categoryId = id
                this.categoryName = name
            },

            handleFresh () {
                this.$refs.apiCategory.initData()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .api-manage {
        height: 100%;
    }
</style>
