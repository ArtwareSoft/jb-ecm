component('remote.cmd', {
  type: 'data<common>',
  moreTypes: 'action',
  description: 'calc a script with jb.js',
  params: [
    {id: 'main', type: 'data<common>', dynamic: true, moreTypes: 'action<common>', description: 'e.g pipeline("hello","%% -- %$v1%")'},
    {id: 'wrap', as: 'string', description: 'e.g prune(MAIN)'},
    {id: 'context', description: 'e.g {v1: "xx", param1: prof1("yy") }'},
    {id: 'sourceCode', type: 'source-code<jbm>', mandatory: true},
    {id: 'id', as: 'string', description: 'jb.uri of cmd, default is main'},
    {id: 'viaHttpServer', as: 'string', defaultValue: 'http://localhost:8082'}
  ],
  impl: async (ctx, main, wrap, context, sourceCode, id, viaHttpServer) => {
        const args = [
            ['-main', jb.utils.prettyPrint(main.profile, { singleLine: true })],
            ['-wrap', wrap],
            ['-uri', id],
            ['-sourceCode', JSON.stringify(sourceCode)],
            ...Object.keys(context).map(k => [`%${k}`, context[k]]),
        ].filter(x => x[1])
        const body = JSON.stringify(args.map(([k, v]) => `${k}:${v}`))
        const url = `${viaHttpServer}/?op=jb`

        return jbHost.fetch(url, { method: 'POST', body }).then(r => r.json()).then(x => x.result)

        function serializeContextVal(val) {
            if (val && typeof val == 'object')
                return `() => ${JSON.stringify(val)}`
            return val
        }
    }
})
