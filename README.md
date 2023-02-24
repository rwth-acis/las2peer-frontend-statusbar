# \<las2peer-frontend-statusbar\>

A Lit-based HTML element, that contains login functionality and enables interaction with the [las2peer-contact-service](https://github.com/rwth-acis/las2peer-contact-service) and the [las2peer-user-information-service](https://github.com/rwth-acis/las2peer-user-information-service).

## Deploy

1. Add this line to your package.json

```
"las2peer-frontend-statusbar": "github:rwth-acis/las2peer-frontend-statusbar"
```

2. Import to your source code

```
import 'las2peer-frontend-statusbar/las2peer-frontend-statusbar.js'
```

3. Add the HTML element

```
<las2peer-frontend-statusbar></las2peer-frontend-statusbar>
```

4. (optional) Copy the [/callbacks/silent-check-sso.html](./callbacks/silent-check-sso.html) file to your project

### Enabling contact- and user-information-service Functionality

In order to properly interact with the contact- and user-information-service, you need to specify a `baseUrl` attribute e.g., `http://localhost:8080`. It has to be set to the URL at which the web connectors of the services are accessible.

### Integrating OpenID Connect Functionality
The sign-in procedure is implemented using [keycloak-js](https://www.npmjs.com/package/keycloak-js) which needs to be linked with our Keycloak instance. In most cases, you only have to set the `oidcClientId` attribute to the ClientID of your
OIDC client. You can create your own client at the [account console](https://auth.las2peer.org/auth/realms/main/account/#/userClients). If you need to use a different Keycloak instance or want to connect the status bar to a different Keycloak
Realm, you have to set the attributes `oidcAuthority` and `kcRealm` to the domain of your Keycloak instance and the Keycloak Realm. For a simple example, have a look at the [index.html](./index.html) file.

To enable a silent check if the user is already logged in, you can copy the [/callbacks](./callbacks) directory to your project, which contains an HTML file that is opened in an iframe during the check. Note that this "silent check-sso" functionality
is implemented in keycloak-js and has some limitations. Some browsers block this feature due to the use of third-party cookies. In this case, the page is reloaded after the check. More information about this problem [here](https://www.keycloak.org/docs/latest/securing_apps/#_modern_browsers).

### Communication with the las2peer-frontend-statusbar

To get user information after the login, the status bar sends a `signed-in` event, which contains the user information in its details.
It is also possible to interact with the status bar by sending out the events `sign-in` and `sign-out` to trigger a login or logout.

## Demo

The project includes a demo that can be run locally by running `npm i` and `polymer serve`.
In order to run the demo you should have version 3.0 of [polymer-cli](https://polymer-library.polymer-project.org/3.0/docs/tools/polymer-cli) installed.

## Slots

The component can be extended or overridden at these slots.

| Slot   | Description                                          |
|--------|------------------------------------------------------|
| left   | Insert elements left to the title.                   |
| title  | Override the title element.                          |
| middle | Insert elements between title and user login widget. |

## Theming

Set the following CSS variables to change the default appearance.

| CSS Variable                    | Description                                                           | Default          |
|---------------------------------|-----------------------------------------------------------------------|------------------|
| --statusbar-background | Set the *background* property of the element. | #fff |

Look [here](https://github.com/rwth-acis/las2peer-frontend-user-widget#theming) for theming the user widget.
