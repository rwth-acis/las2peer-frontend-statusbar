import { LitElement, html } from '@polymer/lit-element';
import 'openidconnect-signin/openidconnect-signin.js';
import 'openidconnect-signin/openidconnect-popup-signin-callback.js';
import 'openidconnect-signin/openidconnect-popup-signout-callback.js';
import 'openidconnect-signin/openidconnect-signin-silent-callback.js';
import 'las2peer-frontend-user-widget/las2peer-user-widget.js';
import '@polymer/paper-card/paper-card.js';

class Las2peerFrontendStatusbar extends LitElement {

render() {
      return html`
        <style>
            :host {
                display: block;
            }
            #statusbar-container{
                display:inline-block;
                width:100%;
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
                margin-top: -25%;
            }
        </style>
        <paper-card id="statusbar-container">
            <h1 class="inline" id="service-title">${this.service}</h1>
            <div class="inline" id="widget-container" @click=${this.handleClick}>
                <las2peer-user-widget id="widget"></las2peer-user-widget>
                <h3>Login</h3>
            </div>
        </paper-card>
        <openidconnect-signin id="oidcButton" style="display:none" @signed-in="${this.handleLogin}" @signed-out="${this.handleLogout}"
          scope="openid profile email"
          clientid="${this.oidcClientId}"
          authority="${this.oidcAuthority}"
          providername="Layers"
          popupredirecturi="${this.oidcReturnUrl}"
          popuppostlogoutredirecturi="${this.oidcReturnUrl}"
          silentredirecturi="${this.oidcReturnUrl}"
        ></openidconnect-signin>
        <openidconnect-popup-signin-callback></openidconnect-popup-signin-callback>
        <openidconnect-popup-signout-callback></openidconnect-popup-signout-callback>
        <openidconnect-signin-silent-callback></openidconnect-signin-silent-callback>
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
            }
        }
    }

    constructor() {
        super();
        let appThis = this;
        this.loggedIn = false;
        this.sendCookie = false;
        this.service = "Unnamed Service";
        this.baseUrl = "http://127.0.0.1:8080";
        this.loginName = "";
        this.loginPassword = "";
        this.loginOidcToken = "";
        this.loginOidcProvider = "";
        this.oidcAuthority = "https://api.learning-layers.eu/o/oauth2";
        this.oidcReturnUrl = this.baseUrl;
    }

    handleClick(e) {
        this.shadowRoot.querySelector('#oidcButton')._handleClick();
    }

    handleLogin(event) {
        let userObject = event.detail;
        console.log("[DEBUG] OIDC user obj:", userObject);
        if (userObject.token_type !== "Bearer") throw "unexpected OIDC token type, fix me";
        this._oidcUser = userObject;
        if (typeof userObject == "undefined") throw "empty OIDC userObject";
        this.loginOidcToken = this._oidcUser.access_token;
        this.loginOidcProvider = this.oidcAuthority;
        this.loggedIn = true;
        let widgetHTML = "<las2peer-user-widget id='widget' base-url=" + this.baseUrl;
        if (!!this.loginName)
            widgetHTML += " login-name=" + this.loginName;
        if (!!this.loginPassword)
            widgetHTML += " login-password=" + this.loginPassword;
        if (!!this.loginOidcToken)
            widgetHTML += " login-oidc-token=" + this.loginOidcToken;
        if (!!this.loginOidcProvider)
            widgetHTML += " login-oidc-provider=" + this.loginOidcProvider;
        if (!!this.sendCookie)
            widgetHTML += " send-cookie=true";
        widgetHTML += "></las2peer-user-widget>";
        let headerHTML = "<h3>" + this._oidcUser.profile.preferred_username + "</h3>";
        this.shadowRoot.querySelector("#widget-container").innerHTML = widgetHTML + headerHTML;
    }

    handleLogout() {
        if (!this.loggedIn)
            return;
        this.loggedIn = false;
        console.log("logged out ", this._oidcUser.profile);
        let widgetHTML = "<las2peer-user-widget id='widget'></las2peer-user-widget>";
        let headerHTML = "<h3>Login</h3>";
        this.shadowRoot.querySelector("#widget-container").innerHTML = widgetHTML + headerHTML;
        this._oidcUser = null;
    }
}

customElements.define('las2peer-frontend-statusbar', Las2peerFrontendStatusbar);
