import { html, LitElement } from "lit-element";
import "las2peer-frontend-user-widget/las2peer-user-widget.js";
import "@polymer/paper-card/paper-card.js";
import "keycloak-js/dist/keycloak.js";

export class Las2peerFrontendStatusbar extends LitElement {


  render() {
    return html`
      <style>
        :host([background]) {
          background: var(--statusbar-background, #fff);
          display: block;
        }
        paper-card {
          --paper-card-background-color: var(--statusbar-background, #fff);
        }

        #widget-container {
          cursor: pointer;
          padding-left: 10px;
          padding-right: 10px;
        }
        #widget-container:hover {
          background: #5691f5;
        }
        .inline {
          display: inline-block;
        }
        .inline + .inline {
          margin-left: 5px;
        }
        .flex {
          display: flex;
        }
        .align-vertical {
          align-items: center;
        }
        .center-vertical {
          margin-top: auto;
          margin-bottom: auto;
        }
        #innercontainer {
          display: flex;
        }
        .last {
          margin-left: auto;
          margin-right: 25px;
        }
        .first {
          margin-left: 25px;
        }
        #statusbar-container {
          display: inline-block;
          width: ${this.displayWidth};
        }
      </style>
      <paper-card id="statusbar-container">
        <div id="innercontainer">
          <slot class="inline center-vertical first" name="left"></slot>
          <slot class="inline center-vertical flex" name="title">
            <div style="display: flex; flex-flow: column">
              <h1 id="service-title">${this.service}</h1>
              <h5 style="margin-left: 25px; margin-top: -30px;" id="subtitle">
                ${this.subtitle}
              </h5>
            </div>
          </slot>
          <slot class="inline center-vertical" name="middle"></slot>
          <div
            class="flex align-vertical last"
            id="widget-container"
            @click="${this.handleClick}"
            // @signed-in="${this.handleLogin}"
            // @signed-out="${this.handleLogout}"
          >
            <las2peer-user-widget
              id="widget"
              base-url=${this.baseUrl}
              login-name=${this.loginName} 
              login-password=${this.loginPassword}
              login-oidc-token=${this.oidcAccessToken}
              login-oidc-provider=${this.loginOidcProvider}
              login-oidc-sub=${this.oidcUserSub}
              suppress-error-toast=${this.suppressWidgetError}
            ></las2peer-user-widget>
            <h3 id="username">${this.loginName == "" ? "SSO Login" : this.loginName}</h3>
          </div>
        </div>
      </paper-card>
    `;
  }

  static get properties() {
    return {
      // keycloak stuff
      oidcClientId: {
        type: String,
      },
      oidcAuthority: {
        type: String,
      },
      kcRealm: {
        type: String,
      },
      keycloak: {
        type: Keycloak,
      },

      // user widget stuff
      baseUrl: {
        type: String,
      },
      loginName: {
        type: String,
      },
      loginPassword: {
        type: String,
      },
      oidcAccessToken: {
        type: String,
      },
      // TODO: use oidcAuthority instead
      loginOidcProvider: {
        type: String,
      },
      oidcUserSub: {
        type: String,
      },
      suppressWidgetError: {
        type: Boolean,
      },

      // other stuff
      displayWidth: {
        type: String,
      },
      service: {
        type: String,
      },
      subtitle: {
        type: String,
      },
      loggedIn: {
        type: Boolean,
      }
    };
  }

  constructor() {
    super();
    this.loggedIn = false;
    this.loginName = "";
    this.loginPassword = "";
    this.oidcAccessToken = "";
    this.loginOidcProvider = "";
    this.oidcUserSub = "";
    this.suppressWidgetError = false;
    this.oidcAuthority = "";
    this.kcRealm = "main";
    this.oidcClientId = "";

    this.service = "Unnamed Service";
    this.subtitle = "";
    this.baseUrl = "http://127.0.0.1:8080";
    this.displayWidth = "100%";
  }

  _handleLogin(e) {
    console.log(this)
  }

  _handleLogout(e) {
    console.log(this);
    console.log(e);
  }

  //TODO: check if still needed
  handleLogin(event) {

    if (this.loggedIn) return;
    let userObject = event.detail;
    this.dispatchEvent(
        new CustomEvent("signed-in", { detail: userObject, bubbles: true })
    );
    this.loggedIn = true;
    this.shadowRoot.querySelector("#widget-container").style = "cursor:auto";
    if (!userObject) {
      this.shadowRoot.querySelector("#username").innerHTML =
          this._getUsername();
    } else {
      if (userObject.token_type !== "Bearer")
        throw "unexpected OIDC token type, fix me";
      this._oidcUser = userObject;
      this.loginOidcToken = this._oidcUser.access_token;
      this.loginOidcProvider = this.oidcAuthority;
      this.loginOidcSub = this._oidcUser.profile.sub;
      if (this.autoAppendWidget) this._appendWidget();
    }
  }

  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    console.log("firstUpdated");
    console.log(this);
    window.addEventListener("keycloakLogin", this._handleLogin);
    window.addEventListener("signed-out", this._handleLogout);
    this.keycloak = new Keycloak({
      url: this.oidcAuthority,
      realm: this.kcRealm,
      clientId: this.oidcClientId,
    });
    if (!this.loggedIn) {
      let kc = this.keycloak;
      let l2pStatBar = this;
      this.keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: window.location.origin + '/callbacks/silent-check-sso.html',
      }).then(function (authenticated) {
        if (authenticated) {
          console.log("authenticated");
          l2pStatBar.oidcAccessToken = kc.token;
          let idToken = kc.idTokenParsed;
          l2pStatBar.loginName = idToken.preferred_username;
          l2pStatBar.oidcUserSub = idToken.sub;
          l2pStatBar.loggedIn = true;
        } else {
          console.log("not authenticated");
        }
      });
    }
  }

  handleClick() {
    if (!this.loggedIn) {
      this.keycloak.login();
    }
  }

}

customElements.define("las2peer-frontend-statusbar", Las2peerFrontendStatusbar);
