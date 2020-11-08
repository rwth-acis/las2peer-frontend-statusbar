import {html, LitElement} from '@polymer/lit-element';
import 'openidconnect-signin/openidconnect-signin.js';
import 'openidconnect-signin/openidconnect-popup-signin-callback.js';
import 'openidconnect-signin/openidconnect-popup-signout-callback.js';
import 'openidconnect-signin/openidconnect-signin-silent-callback.js';
import 'las2peer-frontend-user-widget/las2peer-user-widget.js';
import '@polymer/paper-card/paper-card.js';
import 'zxcvbn/dist/zxcvbn.js';

import "oidc-client/lib/oidc-client.min.js";

class Las2peerFrontendStatusbar extends LitElement {

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

            #statusbar-container{
                display:inline-block;
                width:${this.displayWidth};
            }
            #widget-container {
                padding: 25px 25px 10px 10px;
                float: right;
                cursor: pointer;
            }
            #widget-container:hover {
                background: #5691f5;
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

            paper-dialog-scrollable {
                overflow: auto;
            }

            summary {
                cursor: pointer;
            }
        </style>
        <paper-card id="statusbar-container">
            <slot class="inline" name="left"></slot>
            <slot class="inline" name="title"><h1 class="inline" id="service-title">${this.service}</h1></slot>
            <slot class="inline" name="middle"></slot>
            <div class="inline" id="widget-container" @click=${this.handleClick} @signed-in="${this.handleLogin}" @signed-out="${this.handleLogout}">
                <las2peer-user-widget id="widget" base-url=${this.baseUrl} login-name=${this.loginName} login-password=${this.loginPassword}
                    login-oidc-token=${this.loginOidcToken}
                    login-oidc-provider=${this.loginOidcProvider}
                    login-oidc-sub=${this.loginOidcSub}
                ></las2peer-user-widget>
                <h3 id="username">${this._getUsername()}</h3>
            </div>
        </paper-card>

<paper-dialog id="authSignInPassword" style="width:600px">
    <h4>Sign in as ${this.loginName}</h4>
    <p>Please provide your password to complete the sign-in process.</p>

    <div>
        <paper-input type="password" id="password" label="Password" @keydown="${this.checkForEnterAuthPassword}" autofocus></paper-input>
        <paper-button raised @click="${this.signInPassword}" class="green">
            <iron-icon icon="chevron-right"></iron-icon>
            Sign in
        </paper-button>
    </div>
</paper-dialog>

<paper-dialog id="authSignUpChoose" style="width:800px">
    <h4>Choose your sign-in flow</h4>

    <paper-dialog-scrollable>
        <p>You do not have an account with <a href="https://las2peer.org/" target="_blank" rel="noopener">las2peer</a>&mdash;the decentralized application platform powering this application&mdash;yet.</p>
        <p>
            It relies on the external authentication provider <a href="${this.oidcAuthority}" target="_blank" rel="noopener">${this.oidcName}</a>.
            If you do not have an account with ${this.oidcName}, please create one <a href="${this.oidcAuthority}" target="_blank" rel="noopener">here</a>.
            When you have an account with ${this.oidcName}, you can continue with the sign-up process.
        </p>
        <p>
            There are two ways of authenticating yourself.
            Here is a comparison of them.
            If in doubt, choose simple.
        </p>
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Simple</th>
                    <th>Advanced</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Steps needed</th>
                    <td>One-step sign in</td>
                    <td>Two steps needed</td>
                </tr>
                <tr>
                    <th>Impersonation possible</th>
                    <td>Yes, by ${this.oidcName}</td>
                    <td>No</td>
                </tr>
                <tr>
                    <th>Passphrase</th>
                    <td>Same passphrase with las2peer and ${this.oidcName}</td>
                    <td>Different passphrases possible</td>
                </tr>
                <tr>
                    <th>Passphrase transmitted to las2peer in clear</th>
                    <td>No</td>
                    <td>No</td>
                </tr>
                <tr>
                    <th></th>
                    <td><paper-button raised class="green" @click="${this.signUpChooseSimple}">Choose simple</paper-button></td>
                    <td><paper-button raised @click="${this.signUpChooseAdvanced}">Choose advanced</paper-button></td>
                </tr>
            </tbody>
        </table>
        <h5>FAQ</h5>
        <details>
            <summary>Which one should I choose?</summary>
            <p>
                In case you are not sure which flow to choose, just go with the simple one.
                You will know if you need the advanced one.
            </p>
        </details>
        <details>
            <summary>Why does las2peer need a passphrase?</summary>
            <p>
                las2peer is decentralized and end-to-end encrypted.
                Therefore, each user of las2peer has a asymmetric key pair.
                For your convenience, the key pair is stored in las2peer's decentralized object store, securely.
                To decrypt it, we need a key.
                It is generated from your passphrase.
            </p>
        </details>
        <details>
            <summary>How can las2peer use my passphrase without knowing it?</summary>
            <p>
                las2peer needs a key that is derived from your passphrase.
                By performing this derivation on your device, las2peer does not get to know it but can operate as usual.
            </p>
        </details>
        <details>
            <summary>Why can ${this.oidcName} impersonate me if I choose the simple flow?</summary>
            <p>
                As ${this.oidcName} observes your passphrase whenever you sign in, they could use that passphrase to access las2peer in your name.
                If you trust ${this.oidcName} not to impersonate you, this is safe unless they are compromised.
            </p>
        </details>
    </paper-dialog-scrollable>
