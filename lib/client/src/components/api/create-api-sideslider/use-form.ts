import {
    ref
} from 'vue'

export default (emit) => {
    const editObjectRef = ref(null)

    const update = (name, value) => {
        emit('update', {
            [name]: value
        })
    }

    return {
        editObjectRef,
        update
    }
}
