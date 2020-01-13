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