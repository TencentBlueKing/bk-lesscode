import {
    defineComponent,
    ref,
    watch,
    getCurrentInstance
} from '@vue/composition-api'
import {
    getDefaultApiParamEditScheme
} from 'shared/api'
import DynamicHeader from './dynamic-header'
import SingleSchemeComponent from './single-scheme'

export default defineComponent({
    props: {
        editScheme: Array
    },

    setup (props, { emit }) {
        const arrayScheme = ref([])
        const currentInstance = getCurrentInstance()

        const handleUpdate = (scheme, index) => {
            arrayScheme.value.splice(index, 1, scheme)
            triggleUpdate()
        }

        const plusBrotherNode = () => {
            arrayScheme.value.push(getDefaultApiParamEditScheme())
            triggleUpdate()
        }

        const minusNode = (index) => {
            arrayScheme.value.splice(index, 1)
            triggleUpdate()
        }

        const triggleUpdate = () => {
            emit('change', arrayScheme.value)
        }

        const validate = () => {
            const refs = currentInstance.proxy.$refs
            return Promise
                .all([
                    ...Object.keys(refs).map(key => (refs[key] as any).validate())
                ])
        }

        watch(
            () => props.editScheme,
            (editScheme) => {
                arrayScheme.value = editScheme
            },
            {
                immediate: true
            }
        )

        return {
            arrayScheme,
            handleUpdate,
            plusBrotherNode,
            minusNode,
            validate
        }
    },

    render () {
        return (
            <section>
                <DynamicHeader />
                {
                    this.arrayScheme.map((scheme, index) => (
                        <SingleSchemeComponent
                            ref={'schemeRef' + index}
                            scheme={scheme}
                            typeDisable={true}
                            minusDisable={this.arrayScheme.length <= 1}
                            onUpdate={(scheme) => this.handleUpdate(scheme, index)}
                            onPlusBrotherNode={this.plusBrotherNode}
                            onMinusNode={() => this.minusNode(index)}
                        />
                    ))
                }
            </section>
        )
    }
})
