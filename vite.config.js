import 'dotenv/config'
import path from 'path'
import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'
import wasm from 'vite-plugin-wasm'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(() => {
    return {
        root: 'sources/',
        envDir: '../',
        publicDir: '../static/',
        base: './',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        server: {
            port: 3000,
            host: '0.0.0.0',
            open: false,
            hmr: process.env.DISABLE_HMR !== 'true',
            watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
        build: {
            outDir: '../dist',
            emptyOutDir: true,
            sourcemap: false,
        },
        plugins: [
            wasm(),
            restart({ restart: ['../static/**'] }),
            nodePolyfills(),
            {
                name: 'exclude-styles-from-node-polyfills-inject',
                configResolved(resolvedConfig) {
                    const injectPlugin = resolvedConfig.plugins.find(
                        (p) => p && p.name === 'vite-plugin-node-polyfills:inject' && typeof p.transform === 'function'
                    )
                    if (injectPlugin) {
                        const originalTransform = injectPlugin.transform
                        injectPlugin.transform = function (code, id, options) {
                            if (/\.(styl|css|scss|less)(\?|$)/i.test(id)) {
                                return null
                            }
                            return originalTransform.call(this, code, id, options)
                        }
                    }
                },
            },
        ],
    }
})
