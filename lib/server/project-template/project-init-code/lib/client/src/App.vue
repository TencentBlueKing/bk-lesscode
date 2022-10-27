<template>
    <div id="app" :class="[systemCls, { 'mobile-page': isMobilePage }]">
        <main :class="{ 'mobile-page': isMobilePage }">
            <apply-page v-if="isNotPermission" :auth-result="authResult" />
            <router-view v-else :key="routerKey" />
        </main>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { bus } from '@/common/bus'
    import ApplyPage from '@/components/apply-permission/apply-page.vue'
    import auth from '@/common/auth'

    export default {
        name: 'app',
        components: {
            ApplyPage
        },
        data () {
            return {
                routerKey: +new Date(),
                systemCls: 'mac',
                isNotPermission: false,
                authResult: {
                    requiredPermissions: []
                }
            }
        },
        computed: {
            isMobilePage () {
                return this.$route.meta.platform === 'MOBILE'
            },
            ...mapGetters(['mainContentLoading'])
        },
        watch: {
        },
        created () {
            const platform = window.navigator.platform.toLowerCase()
            if (platform.indexOf('win') === 0) {
                this.systemCls = 'win'
            }

            bus.$on('permission-page', this.permissionHold)
            this.$once('hook:beforeDestroy', () => {
                bus.$off('permission-page', this.permissionHold)
            })
        },
        mounted () {
            bus.$on('redirect-login', data => {
                auth.redirectToLogin()
            })
        },
        methods: {
            permissionHold (authResult) {
                this.isNotPermission = true
                this.authResult = authResult
            },

            /**
             * router 跳转
             *
             * @param {string} idx 页面指示
             */
            goPage (idx) {
                this.$router.push({
                    name: idx
                })
            }
        }
    }
</script>

<style lang="postcss">
    @import './css/reset.css';
    @import './css/app.css';
    .mobile-page {
        height: 100%;
    }

</style>