</paper-dialog>

<paper-dialog id="authSignUp" style="width:800px">
    <h4>Signing up &hellip;</h4>
    <paper-spinner id="signUpSpinner"></paper-spinner>
</paper-dialog>

<paper-dialog id="authSignUpPassword" style="width:800px">
    <h4>Please choose a passphrase for las2peer</h4>
    <p>This passphrase will be not be sent to las2peer in clear.</p>
    <div>
        <paper-input type="password" id="passwordSignUp" label="Password" @keydown="${this.checkPasswordStrength}" autofocus></paper-input>
        <p id="passwordFeedback"></p>
        <p id="passwordSuggestions"></p>
        <paper-button raised @click="${this.signUpAdvanced}" class="green">
            <iron-icon icon="chevron-right"></iron-icon>
            Sign up
        </paper-button>
    </div>
    <paper-spinner id="signUpAdvancedSpinner"></paper-spinner>
</paper-dialog>
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
            oidcPopupSigninUrl: {
                type: String
            },
            oidcPopupSignoutUrl: {
                type: String
            },
            oidcSilentSigninUrl: {
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
            loginPasswordHash: {
                type: Uint8Array
            },
            loginPasswordSalt: {
                type: ArrayBuffer
            },
            loginOidcToken: {
                type: String
            },
            loginOidcProvider: {
                type: String
            },
            loginOidcSub: {
                type: String
            },
            sendCookie: {
                type: Boolean
            },
            autoAppendWidget: {
                type: Boolean
            },
            userManager: {
                type: Object
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
            useRedirect: {
                type: Boolean
            },
            displayWidth: {
                type: String
            }
        }
    }

    constructor() {
        super();
        this._initialize();
        this.autoAppendWidget = false;
        this.service = "Unnamed Service";
        this.baseUrl = "http://127.0.0.1:8080";
        this.oidcAuthority = "https://api.learning-layers.eu/o/oauth2";
        this.oidcName = 'Learning Layers';
        this.displayWidth = "100%";
        this.oidcPopupSigninUrl = this.baseUrl + "/callbacks/popup-signin-callback.html";
        this.oidcPopupSignoutUrl = this.baseUrl + "/callbacks/popup-signout-callback.html";
        this.oidcSilentSigninUrl = this.baseUrl + "/callbacks/silent-callback.html";
        this.useRedirect = false;
    }

    firstUpdated() {
        this.userManager = new UserManager({
            authority: this.oidcAuthority,
            client_id: this.oidcClientId,
            redirect_uri: this.oidcPopupSigninUrl,
            response_type: 'id_token token',
            silent_redirect_uri: this.oidcSilentSigninUrl,
            automaticSilentRenew: true,
            scope: 'openid profile',
        });

        this.userManager.events.addUserLoaded(user => {
            this._user = user;
        });

        this.userManager.events.addSilentRenewError(e => {
            console.error(e);
            this._user = null;
        });

        if (!this.loggedIn) {
            this.userManager.signinSilent().catch(err => {});
        }
    }

    handleClick(e) {
        if (!this.loggedIn)
            // this.shadowRoot.querySelector("#oidcButton")._handleClick();
            this.startSignInProcess();
    }

    handleLogin(event) {
        if (this.loggedIn)
            return;
        let userObject = event.detail;
        this.dispatchEvent(new CustomEvent('signed-in', {detail: userObject, bubbles: true}));
        this.loggedIn = true;
        this.shadowRoot.querySelector("#widget-container").style = "cursor:auto";
        if (!userObject) {
            this.shadowRoot.querySelector("#username").innerHTML = this._getUsername();
        } else {
            if (userObject.token_type !== "Bearer") throw "unexpected OIDC token type, fix me";
            this._oidcUser = userObject;
            this.loginOidcToken = this._oidcUser.access_token;
            this.loginOidcProvider = this.oidcAuthority;
            this.loginOidcSub = this._oidcUser.profile.sub;
            if (this.autoAppendWidget)
                this._appendWidget();
        }
    }

    handleLogout() {
        this.dispatchEvent(new CustomEvent('signed-out'));
        if (!this.loggedIn)
            return;
        console.log("logged out ", this._getUsername());
        this._initialize();
        if (this.autoAppendWidget)
            this._appendWidget();
        this.shadowRoot.querySelector("#widget-container").style = "cursor:default";
        let i = document.createElement('iframe');
        i.style.display = 'none';
        i.onload = function() { i.parentNode.removeChild(i); };
        i.src = 'https://api.learning-layers.eu/o/oauth2/logout';
        document.body.appendChild(i);
    }

    _appendWidget() {
        let widgetHTML = "<las2peer-user-widget id='widget' base-url=" + this.baseUrl;
        if (!!this.loginName)
            widgetHTML += " login-name=" + this.loginName;
        if (!!this.loginPassword)
            widgetHTML += " login-password=" + this.loginPassword;
        if (!!this.loginOidcToken) {
            widgetHTML += " login-oidc-token=" + this.loginOidcToken;
            if (!this.loginName && !!this._oidcUser)
                widgetHTML += " login-name=" + this._oidcUser.profile.preferred_username;
        }
        if (!!this.loginOidcProvider)
            widgetHTML += " login-oidc-provider=" + this.loginOidcProvider;
        if (!!this.loginOidcSub)
            widgetHTML += " login-oidc-sub=" + this.loginOidcSub;
        if (!!this.sendCookie)
            widgetHTML += " send-cookie=true";
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
        this.loginOidcSub = "";
        this._oidcUser = null;
        this.sendCookie = false;
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

    async startSignInProcess() {
        if (this.querySelector('#widget')) {
            this.querySelector('#widget').$.dropdown.close();
        }
        const user = await this.userManager.signinPopup();
        this.loginName = user.profile.preferred_username;
        this.loginOidcSub = user.profile.sub;

        // Retrieve agent
        const agent = await this._getAgent(this.loginName)
        // Sign up
        if (agent.msg == 'Agent not found') {
            console.log('Agent not found. Starting sign-up process.');
            this.shadowRoot.querySelector('#authSignUpChoose').open();
            return;
        }
        console.log('Agent found. Starting sign-in process.');

        // Sign in
        this.loginPasswordSalt = Uint8Array.from(atob(agent.salt), c => c.charCodeAt(0));
        // null is considered to be the simple flow for backward compatibility.
        this.loginFlowType = agent.flowType || 'simple';

        // Ask for password if advanced flow was chosen
        if (this.loginFlowType == 'advanced') {
            this.shadowRoot.querySelector('#authSignInPassword').open();
            return;
        } else if (this.loginFlowType != 'simple') {
            console.error('Unknown flow type');
        }

        // Simple sign-in
        this.loginPassword = this._user.profile.sub;
        this._hashPassword(this.loginPassword, this.loginPasswordSalt, 1000).then(key => {
            this.loginPasswordHash = key;
            return this._loginL2P(this.loginName, this.loginPasswordHash);
        }).then(json => {
            console.log(json);
            this.handleLogin(this._user);
        });
    }

    checkForEnterAuthPassword(event) {
        if (event.keyCode === 13) {
            this.signInPassword();
        }
    }

    // Advanced sign in (after passphrase was entered)
    signInPassword() {
        this.loginPassword = this.shadowRoot.querySelector('#password').value;
        // Reset the password field
        this.shadowRoot.querySelector('#password').value = '';

        this._hashPassword(this.loginPassword, this.loginPasswordSalt, 1000).then(key => {
            this.loginPasswordHash = key;
            return this._loginL2P(this.loginName, this.loginPasswordHash); // FIXME: sign-in does not work with hash
        }).then(json => {
            console.log(json);
            this.shadowRoot.querySelector('#authSignInPassword').close();
            this.handleLogin(this._user);
        });
    }

    checkPasswordStrength(event) {
        if (event.keyCode === 13) {
            this.signUpAdvanced();
        }

        const rating = zxcvbn(this.shadowRoot.querySelector('#passwordSignUp').value, [this.loginName, 'las2peer']);
        this.shadowRoot.querySelector('#passwordFeedback').innerHTML = rating.feedback.warning ? `Password tip: ${rating.feedback.warning}` : '';
        this.shadowRoot.querySelector('#passwordSuggestions').innerHTML = rating.feedback.suggestions.length ? `Password suggestions: ${rating.feedback.suggestions.join('; ')}` : '';
    }

    async signUpChooseSimple() {
        this.shadowRoot.querySelector('#authSignUpChoose').close();
        this.shadowRoot.querySelector('#authSignUp').open();
        this.shadowRoot.querySelector('#signUpSpinner').active = true;

        this.loginFlowType = 'simple';
        this.loginPassword = this._user.profile.sub;
        this.loginPasswordSalt = crypto.getRandomValues(new Uint8Array(16));
        this.loginPasswordHash = await this._hashPassword(this.loginPassword, this.loginPasswordSalt, 1000);
        console.log(`Password salt: ${this._arrayBufferToBase64(this.loginPasswordHash)}`);
        console.log(`Password hash: ${this._arrayToBase64(this.loginPasswordSalt)}`);

        await this._signUpL2P({
            username: this.loginName,
            email: this._user.profile.email,
            hash: this._arrayBufferToBase64(this.loginPasswordHash),
            salt: this._arrayToBase64(this.loginPasswordSalt),
            flowType: this.loginFlowType,
            // TODO mnemonic
        });

        this.shadowRoot.querySelector('#authSignUp').close();
        this.handleLogin(this._user);
    }

    async signUpChooseAdvanced() {
        this.shadowRoot.querySelector('#authSignUpChoose').close();

        this.loginFlowType = 'advanced';
        this.checkPasswordStrength({});
        this.shadowRoot.querySelector('#authSignUpPassword').open();
    }

    async signUpAdvanced() {
        this.loginPassword = this.shadowRoot.querySelector('#passwordSignUp').value;
        this.shadowRoot.querySelector('#signUpSpinner').active = true;

        this.loginPasswordSalt = crypto.getRandomValues(new Uint8Array(16));
        this.loginPasswordHash = await this._hashPassword(this.loginPassword, this.loginPasswordSalt, 1000);
        console.log(`Password salt: ${this._arrayBufferToBase64(this.loginPasswordHash)}`);
        console.log(`Password hash: ${this._arrayToBase64(this.loginPasswordSalt)}`);

        await this._signUpL2P({
            username: this.loginName,
            email: this._user.profile.email,
            hash: this._arrayBufferToBase64(this.loginPasswordHash),
            salt: this._arrayToBase64(this.loginPasswordSalt),
            flowType: this.loginFlowType,
            // TODO mnemonic
        });

        // Reset password input
        this.shadowRoot.querySelector('#passwordSignUp').value = '';
        this.shadowRoot.querySelector('#authSignUpPassword').close();
        this.handleLogin(this._user);
    }

    async _hashPassword (password, salt, iterations) {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder('utf-8').encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey'],
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-1', salt: salt, iterations: iterations },
            key,
            128,
        );
        return bits;
    }

    _arrayBufferToBase64(a) {
        return this._arrayToBase64(new Uint8Array(a));
    }

    _arrayToBase64(a) {
        return btoa(String.fromCharCode(...a));
    }

    // Password can be a hash
    async _loginL2P(username, password) {
        const headers = new Headers();

        // Assuming only strings and ArrayBuffers to be passed
        if (typeof password === 'object') {
            password = this._arrayBufferToBase64(password);
        }

        const auth = btoa(`${username}:${password}`);
        headers.append('Authorization', `Basic ${auth}`);

        const res = await fetch(`${this.baseUrl}/las2peer/auth/login`, {
            headers: headers,
            method: "get",
        });
        return await res.json();
    }

    async _signUpL2P(data) {
        const res = await fetch(`${this.baseUrl}/las2peer/auth/create`, {
            body: JSON.stringify(data),
            method: "post",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return await res.json();
    }

    async _getAgent(username) {
        const formData = new FormData();
        formData.append("username", username);

        const res = await fetch(`${this.baseUrl}/las2peer/agents/getAgent`, {
            body: formData,
            method: "post",
        });
        return await res.json();
    }
}

customElements.define('las2peer-frontend-statusbar', Las2peerFrontendStatusbar);
