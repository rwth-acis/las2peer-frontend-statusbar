# \<las2peer-frontend-statusbar\>

A polymer widget unifying the [las2peer-frontend-user-widget](https://github.com/rwth-acis/las2peer-frontend-user-widget) with the [openid connect signin button](https://github.com/rwth-acis/openidconnect-signin)

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

### Integrating User-Widget Functionality
In order to properly integrate the functionality of the user widget you need to specify a `baseurl` attribute e.g., `http://localhost:8080`.
Because the user widget accesses the [las2peer-userinformation-service](https://github.com/rwth-acis/las2peer-UserInformation-Service), the [las2peer-contact-service](https://github.com/rwth-acis/las2peer-Contact-Service), as well as the [las2peer-file-service](https://github.com/rwth-acis/las2peer-FileService) the webconnector of these services should all be accessible at this address.

### Integrating OpenID Connect Functionality
The sign in procedure is implemented by the openid connect signin button which needs to be provided with a **clientID**, **authority**, and a **redirectURI** which can be set using the `oidcclientid`, `oidcauthority`, and `oidcreturnurl` attributes respectively. The `oidcauthority` defaults to learning layers if non is specified (for an example please refer to the demo source code).
The `oidcreturnurl` needs to match with one of the redirection URI(s) associated with the specified `oidcclientid`. Additionally make sure to set the *Grant Types* to *implicit* and the *Response Types* to *token*, as well as include *openid, email, and profile* in the scope.
You can create a new openID connect token [here](https://api.learning-layers.eu/o/oauth2/) using the learning-layers API. In order for the redirects to work properly make sure to not change the path of any of the files contained within the `callbacks` directory.

## Demo

The project includes a demo which can be run locally by running `npm i` and `polymer serve`.
In order to run the demo you should have version 3.0 of [polymer-cli](https://polymer-library.polymer-project.org/3.0/docs/tools/polymer-cli) installed. Also make sure to access the demo via the following URL `localhost:8081`.

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