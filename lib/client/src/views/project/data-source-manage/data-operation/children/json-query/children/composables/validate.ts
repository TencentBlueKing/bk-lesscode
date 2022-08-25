class Validate {
    public componentList: any[]

    constructor () {
        this.componentList = []
    }

    register (component) {
        this.componentList.push(component)
    }

    unRegister (component) {
        const index = this.componentList.findIndex(item => item === component)
        this.componentList.splice(index, 1)
    }

    validate () {
        return Promise.all(this.componentList.map(component => component.validate()))
    }
}

export default new Validate()
