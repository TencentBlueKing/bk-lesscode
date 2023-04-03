<template>
    <main class="operation-content">
        <div class="g-page-tab">
            <div class="tab-item"
                v-for="(panel, index) in panels"
                :key="index"
                :class="{ active: active === panel.name }"
                @click="handleTabChange(panel.name)">{{panel.label}}</div>
        </div>
        <component :is="`dim-${active}`" />
    </main>
</template>

<script>
    import DimFunc from './dim-func.vue'
    import DimTime from './dim-time.vue'

    export default {
        components: {
            DimFunc,
            DimTime
        },
        data () {
            return {
                panels: [
                    { name: 'func', label: window.i18n.t('按函数') },
                    { name: 'time', label: window.i18n.t('按时间') }
                ],
                active: ''
            }
        },
        watch: {
            '$route.query.tab': {
                immediate: true,
                handler: function (tab) {
                    this.active = tab || 'func'
                }
            }
        },
        methods: {
            handleTabChange (name) {
                if (name === this.$route.query.tab) {
                    return
                }
                this.$router.push({
                    query: { ...this.$route.query, tab: name }
                })
            }
        }
    }
</script>
