<template>
    <section class="form-section">
        <header>
            <h4 class="section-title">{{ title }}</h4>
            <p class="section-desc">{{ desc }}</p>
        </header>
        <div class="section-content">
            <slot></slot>
        </div>
    </section>
</template>
<script>
    export default {
        name: 'formSection',
        props: {
            title: String,
            desc: String
        },
        methods: {
            validate () {}
        }
    }
</script>
<style lang="postcss" scoped>
    .form-section {
        padding: 24px;
        background: #ffffff;
        box-shadow: 0 2px 4px 0 rgba(25,25,41,0.05);
    }
    header {
        display: flex;
        align-items: center;
        .section-title {
            margin: 0;
            font-size: 14px;
            color: #313238;
        }
        .section-desc {
            margin: 0;
            font-size: 12px;
            color: #979ba5;
        }
    }
    .section-content {
        padding: 0 106px;
    }
</style>
