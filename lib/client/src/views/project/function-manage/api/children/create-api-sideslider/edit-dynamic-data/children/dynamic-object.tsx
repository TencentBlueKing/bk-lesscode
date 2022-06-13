import {
    defineComponent
} from '@vue/composition-api'
import DyncmicHeader from './dyncmic-header'
import SingleSchemeComponent from './single-scheme'

export default defineComponent({
    props: {
        editScheme: Object
    },

    setup (props, { emit }) {
        const handleUpdate = (scheme) => {
            emit('change', scheme)
        }

        return {
            handleUpdate
        }
    },

    render () {
        return (
            <section>
                <DyncmicHeader />
                <SingleSchemeComponent
                    scheme={this.editScheme}
                    onUpdate={this.handleUpdate}
                    disable={this.disableEditRoot}
                />
            </section>
        )
    }
})
