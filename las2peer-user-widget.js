import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-toggle-button/paper-toggle-button.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-icons/communication-icons.js";
import "@polymer/iron-icons/editor-icons.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-input/paper-textarea.js";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/paper-toast/paper-toast.js";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import {LitElement, html, css} from "lit";

class Las2peerUserWidget extends LitElement {

    static get styles() {
        return css`
            :host {
              margin-left: 10px;
              margin-right: 10px;
            }
            paper-toggle-button.green {
              --paper-toggle-button-checked-bar-color: var(--paper-green-500);
              --paper-toggle-button-checked-button-color: var(--paper-green-500);
              --paper-toggle-button-checked-ink-color: var(--paper-green-500);
              --paper-toggle-button-unchecked-bar-color: var(--paper-red-500);
              --paper-toggle-button-unchecked-button-color: var(--paper-red-500);
              --paper-toggle-button-unchecked-ink-color: var(--paper-red-500);
            }          
            .horizontal-section {
              padding: 0 !important;
            }
            .sublist {
              padding-left: 20px;
              padding-right: 20px;
            }
            .content {
              @apply(--layout-vertical);
              height: 100%;
            }
            .avatar {
              background-size: 100% 100%;
              float: left;
              overflow: hidden;
              height: 40px;
              width: 40px;
              border-radius: 20px;
              box-sizing: border-box;
              background-color: #ddd;
              background-image: url('https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png');
            }
            #itemsList,
            #selectedItemsList {
              @apply(--layout-flex);
            }
            .item {
              @apply(--layout-horizontal);
              cursor: pointer;
              padding: 16px 22px;
              border-bottom: 1px solid #DDD;
            }
            .item:focus,
            .item.selected:focus {
              outline: 0;
              background-color: #ddd;
            }
            .item.selected .star {
              color: var(--paper-blue-600);
            }
            .pad {
              @apply(--layout-flex);
              @apply(--layout-vertical);
              padding: 0 16px;
            }
            .primary {
              font-size: 16px;
            }
            .secondary {
              font-size: 14px;
            }
            .dim {
              color: gray;
            }
            .star {
              width: 24px;
              height: 24px;
            }
            .no-selection {
              color: #999;
              margin-left: 10px;
              line-height: 50px;
            }
            #file{
            display: none;
            }
            paper-dialog-scrollable {
              @apply(--layout-flex);
            }
            paper-button.green {
              background-color: var(--paper-green-500);
              color: white;
            }
            paper-icon-button.red {
              background-color: var(--paper-red-500);
              color: white;
              height: 32px;
              width: 32px;
              border-radius: 50% 50%;
            }
        `;
    }

    render() {
        return this.getWidget(this.pageId);
    }

