<template>
    <li :class="[message.type, 'message-main']">
        <template v-if="message.type === 'ai'">
            <span class="message-photo ai">
                <i class="bk-drag-icon bk-drag-ai"></i>
            </span>
            <p class="message-content ai">
                <i v-if="statusIcon" :class="statusIcon"></i>
                <svg v-if="message.status === 'loading'" aria-hidden="true" width="16" height="16" class="loading-message">
                    <use xlink:href="#bk-drag-loading-2"></use>
                </svg>
                <span class="message-wrap">{{ message.content }}</span>
            </p>
        </template>
        <template v-else>
            <p class="message-content user">
                <span class="message-wrap">{{ message.content }}</span>
            </p>
            <span class="message-photo user">
                <img src="../../../../../../../images/ai-user.png" />
            </span>
        </template>
    </li>
</template>

<script>
    export default {
        props: {
            message: Object
        },

        computed: {
            statusIcon () {
                const iconMap = {
                    success: 'bk-drag-icon bk-drag-check-circle-fill',
                    error: 'bk-drag-icon bk-drag-close-circle-fill'
                }

                return iconMap[this.message?.status]
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .message-main {
        display: flex;
        align-items: top;
        width: 80%;
        &.user {
            float: right;
            justify-content: flex-end;
        }
        &:after {
            content: '';
            clear: both;
            display: table;
        }
    }
    .message-photo {
        display: inline-block;
        min-width: 36px;
        max-width: 36px;
        min-height: 36px;
        max-height: 36px;
        &.ai {
            background: #3A84FF;
            border-radius: 100%;
            padding: 7.5px 8px 7px 6.5px;
            .bk-drag-ai {
                font-size: 22px;
                color: #fff;
            }
        }
        &.user {
            img {
                width: 36px;
                height: 36px;
            }
        }
    }
    .message-content {
        border-radius: 8px;
        padding: 10px 16px;
        line-height: 22px;
        position: relative;
        max-width: 100%;
        word-break: break-all;
        &:before {
            position: absolute;
            top: 15px;
            content: '';
            display: inline-block;
            height: 10px;
            width: 10px;
            transform: rotate(45deg);
        }
        .message-wrap {
            white-space: pre-wrap;
            display: inline-break;
        }
        &.ai {
            background: #FFFFFF;
            color: #63656E;
            margin-left: 15px;
            &:before {
                background: #FFFFFF;
                left: -5px;
            }
        }
        &.user {
            background: #E1ECFF;
            color: #313238;
            margin-right: 13px;
            &:before {
                background: #E1ECFF;
                right: -5px;
            }
        }
    }
    .bk-drag-icon {
        margin-right: 5px;
        font-size: 16px;
        &.bk-drag-check-circle-fill {
            color: #2DCB56;
        }
        &.bk-drag-close-circle-fill {
            color: #EA3636;
        }
    }
    .loading-message {
        margin-right: 5px;
        vertical-align: sub;
        fill: #3a84ff;
        animation: icon-loading 1.5s linear infinite;
    }
</style>
