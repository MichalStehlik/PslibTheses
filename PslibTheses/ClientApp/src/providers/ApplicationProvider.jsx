import React, {createContext, useReducer, useContext, useEffect} from "react";
import { UserManager, WebStorageStateStore, Log } from "oidc-client";
import { IDENTITY_CONFIGURATION, METADATA_OIDC } from "../configuration/authorization";
import axios from "axios";

export const SET_TITLE = "SET_TITLE";
export const ADD_MESSAGE = "ADD_MESSAGE";
export const DISMISS_MESSAGE = "DISMISS_MESSAGE";
export const CLEAR_MESSAGES = "CLEAR_MESSAGES";
export const SET_ACCESS_TOKEN = "SET_ACCESS_TOKEN";
export const CLEAR_ACCESS_TOKEN = "CLEAR_ACCESS_TOKEN";
export const SET_ID_TOKEN = "SET_ID_TOKEN";
export const CLEAR_ID_TOKEN = "CLEAR_ID_TOKEN";
export const USER_EXPIRED = "USER_EXPIRED";
export const USER_FOUND = "USER_FOUND";
export const USER_EXPIRING = "USER_EXPIRING";
export const LOADING_USER = "LOADING_USER";
export const SILENT_RENEW_ERROR = "SILENT_RENEW_ERROR";
export const SESSION_TERMINATED = "SESSION_TERMINATED";
export const LOAD_USER_ERROR = "LOAD_USER_ERROR";
export const USER_SIGNED_OUT = "USER_SIGNED_OUT";
export const SET_THEME = "SET_THEME";
export const SET_ICON = "SET_ICON";

const userStore = window.localStorage;
const userManager = new UserManager({
    ...IDENTITY_CONFIGURATION,
    userStore: new WebStorageStateStore({ store: userStore }),
    metadata: {
        ...METADATA_OIDC
    }
});

const initialState = {
    userManager: userManager,
    accessToken: null,
    idToken: null,
    userId: null,
    profile: null,
    isUserLoading: false,
    title: null,
    messages: [],
    messageCounter: 0,
    profileIcon: null,
    profileIconType: null,
    theme: "light"
}
Log.logger = console;
Log.level = Log.ERROR;//Log.DEBUG;

const parseJwt = token => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
};

const reducer = (state, action) => {
    var newMessages = [...state.messages];
    switch (action.type) {
        case SET_THEME: {
            return {...state,  theme: action.theme };
        }
        case ADD_MESSAGE: {
            newMessages.push({
                variant: action.variant,
                text: action.text,
                dismissible: action.dismissible === true,
                expiration: action.expiration ? action.expiration : null
            });
            return {...state,  messages: newMessages, messageCounter: state.messageCounter + 1 };
        }
        case DISMISS_MESSAGE: {
            newMessages.splice(action.id, 1);
            return {...state,  messages: newMessages, messageCounter: state.messageCounter - 1 };
        }
        case CLEAR_MESSAGES: {
            return {...state,  messages: [], messageCounter: 0 };
        }
        case SET_TITLE: {
            return {...state, title: action.payload };
        }
        case LOADING_USER:
            return {...state, isUserLoading: true}
        case SET_ACCESS_TOKEN:
            return {...state, accessToken: action.payload}
        case CLEAR_ACCESS_TOKEN:
            return {...state, accessToken: null}
        case SET_ID_TOKEN:
            return {...state, idToken: action.payload}
        case CLEAR_ID_TOKEN:
            return {...state, idToken: null}
        case USER_FOUND:
            return {...state, idToken: action.idToken, accessToken: action.accessToken, userId: action.userId, profile: action.profile, isUserLoading: false}
        case USER_EXPIRED:
        case LOAD_USER_ERROR:
        case SILENT_RENEW_ERROR:
        case USER_SIGNED_OUT:
        case SESSION_TERMINATED:
            return {...state, idToken: null, accessToken: null, userId: null, profile: null, isUserLoading: false, profileIcon: null, profileIconType: null}     
        case SET_ICON: {
            return {...state, profileIcon: action.icon, profileIconType: action.iconType };
        }   
        default : {
            return state;
        }
    }
}

export const ApplicationContext = createContext(initialState);
export const ApplicationConsumer = ApplicationContext.Consumer;
export const ApplicationProvider = props => {
    const store = useReducer(
        reducer, 
        initialState
    );
    const [, dispatch] = store;
    useEffect(() => {     
        userManager.events.addUserLoaded(user => {
            const tokenData = parseJwt(user.access_token);
            axios.get(process.env.REACT_APP_AUTH_URL + "/api/account/icon", {
                responseType: "blob",
                headers: {
                    Authorization: "Bearer " + user.access_token
                }
            })
            .then(response => {
                let imageData = new Blob([response.data],{type: response.headers["content-type"]});
                let reader = new FileReader();
                reader.onloadend = function() {
                    var base64 = reader.result;                
                    var base64data = base64.split(',')[1]
                    dispatch({type: SET_ICON, icon: base64data, iconType: response.headers["content-type"]});
                }
                reader.readAsDataURL(imageData); 
            });
            dispatch({
                type: USER_FOUND, 
                accessToken: user.access_token, 
                idToken: user.id_token, 
                userId: tokenData.sub, 
                profile: user.profile
            });
            dispatch({ type: ADD_MESSAGE, text: "Uživatel byl přihlášen.", variant: "success", dismissible: true, expiration: 5 });
        });
        userManager.events.addUserUnloaded(() => {
            dispatch({type: ADD_MESSAGE, text: "Informace o přihlášení jsou neplatné.", variant: "info", dismissible: true, expiration: 3});
            dispatch({
                type: USER_EXPIRED
            });
        });
        userManager.events.addAccessTokenExpiring(() => {
            dispatch({type: ADD_MESSAGE, text: "Platnost Vašeho přihlášení brzy vyprší.", variant: "warning", dismissible: true, expiration: 10});
            dispatch({
                type: USER_EXPIRING
            });
        });
        userManager.events.addAccessTokenExpired(() => {
            dispatch({type: ADD_MESSAGE, text: "Platnost Vašeho přihlášení vypršela.", variant: "info", dismissible: true, expiration: 10});
            dispatch({
                type: USER_EXPIRED
            });
        });
        userManager.events.addSilentRenewError(() => {
            dispatch({type: ADD_MESSAGE, text: "Nepodařilo se obnovit platnost Vašeho přihlášení.", variant: "error", dismissible: true, expiration: false});
            dispatch({type: SILENT_RENEW_ERROR});
        });
        userManager.events.addUserSignedOut(() => {
            dispatch({type: ADD_MESSAGE, text: "Uživatel byl automaticky odhlášen.", variant: "warning", dismissible: true, expiration: 3});
            dispatch({
                type: USER_SIGNED_OUT
            });
        });
        
        userManager.getUser()
        .then((user)=>{
            if (user && !user.expired) {
                let tokenData = parseJwt(user.access_token);
                dispatch({
                    type: USER_FOUND, 
                    accessToken: user.access_token, 
                    idToken: user.id_token, 
                    userId: tokenData.sub, 
                    profile: user.profile
                });
            } else if (!user || (user && user.expired)) {
                dispatch({
                    type: USER_EXPIRED
                });
            }
        })
        .catch(()=>{
            dispatch({
                type: LOAD_USER_ERROR
            });
        });
    },[dispatch]); 
    return (
        <ApplicationContext.Provider value={store}>
            {props.children}
        </ApplicationContext.Provider>
    );
}
export const useAppContext = () => useContext(ApplicationContext);