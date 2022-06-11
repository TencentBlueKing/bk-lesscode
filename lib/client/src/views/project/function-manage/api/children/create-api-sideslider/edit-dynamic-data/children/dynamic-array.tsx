import {
    defineComponent,
    ref,
    watch
} from '@vue/composition-api'
import {
    getDefaultApiParamEditScheme,
    API_PARAM_TYPES
} from 'shared/api'
import DyncmicHeader from './dyncmic-header'
import SingleSchemeComponent from './single-scheme'

export default defineComponent({
    props: {
        editScheme: Array
    },

    setup (props, { emit }) {
        const arrayScheme = ref(getDefaultApiParamEditScheme({
            type: API_PARAM_TYPES.OBJECT.VAL
        }))

        const handleUpdate = (scheme, index) => {
            arrayScheme.value.properties.splice(index, 1, scheme)
            emit('change', arrayScheme.value.properties)
        }

        watch(
            () => props.editScheme,
            (editScheme) => {
                arrayScheme.value.properties = editScheme.map((scheme) => ({
                    ...scheme,
                    parent: arrayScheme.value
                }))
            },
            {
                immediate: true
            }
        )

        return {
            arrayScheme,
            handleUpdate
        }
    },

    render () {
        return (
            <section>
                <DyncmicHeader />
                {
                    this.arrayScheme.properties.map((scheme, index) => (
                        <SingleSchemeComponent
                            scheme={scheme}
                            typeDisable={true}
                            onUpdate={(scheme) => this.handleUpdate(scheme, index)}
                        />
                    ))
                }
            </section>
        )
    }
})
