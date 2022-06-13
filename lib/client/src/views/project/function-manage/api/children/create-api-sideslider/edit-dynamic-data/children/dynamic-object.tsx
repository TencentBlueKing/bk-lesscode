import {
    ref,
    defineComponent
} from '@vue/composition-api'
import DynamicHeader from './dynamic-header'
import SingleSchemeComponent from './single-scheme'

export default defineComponent({
    props: {
        editScheme: Object
    },

    setup (props, { emit }) {
        const schemeRef = ref(null)

        const handleUpdate = (scheme) => {
            emit('change', scheme)
        }

        const validate = () => {
            return schemeRef.value.validate()
        }

        return {
            schemeRef,
            handleUpdate,
            validate
        }
    },

    render () {
        return (
            <section>
                <DynamicHeader />
                <SingleSchemeComponent
                    ref="schemeRef"
                    typeDisable={true}
                    minusDisable={true}
                    scheme={this.editScheme}
                    onUpdate={this.handleUpdate}
                    disable={this.disableEditRoot}
                />
            </section>
        )
    }
})
