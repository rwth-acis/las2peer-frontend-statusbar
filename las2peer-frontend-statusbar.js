import {html, css, LitElement, unsafeCSS} from "lit";
import "./las2peer-user-widget.js";
import "@polymer/paper-card/paper-card.js";
import "keycloak-js/dist/keycloak.js";

export class Las2peerFrontendStatusbar extends LitElement {

  static get styles() {
    return css`
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
        width: 100%;
      }
      
      button {
          border: 0px;
      }
      button:focus {
          outline: none;
      }
      #circular {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          -webkit-border-radius: 20px;
          -moz-border-radius: 20px;
          box-shadow: 0 0 8px rgba(0, 0, 0, .8);
          -webkit-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
          -moz-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
      }
      .dropdown-content {
          background-color: white;
          line-height: 20px;
          border-radius: 1px;
          box-shadow: 0px 1px 1px #ccc;
          outline: none;
          margin-top: 42px;
          z-index: 5000;
      }
      #dropdown-button {           
          width: 40px;
          height: 40px;
          border-radius: 20px;
          -webkit-border-radius: 20px;
          -moz-border-radius: 20px;
          background-image: url('https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/learning-layers.svg');
          background-size: 100% 100%;
          background-color: var(--user-widget-button-background, rgba(0, 0, 0, 0));
          box-shadow: 0 0 6px rgba(0, 0, 0, .6);
          -webkit-box-shadow: 0 0 6px rgba(0, 0, 0, .6);
          -moz-box-shadow: 0 0 6px rgba(0, 0, 0, .6);
          position: relative;
          border: 1px solid white;
      }
      #dropdown-button:hover {
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.9);
          -webkit-box-shadow: 0 0 12px rgba(0, 0, 0, .9);
          -moz-box-shadow: 0 0 12px rgba(0, 0, 0, .9);
      }
      a {
          display: block;
          position: relative;
          padding: 1em;
          text-decoration: none;
      }
      ul {
          margin: 0;
          padding: 0;
      }
      li {
          display: block;
          position: relative;
          margin: 0;
          padding: 0;
      }
      li:not(:last-of-type) {
          border-bottom: 1px solid #eee;
      }
      a {
          color: #337ab7;
          text-decoration: none;
      }
      a:hover, a:focus{
        color: #23527c;
          text-decoration: none;
      }
    `;
  }

  render() {
    return html`
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
          >
          <button class="dropdown-trigger" id="dropdown-button">
            <iron-dropdown id="dropdown">
              <div class="dropdown-content" slot="dropdown-content">
                <ul tabindex="0">
                  <li><a href="javascript:void(0)" @click="${this._editProfile}">Edit profile</a>
                  </li>
                  <li><a href="javascript:void(0)" @click="${this._editRights}">Change privacy</a>
                  </li>
                  <li><a href="javascript:void(0)" @click="${this._editContacts}">Manage Contacts</a>
                  </li>
                  <li><a href="javascript:void(0)" @click="${this._editGroups}">Manage Groups</a>
                  </li>
                  <li><a href="javascript:void(0)" @click="${this._addressbook}">Addressbook</a>
                  </li>
                  <li><a href="javascript:void(0)" @click="${this._handleLogout}">Logout</a>
                  </li>
                </ul>
              </div>
            </iron-dropdown>
            <las2peer-user-widget
              id="widget"
              baseurl=${this.baseUrl}
              loginname=${this.loginName}
              loginpassword=${this.loginPassword}
              oidcaccesstoken=${this.oidcAccessToken}
              oidcissuerurl=${this.oidcIssuerUrl}
              oidcusersub=${this.oidcUserSub}
              suppresserrortoast=${this.suppressWidgetError}
            ></las2peer-user-widget></button>
            <h3 id="username">${this.loginName ===  "" ? "SSO Login" : this.loginName}</h3>
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
      oidcIssuerUrl: {
        type: String,
      },
      oidcUserSub: {
        type: String,
      },
      suppressWidgetError: {
        type: Boolean,
      },

      // other stuff
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
    this.oidcIssuerUrl = "";
    this.oidcUserSub = "";
    this.suppressWidgetError = false;
    this.oidcAuthority = "";
    this.kcRealm = "main";
    this.oidcClientId = "";

    this.service = "Unnamed Service";
    this.subtitle = "";
    this.baseUrl = "http://127.0.0.1:8080";

    window.addEventListener("keycloakLogin", this._handleLogin);
    window.addEventListener("signed-out", this._handleLogout);
  }

  _handleLogin(e) {
    console.log("logging in");
    console.log(this)
  }

  _handleLogout(e) {
    console.log("logging out");
    console.log(this);
    console.log(e);
    this.keycloak.logout();
  }

  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    console.log("firstUpdated");
    console.log(this);
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
          l2pStatBar.oidcIssuerUrl = kc.authServerUrl + "/realms/" + l2pStatBar.kcRealm;
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
    } else {
      this.shadowRoot.getElementById("dropdown").open();
    }
  }

  _editProfile(event) {
    console.log("editing profile");
    this.shadowRoot.getElementById("widget").setAttribute("pageId", "1");
  }

  _editRights(event) {
    console.log("editing rights")
    this.shadowRoot.getElementById("widget").setAttribute("pageId", "2");
    // TODO: move this to user-widget
    // var dialog = this.$.editRights;
    // if (dialog) {
    //   this.$.ajaxGetPermissions.generateRequest();
    //   this.$.ajaxGetAddressbook.generateRequest();
    //   dialog.open();
    // }
  }

  _editContacts(event) {
    console.log("editing contacts");
    this.shadowRoot.getElementById("widget").setAttribute("pageId", "3");
    // TODO move this to user-widget
    // var dialog = this.$.editContacts;
    // if (dialog) {
    //   dialog.open();
    //   this.$.ajaxGetContacts.generateRequest();
    // }
  }

  _editGroups(event) {
    console.log("editing groups");
    this.shadowRoot.getElementById("widget").setAttribute("pageId", "4");
    // TODO move this to user-widget
    // var dialog = this.$.editGroups;
    // if (dialog) {
    //   dialog.open();
    //   this.$.ajaxGetGroups.generateRequest();
    // }
  }

  _addressbook(event) {
    console.log("show addressbook");
    this.shadowRoot.getElementById("widget").setAttribute("pageId", "5");
    // TODO mvoe this to user-widget
    // var dialog = this.$.addressbook;
    // if (dialog) {
    //   dialog.open();
    //   this.$.ajaxGetAddressbook.generateRequest();
    // }
  }

}

customElements.define("las2peer-frontend-statusbar", Las2peerFrontendStatusbar);
