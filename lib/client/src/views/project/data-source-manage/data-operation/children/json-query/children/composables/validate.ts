class Validate {
    public methods: any[]

    constructor () {
        this.methods = []
    }

    register (method) {
        this.methods.push(method)
    }

    unRegister (method) {
        const index = this.methods.findIndex(item => item === method)
        this.methods.splice(index, 1)
    }

    validate () {
        return Promise.all(this.methods.map(method => method()))
    }
}

export default new Validate()
