export const getResetFormValueFunc = (formModel) => {
    const bodyTemplate = `// 注意，这里的 “{formmodel}” 需要替换成表单容器组件的model属性变量名
// 可以使用 lesscode. 来唤起快捷输入，然后选择表单容器的变量
const formData = this.{formmodel} || {}
const defaultMap = {
    '[object String]': '',
    '[object Date]': '',
    '[object Number]': 0,
    '[object Boolean]': false,
    '[object Object]': {},
    '[object Array]': [],
    '[object Function]': () => { }
}
const formKeys = Object.keys(formData)
formKeys.forEach((formKey) => {
    const value = formData[formKey]
    const valueType = Object.prototype.toString.apply(value)
    if (defaultMap.hasOwnProperty(valueType)) {
        formData[formKey] = defaultMap[valueType]
    }
})
`
    return bodyTemplate.replaceAll('{formmodel}', formModel)
}

export const getSubmitFormDataFunc = (replaceMap) => {
    let bodyTemplate = `// refs['{ref}']中的form为表单容器设置的ref属性的值，如有修改请作相应修改
return this.$refs['{ref}'].validate().then(validator => {
    // 进行业务处理
    alert('验证成功！')
    // 表单数据组装
    // 注意：示例this.{formmodel}中 “{formmodel}” 为表单容器组件model属性的变量名，如与当前容器配置不一致请作相应修改
    const data = this.{formmodel}
    // 如果需要获取单个属性的值可使用this.{formmodel}.***
    // {urlTips}
    return this.$http.post('{posturl}', data).then(res => {
        // 可以在这里添加业务操作
        return res
    }).catch((err) => {
        console.log(err)
    })
}, validator => {
    // 显示第一个出错位置
    alert(validator.content)
})
`
    for (const key in replaceMap) {
        bodyTemplate = bodyTemplate.replaceAll(key, replaceMap[key])
    }
    return bodyTemplate
}
