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
    import DimProject from './dim-project.vue'
    import DimTime from './dim-time.vue'

    export default {
        components: {
            DimProject,
            DimTime
        },
        data () {
            return {
                panels: [
                    { name: 'project', label: window.i18n.t('按应用') },
                    { name: 'time', label: window.i18n.t('按时间') }
                ],
                active: ''
            }
        },
        watch: {
            '$route.query.tab': {
                immediate: true,
                handler: function (tab) {
                    this.active = tab || 'project'
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