    static get properties() {
        return {
            pageId: {
                type: String,
            },
            oidcIdToken: {
                type: Object,
            },
            data: {
                type: Object,
            },
            baseUrl: {
                type: String,
            },
            hover: {
                type: Boolean,
            },
            firstName: {
                type: String,
            },
            lastName: {
                type: String,
            },
            userImage: {
                type: String,
            },
            firstNamePermission: {
                type: Boolean,
            },
            lastNamePermission: {
                type: Boolean,
            },
            userImagePermission: {
                type: Boolean,
            },
            appearInAddressbook: {
                type: Boolean,
            },
            contactToRemove: {
                type: String,
            },
            contacts: {
                type: Array,
            },
            addressbookContacts: {
                type: Object,
            },
            contactsCanAdd: {
                type: Object,
            },
            addedGroup:{
                type: String,
            },
            group: {
                type: String,
            },
            groups: {
                type: Object,
            },
            groupMember: {
                type: Object,
            },
            loggedIn: {
                type: Boolean,
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
            oidcIssuerUrl: {
                type: String,
            },
            oidcUserSub: {
                type: String,
            },
            _requestHeaders: {
                type: Object,
            },
            sendCookie: {
                type: Boolean,
            },
            suppressErrorToast: {
                type: Boolean,
            }
        }
    }

    constructor() {
        super();
        this.pageId = "0";
        this.hover = false;


        this.sendCookie = false;
        this.suppressErrorToast = false;
        this.userImage = "";

        // initialize all values so that the widgets can be rendered already
        // edit profile
        this.firstName = "";
        this.lastName = "";
        this.userImage = "";

        // change privacy
        this.firstNamePermission = "false";
        this.lastNamePermission = "false";
        this.userImagePermission = "false";
        this.appearInAddressbook = false;

        // manage contacts
        this.contacts = [];

        // manage groups
        this.contactsCanAdd = [];
        this.groups = [];
        this.groupMember = [];

        // addressbook
        this.addressbookContacts = [];

    }

    update(_changedProperties) {
        if (_changedProperties.has("loginName") || _changedProperties.has("loginPassword") ||
            _changedProperties.has("oidcAccessToken") || _changedProperties.has("oidcUserSub")) {
            this.loggedIn = (this.loginName != null && this.loginName.length && this.oidcAccessToken != null &&
                this.oidcAccessToken.length && this.oidcUserSub != null && this.oidcUserSub.length);
            if (this.loggedIn) {
                this._requestHeaders = this._computeHeaders(this.loginName, this.loginPassword, this.oidcAccessToken,
                    this.oidcIssuerUrl, this.oidcUserSub);
            }
        }
        console.log(_changedProperties);
        super.update(_changedProperties);
    }

    updated(_changedProperties) {
        if(_changedProperties.has("pageId") && this.pageId !== "0" && this.pageId !== 0) {
            this.shadowRoot.getElementById("user-widget").open();
        }
        super.updated(_changedProperties);
    }

    /**
     * Returns the selected widget as <paper-dialog> based on given id
     * @param id defines, which widget should be shown [(1): edit profile; (2): edit rights; (3): edit contacts; (4): edit groups; (5): address book]
     * @returns the widget as html template
     */
    getWidget(id) {
        switch (id) {
            case "1":
                // edit profile
                this._getUserInformation();
                return html`
                    <paper-dialog id="user-widget" @iron-overlay-closed="${this.resetPageId}" style="width:400px" >
                        <h4>User Information</h4>
                        <p>First name:
                            <paper-input id="firstName" label="first name" no-label-float value="${this.firstName}"></paper-input>
                        </p>
                        <p>Last name:
                            <paper-input id="lastName" label="last name" no-label-float value="${this.lastName}"></paper-input>
                        </p>
                        <p>
                        <div style="width:50%;margin:auto">
                            <table>
                                <tr>
                                    <td>
                                        <div class="avatar" id="preview"></div>
                                    </td>
                                    <td>
                                        <input type="file" name="file" id="file" class="inputfile" @change="${this.onChangeAvatarFile}" />
                                        <paper-button raised @click="${this._uploadAvatarFile}">Upload new Avatar</paper-button>
                                    </td>
                                </tr>
                            </table>

                        </div>
                        <div style="display:none">User image:
                            <paper-input id="userImage" label="user image" width="50px" no-label-float value="${this.userImage}"></paper-input>
                        </div>
                        </p>
                        <div class="buttons">
                            <paper-button dialog-dismiss @click="${this.resetPageId}">Cancel</paper-button>
                            <paper-button dialog-confirm autofocus @click="${this.editUserFunction}">Save</paper-button>
                        </div>
                    </paper-dialog>
                `;
            case "2":
                // edit rights
                this._getPermissions();
                return html`
                    <paper-dialog id="user-widget" @iron-overlay-closed="${this.resetPageId}" style="width:400px">
                        <h4>Privacy</h4>
                        <p>
                        <table width="100%" style="border-collapse:separate; border-spacing:1em;">
                            <tr>
                                <td>First name:</td>
                                <td>Private</td>
                                <td>
                                    <paper-toggle-button id="firstNamePermission" ?checked="${this.firstNamePermission === "true"}" noink class="green"></paper-toggle-button>
                                </td>
                                <td>Public</td>
                            </tr>
                            <tr>
                                <td>Last name:</td>
                                <td>Private</td>
                                <td>
                                    <paper-toggle-button id="lastNamePermission" ?checked="${this.lastNamePermission === "true"}" noink class="green"></paper-toggle-button>
                                </td>
                                <td>Public</td>
                            </tr>
                            <tr>
                                <td>User image:</td>
                                <td>Private</td>
                                <td>
                                    <paper-toggle-button id="userImagePermission" ?checked="${this.userImagePermission === "true"}" noink class="green"></paper-toggle-button>
                                </td>
                                <td>Public</td>
                            </tr>
                            <tr>
                                <td>Addressbook:</td>
                                <td>Private</td>
                                <td>
                                    <paper-toggle-button id="appearInAddressbook" ?checked="${this.appearInAddressbook}" noink class="green"></paper-toggle-button>
                                </td>
                                <td>Public</td>
                            </tr>
                        </table>
                        </p>
                        <div class="buttons">
                            <paper-button dialog-dismiss @click="${this.changePermission}">Close</paper-button>
                        </div>
                    </paper-dialog>                    
                `;
            case "3":
                // edit contacts
                this._updateContactList()
                return html`
                    <paper-dialog id="user-widget" @iron-overlay-closed="${this.resetPageId}" style="width:400px">
                        <h4>Contacts:</h4>
                        <p>
                        <div>
                            <table>
                                <tr>
                                    <td>
                                        <paper-input id="addContactName" label="Contact name" no-label-float></paper-input>
                                    </td>
                                    <td>
                                        <paper-button raised @click="${this.addContact}" class="green">
                                            <iron-icon icon="add"></iron-icon>Add</paper-button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <paper-dialog-scrollable>
                            <div id="userContacts" style="overflow-y:scroll; max-height:200px; display: grid; place-items: normal;">
                                ${ this.contacts.map((item) => 
                                    html`<div style='padding:5px;' id="${item}">
                                            <div id="img ${item}" class="avatar"></div>
                                            <div style='margin-left:5px; position:relative; top:8px;display:inline;'>${item}</div>
                                            <div style='float:right'>
                                                <paper-icon-button raised class="red" icon="remove" @click="${() => this.removeContact(item)}" id="button ${item}"></paper-icon-button>
                                            </div>
                                        </div>`
                                )}
                            </div>
                        </paper-dialog-scrollable>
                        </p>
                        <div class="buttons">
                            <paper-button dialog-dismiss @click="${this.resetPageId}">Close</paper-button>
                        </div>
                    </paper-dialog>
                `;
            case "4":
                // edit groups
                this._updateGroups();
                return html`
                    <paper-dialog id="user-widget" @iron-overlay-closed="${this.resetPageId}" style="width:400px">
                        <h4>Groups:</h4>
                        <div>
                            <table>
                                <tr>
                                    <td>
                                        <paper-input id="addGroupName" label="Group name" no-label-float></paper-input>
                                    </td>
                                    <td>
                                        <paper-button raised @click="${this.addGroup}" class="green">
                                            <iron-icon icon="add"></iron-icon>Add</paper-button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <table>
                                <tr>
                                    <td>
                                        <select class="form-control" @change="${this._updateGroupMemberlist2}" id="groupSelect" style="width:150px">
                                            ${this.groups.map((item) =>
                                                html`<option value="${item}">${item}</option>`
                                            )}
                                        </select>
                                    <td>
                                        <paper-button raised @click="${this._getGroupId}" class="black">
                                            <iron-icon icon="content-paste"></iron-icon>Copy Id</paper-button>
                                    </td>
                                    </td>
                                    <td></td>
                                </tr>
                            </table>
                        </div>
                        <p><paper-dialog-scrollable>
                        <div id="userGroupMember" style="overflow-y:scroll; max-height:200px; display: grid; place-items: normal;">
                            ${ this.groupMember.map((item) =>
                                html`<div style='padding:5px;' id="${item}">
                                        <div id="imgg ${item}" class="avatar"></div>
                                        <div style='margin-left:5px; position:relative; top:8px;display:inline;'>${item}</div>
                                        <div style='float:right'>
                                            <paper-icon-button class="red" icon="remove" @click='${() => this.removeGroupMember(item)}' id="button ${item}"></paper-icon-button>
                                        </div>
                                    </div>`
                            )}
                        </div>
                        </paper-dialog-scrollable>
                        </p>
                        <div>
                            <table>
                                <tr>
                                    <td>Add a friend:</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>
                                        <select class="form-control" id="memberSelect" style="width:150px">
                                            ${this.contactsCanAdd.map((item) =>
                                                html`<option value="${item}">${item}</option>`
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        <paper-button raised @click="${this.addGroupMember}" class="green">
                                            <iron-icon icon="add"></iron-icon>Add</paper-button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <table>
                            </table>
                        </div>
                        <div class="buttons">
                            <paper-button dialog-dismiss @click="${this.resetPageId}">Close</paper-button>
                        </div>
                    </paper-dialog>
                `;
            case "5":
                // addressbook
                this._updateAddressbook();
                return html`
                    <paper-dialog id="user-widget" @iron-overlay-closed="${this.resetPageId}" style="width:400px">
                        <h4>Addressbook:</h4>
                        <p>
                            <paper-dialog-scrollable>
                        <div id="addressbookContacts" style="overflow-y:scroll; max-height:200px; display: grid; place-items: normal;">
                                ${ this.addressbookContacts.map((item) => 
                                    html`<div style='padding:5px;' id="${item}">
                                        <div id="imgAddr ${item}" class="avatar"></div>
                                        <div style='margin-left:5px; position:relative; top:8px;display:inline;'>${item}</div>
                                        <!--<div style='float:right'><paper-icon-button class="red" icon="remove" on-click='removeContact' id="[[item]]"></paper-icon-button></div>-->
                                    </div>`
                                )}
                        </div>
                        </paper-dialog-scrollable>
                        </p>
                        <div class="buttons">
                            <paper-button dialog-dismiss @click="${this.resetPageId}">Close</paper-button>
                        </div>
                    </paper-dialog>
                `;
            case "6":
                // error toast
                return html`
                    <paper-toast id="errorToast" class="fit-bottom" text=""></paper-toast>
                `;
            default:
                // closed user widget
                return html``;
        }
    }

    resetPageId() {
        this.pageId = 0;
    }

    /**
        Computes header for authentication against las2peer webconnector
     */
    _computeHeaders(loginName, loginPassword, oidcAccessToken, oidcIssuerUrl, oidcUserSub) {
        var headers = {};

        if (loginName != null && loginName.length && loginPassword != null && loginPassword.length) {
            headers["Authorization"] = "Basic " + btoa(loginName + ":" + loginPassword);
        } else if (oidcAccessToken != null && oidcAccessToken.length) {
            headers["access-token"] = oidcAccessToken;
            if (oidcIssuerUrl != null && oidcIssuerUrl.length) {
                headers["oidc_provider"] = oidcIssuerUrl;
            }
            if (oidcUserSub != null && oidcUserSub.length) {
                headers["Authorization"] = "Basic " + btoa(loginName + ":" + oidcUserSub)
            }
        }
        return headers;
    }

    _getUserInformation() {
        fetch(this.baseUrl + "/contactservice/user", {
            method: 'GET',
            headers: this._requestHeaders
        }).then((response) => {
            if (response.ok) {
                response.text().then((response) => {
                    let res = response.split(",");
                    this.firstName = res[0].substring(res[0].indexOf('=') + 1);
                    this.lastName = res[1].substring(res[1].indexOf('=') + 1);
                    this.userImage = res[2].substring(res[2].indexOf('=') + 1);
                })
            }
        });
        // not used until we use the file service again
        // if(this.userImage.length>0){
        //     this.shadowRoot.querySelector("#dropdown-button").style.backgroundImage = "url(" + this.baseUrl + "/fileservice/files/" + this.userImage + ")";
        //     this.shadowRoot.querySelector("#preview").style.backgroundImage = "url(" + this.baseUrl + "/fileservice/files/" + this.userImage + ")";
        // }
    }

    _updateContactList() {
        fetch(this.baseUrl + "/contactservice", {
            method: 'GET',
            headers: this._requestHeaders
        }).then( (response) => {
            if (response.ok) {
                response.json().then((userliste) => {
                    let newCont = false;
                    let keys = Object.keys(userliste);
                    for (var i = 0; i < keys.length; i++) {
                        if (!this.contacts.includes(userliste[keys[i]])) {
                            this.contacts.push(userliste[keys[i]]);
                            newCont = true;
                        }
                        // this._getContactInformation(userliste[keys[i]]);

                    }
                    this.contacts.sort(function(a, b) {
                        if (a.toLowerCase() < b.toLowerCase()) return -1;
                        if (a.toLowerCase() > b.toLowerCase()) return 1;
                        return 0;
                    });
                    if (newCont) {
                        this.requestUpdate()
                    }
                });
            }
        });

    }

    /**
     * not used until we use the file service again
     */
    // _getContactInformation(user) {
    //     fetch(this.baseUrl + "/contactservice/user/" + user, {
    //         method: 'GET',
    //         headers: this._requestHeaders
    //     }).then((response) => {
    //        if (response.ok) {
    //            response.text().then((result) => {
    //                 //TODO: if I get it correctly, this whole part is only used to load the image of the user. This is not working because currently the file service is down, so maybe we can comment it out at the moment. We could also remove this, because I guess nobody really cares about profile pictures...
    //                result = result.substring(1, result.length - 1);
    //                result = result.replace(/ /g, "");
    //                let res = result.split(",");
    //                let json = "{";
    //                for (let i = 0; i < res.length; i++) {
    //                    let res2 = res[i].split("=");
    //                    if (res2[1].startsWith('\"')){
    //                        json = json + '\"' + res2[0] + '\":' + res2[1] + ',';
    //                    } else {
    //                        json = json + "\"" + res2[0] + "\":" + "\"" + res2[1] + "\",";
    //                    }
    //                }
    //                json = json.substring(0, json.length - 1);
    //                json = json + "}";
    //                let jsonObject = JSON.parse(json);
    //                let imgUrl = "";
    //                if (typeof jsonObject["userImage"] !== 'undefined') {
    //                    imgUrl = jsonObject["userImage"];
    //                }
    //
    //                //$('#img'+currentUser).css("background-image", "url(https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/polymer3.0/logo.png)");
    //                let imgUrl_css = "https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png";
    //                if (imgUrl.length > 1)
    //                    imgUrl_css = this.baseUrl + "/fileservice/files/" + imgUrl;
    //
    //                let usrAvatar = this.shadowRoot.querySelector("#img " + user);
    //                if (usrAvatar != null)
    //                    usrAvatar.style.backgroundImage = "url(" + imgUrl_css + ")";
    //                usrAvatar = this.shadowRoot.querySelector("#imgg " + user);
    //                if (usrAvatar != null)
    //                    usrAvatar.style.backgroundImage = "url(" + imgUrl_css + ")";
    //                usrAvatar = this.shadowRoot.querySelector("#imgAddr " + user);
    //                if (usrAvatar != null)
    //                    usrAvatar.style.backgroundImage = "url(" + imgUrl_css + ")";
    //            });
    //        }
    //     });
    // }

    _updateAddressbook() {
        fetch(this.baseUrl + "/contactservice/addressbook", {
            method: 'GET',
            headers: this._requestHeaders
        }).then((response) => {
            if (response.ok) {
                response.json().then((res) => {
                    let newCont = false;
                    let keys = Object.keys(res);
                    for (var i = 0; i < keys.length; i++) {
                        if (!this.addressbookContacts.includes(res[keys[i]])) {
                            this.addressbookContacts.push(res[keys[i]]);
                            newCont = true;
                            // this._getContactInformation(res[keys[i]]);
                        }
                    }
                    if (this.loginName != null && this.loginName.length){
                        if (this.addressbookContacts.includes(this.loginName)) {
                            this.appearInAddressbook = true;
                        }
                    }
                    if (newCont) {
                        this.requestUpdate();
                    }
                });
            }
            });
    }

    editUserFunction() {
        this.firstName = this.shadowRoot.getElementById("firstName").value;
        this.lastName = this.shadowRoot.getElementById("lastName").value;
        this.userImage = this.shadowRoot.getElementById("userImage").value;
        fetch(this.baseUrl + "/contactservice/user", {
            method: 'POST',
            headers: this._requestHeaders,
            body: JSON.stringify({"firstName": this.firstName,
                "lastName": this.lastName,
                "userImage": this.userImage})
        }).then((response) => {
            if (response.ok) {
                // this._updatedUserInformation();
            }
        });
    }

    onChangeAvatarFile(e) {
        var formData = new FormData();
        for (var i = 0, f; f = e.target.files[i]; ++i) {
            formData.append("filecontent", f, f.name);
        }
        formData.append('identifier', 'contactPicutre' + Math.random().toString(36).substring(7));
        formData.append('description', 'profile picture');

        fetch(this.baseUrl + "/fileservice/files", {
            method: 'POST',
            headers: this._requestHeaders,
            body: formData
        }).then((response) => {
            if (response.ok) {
                response.text().then((res) => {
                   this.shadowRoot.getElementById("userImage").value = res;
                   if (res.length > 0) {
                       this.shadowRoot.querySelector("#dropdown-button").style.backgroundImage = "url(" + this.baseUrl + "/fileservice/files/" + this.userImage + ")";
                       this.shadowRoot.querySelector("#preview").style.backgroundImage = "url(" + this.baseUrl + "/fileservice/files/" + this.userImage + ")";
                   }
                   this.userImage = res;
                });
            }
        });
    }

    _uploadAvatarFile() {
        this.shadowRoot.getElementById("file").click();
    }

    changePermission() {
        let fnp = this.shadowRoot.getElementById("firstNamePermission").checked;
        let lnp = this.shadowRoot.getElementById("lastNamePermission").checked;
        let uip = this.shadowRoot.getElementById("userImagePermission").checked;
        let aia = this.shadowRoot.getElementById("appearInAddressbook").checked;

        fetch(this.baseUrl + "/contactservice/permission", {
            method: 'POST',
            headers: this._requestHeaders,
            body: JSON.stringify({"firstName": fnp,
                "lastName": lnp,
                "userImage": uip})
        }).then((response) => {
            if (response.ok) {
                this._getPermissions();
            }
        });

        if (aia !== this.appearInAddressbook) {
            if (aia) {
                fetch(this.baseUrl + "/contactservice/addressbook", {
                    method: 'POST',
                    headers: this._requestHeaders,
                }).then((response) => {
                    if (response.ok) {
                        this._updateAddressbook();
                    }
                });
            } else {
                fetch(this.baseUrl + "/contactservice/addressbook", {
                    method: 'DELETE',
                    headers: this._requestHeaders,
                }).then((response) => {
                    if (response.ok) {
                        this._updateAddressbook();
                    }
                });
            }
        }
    }

    _getPermissions() {
        this._updateAddressbook();
        fetch(this.baseUrl + "/contactservice/permission", {
            method: 'GET',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                response.text().then( (res) => {
                    let perm = res.split(",");
                    this.firstNamePermission = perm[0].substring(perm[0].indexOf('=') + 1);
                    this.lastNamePermission = perm[1].substring(perm[1].indexOf('=') + 1);
                    this.userImagePermission = perm[2].substring(perm[2].indexOf('=') + 1).slice(0, -1);
                    // this.userImagePermission = this.userImagePermission.substring(0, this.userImagePermission.length - 1);
                });
            }
        });
    }

