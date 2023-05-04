export let framework = 'vue2'

// 设置当前的框架
export const setFramework = (data) => {
    framework = data
}

// 获取当前框架
export const getFramework = () => {
    return framework
}
