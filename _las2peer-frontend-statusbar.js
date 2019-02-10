import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import 'openidconnect-signin/openidconnect-signin.js';
import 'openidconnect-signin/openidconnect-popup-signin-callback.js';
import 'openidconnect-signin/openidconnect-popup-signout-callback.js';
import 'openidconnect-signin/openidconnect-signin-silent-callback.js';
import 'las2peer-frontend-user-widget/las2peer-user-widget.js';
import 'las2peer-frontend-user-widget/las2peer-userlist-widget.js';

class Las2peerFrontendStatusbar extends PolymerElement {
    static get template() {
        return html`
            <div id="user-information" style="display:block">
                <openidconnect-signin id="oidcButton"
                  scope="openid profile email"
                  clientid$="[[oidcClientId]]"
                  authority$="[[oidcAuthority]]"
                  providername="Layers"
                  popupredirecturi$="[[baseUrl]]"
                  popuppostlogoutredirecturi$="[[baseUrl]]"
                  silentredirecturi$="[[baseUrl]]"
                ></openidconnect-signin>
                <las2peer-user-widget id="userWidget"
                  base-url$="[[baseUrl]]"
                  send-cookie$="[[sendCookie]]"
                  login-name$="[[las2peerUser.name]]"
                  login-password$="[[las2peerUser.password]]"
                  login-oidc-provider$="[[loginOidcProvider]]"
                  login-oidc-token$="[[loginOidcToken]]"
                ></las2peer-user-widget>
                <openidconnect-popup-signin-callback></openidconnect-popup-signin-callback>
                <openidconnect-popup-signout-callback></openidconnect-popup-signout-callback>
                <openidconnect-signin-silent-callback></openidconnect-signin-silent-callback>
            </div>`;
    }

    static get properties() {
        return {
            baseUrl: {
                type: String,
                value: "127.0.0.1:8080"
            },
            _oidcUser: {
                type: Object,
                value: null
            },
            oidcClientId: {
                type: String,
                value: null
            },
            oidcAuthority: {
                type: String,
                value: "https://api.learning-layers.eu/o/oauth2"
            },
            loginOidcToken: {
                type: String,
                value: null
            },
            loginOidcProvider: {
                type: String,
                value: null
            },
            sendCookie: {
                type: Boolean,
                value: false
            },
            las2peerUser: {
                type: Object,
                vale: []
            }
        };
    }

    ready() {
        super.ready();
        let appThis = this;
        this.$.oidcButton.addEventListener('signed-in', function(event) { appThis.storeOidcUser(event.detail); });
        this.$.oidcButton.addEventListener('signed-out', e => appThis._oidcUser = null);
    }

    storeOidcUser(userObject) {
      console.log("[DEBUG] OIDC user obj:", userObject);
      if (userObject.token_type !== "Bearer") throw "unexpected OIDC token type, fix me";
      this._oidcUser = userObject;
    }
}

window.customElements.define('las2peer-frontend-statusbar', Las2peerFrontendStatusbar);