    addContact() {
        let cn = this.shadowRoot.getElementById("addContactName").value;
        fetch(this.baseUrl + "/contactservice/" + cn, {
            method: 'POST',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                this._updateContactList();
            }
        });

    }

    removeContact(cn) {
        fetch(this.baseUrl + "/contactservice/" + cn, {
            method: 'DELETE',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                const index = this.contacts.indexOf(cn);
                if (index > -1) {
                    this.contacts.splice(index, 1);
                }
                this.contacts.sort(function(a, b) {
                    if (a.toLowerCase() < b.toLowerCase()) return -1;
                    if (a.toLowerCase() > b.toLowerCase()) return 1;
                    return 0;
                });
                this.shadowRoot.getElementById(cn).remove();
            }
        });
    }

    _updateGroups() {
        fetch(this.baseUrl + "/contactservice/groups", {
            method: 'GET',
            headers: this._requestHeaders
        }).then((response) => {
            if (response.ok) {
                response.json().then((res) => {
                    let newGrp = false;
                    let keys = Object.keys(res);

                    for (let i = 0; i < keys.length; i++) {
                        if (!this.groups.includes(res[keys[i]])) {
                            this.groups.push(res[keys[i]]);
                            newGrp = true;
                        }
                    }
                    if (keys.length > 0) {
                        if (this.shadowRoot.getElementById("groupSelect") !== null && this.shadowRoot.getElementById("groupSelect").value.length > 0) {
                            this.group = this.shadowRoot.getElementById("groupSelect").value;
                            this._updateGroupMemberlist();
                        } else {
                            this.group = res[keys[0]];
                            this._updateGroupMemberlist();
                        }
                    }
                    if (newGrp) {
                        this.requestUpdate();
                    }

                });
            }
        });
    }

    _updateGroupMemberlist() {
        this._updateContactList();
        fetch(this.baseUrl + "/contactservice/groups/" + this.group + "/member", {
            method: 'GET',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                response.json().then((res) => {
                    let newMem = false;
                    let keys = Object.keys(this.contacts);
                    for (let i = 0; i < keys.length; i++) {
                        if (!this.contactsCanAdd.includes(this.contacts[keys[i]])) {
                            this.contactsCanAdd.push(this.contacts[keys[i]]);
                        }
                    }
                    keys = Object.keys(res);
                    for (let i = 0; i < keys.length; i++) {
                        if (!this.groupMember.includes(res[keys[i]])) {
                            this.groupMember.push(res[keys[i]]);
                            newMem = true;
                        }
                        let index = this.contactsCanAdd.indexOf(res[keys[i]]);
                        if (index !== -1) {
                            this.contactsCanAdd.splice(index, 1);
                        }
                    }
                    this.groupMember.sort(function(a, b) {
                        if (a.toLowerCase() < b.toLowerCase()) return -1;
                        if (a.toLowerCase() > b.toLowerCase()) return 1;
                        return 0;
                    });
                    if (newMem) {
                        this.requestUpdate();
                    }
                });
            }
        });
    }

    _updateGroupMemberlist2() {
        this.group = this.shadowRoot.getElementById("groupSelect").value;
        this.groupMember = [];
        this.contactsCanAdd = [];
        this._updateGroupMemberlist();
    }

    addGroup() {
        let gn = this.shadowRoot.getElementById("addGroupName").value;
        fetch(this.baseUrl + "/contactservice/groups/" + gn, {
            method: 'POST',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                if (!this.groups.includes(gn)) {
                    this.groups.push(gn);
                }
                this.group = gn;
                this._updateGroupMemberlist(gn);
            }
        });
    }

    _getGroupId() {
        fetch(this.baseUrl + "/contactservice/groups/" + this.group + "/id", {
            method: 'GET',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                response.json().then((res) => {
                    navigator.clipboard.writeText(res.groupId);
                })
            }
        });
    }

    addGroupMember() {
        let gm = this.shadowRoot.getElementById("memberSelect").value;
        let g = this.shadowRoot.getElementById("groupSelect").value;
        if (gm.length > 0 && g.length > 0) {
            fetch(this.baseUrl + "/contactservice/groups/" + g + "/member/" + gm, {
                method: 'POST',
                headers: this._requestHeaders,
            }).then((response) => {
                if (response.ok) {
                    let index = this.contactsCanAdd.indexOf(gm);
                    if (index > -1) {
                        this.contactsCanAdd.splice(index, 1);
                    }
                    this.groupMember.push(gm);
                    this.requestUpdate();
                }
            });
        }
    }

    removeGroupMember(usr) {
        let grp = this.shadowRoot.getElementById("groupSelect").value;
        fetch(this.baseUrl + "/contactservice/groups/" + grp + "/member/" + usr, {
            method: 'DELETE',
            headers: this._requestHeaders,
        }).then((response) => {
            if (response.ok) {
                this.contactsCanAdd.push(usr);
                let index = this.groupMember.indexOf(usr);
                if (index > -1) {
                    this.groupMember.splice(index, 1);
                }
                // this.shadowRoot.getElementById(usr).remove();
                this.requestUpdate()
            }
        });
    }

    /**
     * not used until we use the file service again
     */
    // _updatedUserInformation() {
    //     this.shadowRoot.querySelector("#dropdown-button").style.backgroundImage = "url(" + this.baseUrl + "/fileservice/files/" + this.userImage + ")";
    // }

    _handleError(event) {
        //alert(event.target.lastResponse);
        console.error(
            event.detail.error.message + " " + event.detail.request.url
        );
    }

    _contactAddError(event) {
        if (!this.suppressErrorToast) {
            this.$.errorToast.show({
                text: 'Contact could not be added. ' + event.detail.request.xhr.response,
                duration: 2500
            });
        }
    }

    _addressbookError(event) {
        if (!this.suppressErrorToast) {
            this.$.errorToast.show({
                text: 'Addressbook: ' + event.detail.request.xhr.response,
                duration: 2500
            });
        }
    }

}

customElements.define("las2peer-user-widget", Las2peerUserWidget);
