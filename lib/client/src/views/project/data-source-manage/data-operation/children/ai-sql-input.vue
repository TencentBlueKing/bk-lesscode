<template>
    <section class="ai-input-area">
        <bk-input
            class="ai-input"
            v-model="content"
            :clearable="true"
            :show-clear-only-hover="true"
            :placeholder="$t('请描述查询需求，比如：查询school表的id, name字段数据')"
            @enter="handleUserInput"
        />
        <bk-button theme="primary" :disabled="!content" :loading="isLoading" @click="handleUserInput">{{$t('生成SQL')}}</bk-button>
        <p class="error-tips" v-if="currentMessage.status === 'error'">{{currentMessage.content}}</p>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        reactive,
        watch
    } from '@vue/composition-api'
    import { Ai } from '@/common/ai'
    import systemPrompt from './system-sql-prompt.txt'

    export default defineComponent({
        props: {
            tableData: {
                type: Array,
                default: () => ([])
            },
            generateSql: {
                type: Function,
                default: () => {}
            }
        },
        setup (props, { emit }) {
            let currentMessage = reactive({ type: 'ai', content: '', 'status': ''})
            const messages = ref([])
            const content = ref('')
            const isLoading = ref(false)

            watch(
                () => props.tableData,
                () => {
                    clearMessage()
                }
            )

            const pushMessage = (type, content, status) => {
                const message = {
                    type,
                    content,
                    status
                }
                messages.value.push(message)
                return message
            }

            // 处理 ai 消息
            const handleMessage = (message, content) => {
                currentMessage.content = message
            }

            // 开始处理 ai 消息
            const handlerStart = () => {
                currentMessage.content = ''
            }
            
            // 结束 ai 消息处理
            const handleEnd = () => {
                isLoading.value = false
                
                if (currentMessage.content?.startsWith('SELECT')) {
                    currentMessage.status = 'success'
                    props.generateSql(currentMessage.content)
                } else {
                    currentMessage.status = 'error'
                }
            }

            // 异常处理
            const handleApiError = (message) => {
                currentMessage.content = message
                currentMessage.status = 'error'
                isLoading.value = false
                aiHelper.clearPrompt()
            }

            const clearMessage = () => {
                messages.value = []
                isLoading.value = false
                aiHelper.clearPrompt()
            }

            const getTableStructure = () => {
                let tableStr = 'TableName and columns you can use as follows: \n'
                props.tableData.forEach((table) => {
                    const cols = table.columns.map(item => item.name)
                    tableStr += ` - tableName: ${table.tableName}, colunms: ${JSON.stringify(cols)}\n`
                })
                return tableStr
            }

            const getTableInfoPrompt = () => {
                let sysPromt = ''
                sysPromt += getTableStructure()
                sysPromt += '\n - If you can generate the sql, return the sql only, otherwise, you should return explanation in Chinese'
                return sysPromt
            }

            const addSqlPrompt = () => {
                const tables = props.tableData || []
                if (tables.length === 0) {
                    const noDataPrompt = 'There are no data tables in the database， you should return "数据库中没有任何的数据表, 请先创建" now'
                    aiHelper.pushPrompt(noDataPrompt, 'system')
                } else {
                    let tablePrompt = ''
                    tablePrompt += getTableStructure()
                    tablePrompt += '\n - If you can generate the sql, return the sql only, otherwise, you should return explanation in Chinese'
                    aiHelper.pushPrompt(tablePrompt, 'system')
                }
            }

            const handleUserInput = () => {
                if (isLoading.value || !content.value) return

                // 根据数据库中的数据，动态添加prompt
                addSqlPrompt()

                // 记录输入的数据
                const userInput = content.value
                pushMessage('user', userInput)
                // // 清除input
                // content.value = ''
                // 返回loading message
                // currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                // 输入框loading状态
                isLoading.value = true
                aiHelper.chat(`help me solve this task:\n ${userInput}`)
            }

            const aiHelper = new Ai({
                handlerStart,
                handleEnd,
                handleMessage,
                handleApiError,
                systemPrompt,
                type: 'sql'
            })
            return {
                messages,
                currentMessage,
                content,
                isLoading,
                handleUserInput
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .ai-input-area {
        .ai-input {
            width: calc(100% - 330px);
            margin-right: 30px;
        }
        .error-tips {
            color: red;
            font-size: 12px;
            line-height: 18px;
            margin-top: 4px;
        }
    }
    
</style>