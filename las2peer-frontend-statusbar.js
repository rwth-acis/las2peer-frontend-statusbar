import { LitElement, html } from '@polymer/lit-element';
import 'openidconnect-signin/openidconnect-signin.js';
import 'openidconnect-signin/openidconnect-popup-signin-callback.js';
import 'openidconnect-signin/openidconnect-popup-signout-callback.js';
import 'openidconnect-signin/openidconnect-signin-silent-callback.js';
import 'las2peer-frontend-user-widget/las2peer-user-widget.js';
import '@polymer/paper-card/paper-card.js';

class Las2peerFrontendStatusbar extends LitElement {
/*
  TODO: fix oidc login redirect
        */
render() {
      return html`
        <style>
            :host {
                display: block;
            }
            #statusbar-container{
                display:inline-block;
                width:${this.displayWidth};
                white-space: nowrap;
            }
            #widget-container {
                margin-right:25px;
                margin-top: 25px;
                float: right;
                cursor: default;
            }
            .inline{
                display:inline-block;
            }
            h1{
                margin-left: 25px;
            }
            h3 {
                margin-left: 60px;
                margin-top: -30px;
            }
        </style>
        <paper-card id="statusbar-container">
            <h1 class="inline" id="service-title">${this.service}</h1>
            <div class="inline" id="widget-container" @click=${this.handleClick} @signed-in="${this.handleLogin}" @signed-out="${this.handleLogout}">
                <las2peer-user-widget id="widget" base-url=${this.baseUrl} login-name=${this.loginName} login-password=${this.loginPassword} login-oidc-token=${this.loginOidcToken} login-oidc-provider=${this.loginOidcProvider}></las2peer-user-widget>
                <h3 id="username">Login</h3>
            </div>
        </paper-card>
        <openidconnect-signin id="oidcButton" style="display:none" @signed-in="${this.handleLogin}" @signed-out="${this.handleLogout}"
          scope="openid profile email"
          clientid="${this.oidcClientId}"
          authority="${this.oidcAuthority}"
          providername="Layers"
          popupredirecturi="${this._getOidcSigninCallback()}"
          popuppostlogoutredirecturi="${this._getOidcSignoutCallback()}"
          silentredirecturi="${this._getOidcSilentCallback()}"
        ></openidconnect-signin>
        `;
    }

    static get properties() {
        return {
            service: {
                type: String
            },
            baseUrl: {
                type: String
            },
            oidcReturnUrl: {
                type: String
            },
            loggedIn: {
                type: Boolean
            },
            loginName: {
                type: String
            },
            loginPassword: {
                type: String
            },
            loginOidcToken: {
                type: String
            },
            loginOidcProvider: {
                type: String
            },
            sendCookie: {
                type: Boolean
            },
            _oidcUser: {
                type: Object
            },
            oidcClientId: {
                type: String
            },
            oidcAuthority: {
                type: String
            },
            displayWidth: {
                type: String
            }
        }
    }

    constructor() {
        super();
        this._initialize();
        this.sendCookie = false;
        this.service = "Unnamed Service";
        this.baseUrl = "http://127.0.0.1:8080";
        this.oidcAuthority = "https://api.learning-layers.eu/o/oauth2";
        this.oidcReturnUrl = this.baseUrl + "/callbacks";
    }

    handleClick(e) {
        if (!this.loggedIn)
            this.shadowRoot.querySelector("#oidcButton")._handleClick();
    }

    handleLogin(event) {
        if (this.loggedIn)
            return;
        this.loggedIn = true;
        this.shadowRoot.querySelector("#widget-container").style = "cursor:auto";
        let userObject = event.detail;
        if (!userObject) {
            this.shadowRoot.querySelector("#username").innerHTML = this._getUsername();
        } else {
            if (userObject.token_type !== "Bearer") throw "unexpected OIDC token type, fix me";
            this._oidcUser = userObject;
            this.loginOidcToken = this._oidcUser.access_token;
            this.loginOidcProvider = this.oidcAuthority;
            this._appendWidget();
        }
    }

    handleLogout() {
        if (!this.loggedIn)
            return;
        console.log("logged out ", this._getUsername());
        this._initialize();
        this._appendWidget();
        this.shadowRoot.querySelector("#widget-container").style = "cursor:default";
    }

    _appendWidget() {
        let widgetHTML = "<las2peer-user-widget id='widget' baseUrl=" + this.baseUrl;
        if (!!this.loginName)
            widgetHTML += " login-name=" + this.loginName;
        if (!!this.loginPassword)
            widgetHTML += " login-password=" + this.loginPassword;
        if (!!this.loginOidcToken)
            widgetHTML += " login-oidc-token=" + this.loginOidcToken;
        if (!!this.loginOidcProvider)
            widgetHTML += " login-oidc-provider=" + this.loginOidcProvider;
        if (!!this.sendCookie)
            widgetAttributes += " send-cookie=true";
        widgetHTML += "></las2peer-user-widget>";
        let headerHTML = "<h3>" + this._getUsername() + "</h3>";
        this.shadowRoot.querySelector("#widget-container").innerHTML = widgetHTML + headerHTML;
    }

    _initialize() {
        this.loggedIn = false;
        this.loginName = "";
        this.loginPassword = "";
        this.loginOidcToken = "";
        this.loginOidcProvider = "";
        this._oidcUser = null;
        this.displayWidth = "100%";
    }

    _getUsername() {
        if (!this.loggedIn)
            return "Login";
        if (!!this.loginName)
            return this.loginName;
        let widget = this.shadowRoot.querySelector("#widget");
        let fullName = "";
        if (!!widget.firstName) {
            fullName += widget.firstName;
            if (!!widget.lastName)
                fullName += " " + widget.lastName;
            return fullName;
        }
        if (!!this._oidcUser)
            return this._oidcUser.profile.preferred_username;
        return "Unknown Username";
    }

    _getOidcSigninCallback() {
        return this.oidcReturnUrl + "/popup-signin-callback.html";
    }

    _getOidcSignoutCallback() {
        return this.oidcReturnUrl + "/popup-signout-callback.html";
    }

    _getOidcSilentCallback() {
        return this.oidcReturnUrl + "/silent-callback.html";
    }
}

customElements.define('las2peer-frontend-statusbar', Las2peerFrontendStatusbar);
