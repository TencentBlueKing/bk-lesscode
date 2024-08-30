import { ObjectExt, Markup, Node } from '@antv/x6'

export class VueShape extends Node {}

function getMarkup (primer) {
    const markup = []
    const content = Markup.getForeignObjectMarkup()

    if (primer) {
        markup.push(
            ...[
                {
                    tagName: primer,
                    selector: 'body'
                },
                content
            ]
        )
    } else {
        markup.push(content)
    }

    return markup
}

VueShape.config({
    view: 'vue-shape-view',
    markup: getMarkup(),
    attrs: {
        body: {
            fill: 'none',
            stroke: 'none',
            refWidth: '100%',
            refHeight: '100%'
        },
        fo: {
            refWidth: '100%',
            refHeight: '100%'
        }
    },
    propHooks (metadata) {
        if (metadata.markup == null) {
            const primer = metadata.primer
            if (primer) {
                metadata.markup = getMarkup(primer)

                let attrs = {}
                switch (primer) {
                    case 'circle':
                        attrs = {
                            refCx: '50%',
                            refCy: '50%',
                            refR: '50%'
                        }
                        break
                    case 'ellipse':
                        attrs = {
                            refCx: '50%',
                            refCy: '50%',
                            refRx: '50%',
                            refRy: '50%'
                        }
                        break
                    default:
                        break
                }
                metadata.attrs = ObjectExt.merge(
                    {},
                    {
                        body: {
                            refWidth: null,
                            refHeight: null,
                            ...attrs
                        }
                    },
                    metadata.attrs || {}
                )
            }
        }
        return metadata
    }
})

Node.registry.register('vue-shape', VueShape, true)
