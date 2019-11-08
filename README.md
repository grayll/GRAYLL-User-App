# Code

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.


## Build
=======
Need to update browser.js in node_modules as file `Fix build error.png`
By replace `node: false` with `node: { crypto: true, stream: true, http:true, https: true, fs: 'empty', net: 'empty' }` 
in `node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js`

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Build option to fix error
When build with command `ng build --prod`, there is an unspecific error.
`ng build --prod --aot=false --build-optimizer=false`
`ng build --prod --configuration production --aot=false --build-optimizer=false`
`ng build --prod --configuration production --aot --build-optimizer=false`
`http-server -p 8081 -c-1 dist/code`

## Push notice

https://stackoverflow.com/questions/54138763/open-pwa-when-clicking-on-push-notification-handled-by-service-worker-ng7-andr
https://stackoverflow.com/questions/55178915/will-angular-swpush-web-push-work-when-the-browser-is-closed

In angular 7 (specifically referring to "@angular/service-worker" v~7.2.0), after you build your app with ng build --prod, examine your /dist folder and look for the file ngsw-worker.js. Open it in an editor.

On line 1885, you will find:

this.scope.addEventListener('notificationclick', (event) => this.onClick(event));
Change it to:

this.scope.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (clients.openWindow && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

##
`ng serve`
`ng serve --prod=true`

