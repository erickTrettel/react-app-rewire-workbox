# React App Rewire Workbox

Este projeto utiliza o (CRA) create-react-app juntamente com a biblioteca [Workbox](https://developers.google.com/web/tools/workbox/) do Google para criar uma aplicação offline first.

## Suas principais funcionalidades são:
1. [Background sync](https://developers.google.com/web/updates/2015/12/background-sync)
2. [Service worker cache](https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker)

### Como implementar o Workbox com CRA?

O primeiro passo é criar a aplicação com a ferramenta linha de comando do React.

`create-react-app  <nome_da_aplicação>`

Após criado o projeto e removidos os arquivos que julgar desnecessário, crie um arquivo `custom-service-worker.js` na pasta `public`.

```
// custom-service-worker.js

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {  
  // js, css and html files
  workbox.routing.registerRoute(
    /\.(?:js|css|html)$/,
    new workbox.strategies.CacheFirst(),
  );
  
  workbox.routing.registerRoute(
    'http://localhost:3000',
    new workbox.strategies.CacheFirst()
  );

  const bgSyncPlugin = new workbox.backgroundSync.Plugin('todoQueue', {
    maxRetentionTime: 24 * 60
  });

  // register route for API resources using network first cache strategy
  workbox.routing.registerRoute(
    'http://localhost:8000/todos', 
    new workbox.strategies.NetworkFirst(),
    'GET'
  );

  // queue for POST requests to API
  workbox.routing.registerRoute(
    'http://localhost:8000/todos', 
    new workbox.strategies.NetworkFirst({
      plugins: [bgSyncPlugin]
    }),
    'POST'
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
```

Criado o service worker com suas configurações, você deve remover a checkagem de `NODE_ENV` para `production` dentro do arquivo `src/serviceWorker.js`. Assim como deverá informar o nome do seu service worker para ser registrado.

```
export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/custom-service-worker.js`;

      // ... rest of the code
```

Para implementar o [react-app-rewired](https://github.com/timarney/react-app-rewired) no seu projeto primeiro, instale a dependência utilizando o comando:

`npm install --save-dev react-app-rewired`

Depois de instalado, criar um arquivo chamado `config-overrides.js` na raiz de seu projeto.

```
// config-overrides.js

const workboxPlugin = require('workbox-webpack-plugin')
const path = require('path')

module.exports = {
  webpack: function (config, env) {
    if (env === 'production') {
      const workboxConfigProd = {
        swSrc: path.join(__dirname, 'public', 'custom-service-worker.js'),
        swDest: 'custom-service-worker.js',
        importWorkboxFrom: 'disabled'
      }
      config = removeSWPrecachePlugin(config)
      config.plugins.push(new workboxPlugin.InjectManifest(workboxConfigProd))
    }
    return config
  }
}

function removeSWPrecachePlugin (config) {
  const swPrecachePluginIndex = config.plugins.findIndex((element) => {
    return element.constructor.name === 'SWPrecacheWebpackPlugin'
  })
  if (swPrecachePluginIndex !== -1) {
    config.plugins.splice(swPrecachePluginIndex, 1)
  }
  return config
}
```

O próximo passo é configurar nosso arquivo `package.json` para utilizar os scripts do react app rewired.

```
"scripts": {
  "start": "react-app-rewired start",
  "build": "react-app-rewired build",
  "test": "react-app-rewired test --env=jsdom",
  "eject": "react-scripts eject"
}
```
