<template>
    <section class="render-header">
        <span class="header-title">{{ moduleCode }}</span>

        <section class="header-input">
            <section
                :style="{
                    '--text-height': textHeight + 'px',
                    'width': '100%',
                    'max-width': '920px',
                    'margin-right': '8px'
                }"
            >
                <bk-input
                    ref="inputRef"
                    class="send-input"
                    type="textarea"
                    row="2"
                    :placeholder="$t('通过输入需求描述，自动生成开发框架')"
                    :native-attributes="{ autofocus: 'autofocus' }"
                    v-model="userInput"
                ></bk-input>
            </section>
            <bk-button
                theme="primary"
                :disabled="!userInput"
                :loading="isLoading"
                @click="handleGenerate"
            >
                {{ $t('立即生成') }}
            </bk-button>
        </section>
    </section>
</template>

<script>
    import {
        ref,
        watch
    } from '@vue/composition-api'

    export default {
        props: {
            moduleCode: {
                type: String,
                required: true
            }
        },

        setup () {
            const userInput = ref('')
            const textHeight = ref(54)
            const isLoading = ref(false)

            const handleChangeTextHeight = () => {
                const lines = userInput.value.split(/\r?\n/)
                let height = 22 + lines.length * 16
                if (height >= 460) {
                    height = 200
                }
                textHeight.value = height
            }

            const handleGenerate = () => {
                isLoading.value = true
                userInput.value = ''
            }

            watch(
                () => userInput.value,
                handleChangeTextHeight
            )

            return {
                userInput,
                textHeight,
                isLoading,
                handleGenerate
            }
        }
    }
</script>

<style lang="postcss" scoped>
.render-header {
    width: 100%;
    height: 146px;
    background: #FFFFFF;
    border: 1px solid #DCDEE5;
    padding: 18px 24px 24px;
}
.header-title {
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
    color: #313238;
}
.header-input {
    display: flex;
    align-items: flex-start;
    margin-top: 26px;
}

.send-input {
  flex-direction: row;
  >>> textarea {
    font-size: 14px;
    line-height: 16px;
    height: var(--text-height);
    min-height: 54px;
    padding: 11px 38px 10px 11px;
    resize: none !important;
    color: #63656e;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      height: 5px;
      border-radius: 3px;
      background-color: #dcdee5;
    }
    &::placeholder {
      line-height: 16px;
    }
  }
}
</style>
