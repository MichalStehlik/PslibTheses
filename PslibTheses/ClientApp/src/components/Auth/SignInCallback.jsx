import React, {useState, useEffect, useCallback} from "react";
import {Redirect} from "react-router";
import {Message, Heading, Paragraph, Loader} from "../general";
import {useAppContext, SET_ICON} from "../../providers/ApplicationProvider";
import {ReactComponent as ErrorIcon} from "../../assets/icons/bug.svg";
import styled from 'styled-components';
import axios from "axios";
import {mainTheme as theme} from "../../App";

const StyledSignInCallback = styled.main`
height: 100%;
width: 100%;
display: flex;
flex-direction: column;
background-color: ${props => theme.colors.menuBackground};
color: ${props => theme.colors.menuForeground};
justify-content: center;
align-items: center;
text-align: center;
padding: 15px;
box-sizing: border-box;
`;

const SignInCallback = props => {
    const [message, setMessage] = useState("");
    const [allOk, setAllOk] = useState(false);
    const [failure, setFailure] = useState(false);
    const [{userManager}, dispatch] = useAppContext();

    let lockedProfile = false;
    let lockedIcon = false;

    const setupProfile = useCallback((profile, accessToken, idToken) => {
        setMessage("Ověřování existence uživatele " + profile.sub);
        axios.get(process.env.REACT_APP_API_URL + "/users/" + profile.sub, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            setMessage("Uživatel nalezen");
            lockedProfile = response.data.lockedChange;
            lockedIcon = response.data.lockedIcon;
            if (lockedProfile !== true)
            {
                setMessage("Aktualizace záznamu uživatele " + profile.sub);
                axios.put(process.env.REACT_APP_API_URL + "/users/" + profile.sub, {
                    Id: profile.sub,
                    FirstName: profile.given_name,
                    LastName: profile.family_name,
                    Gender: (profile.gender === "Male") ? 1 : (profile.gender === "Female") ? 2 : (profile.gender === "Other") ? 3 : 0,
                    Email: profile.email,
                    CanBeAuthor: (profile.theses_author) ? true : false,
                    CanBeEvaluator: (profile.theses_evaluator) ? true : false
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    setMessage("Profil uživatele byl aktualizován.");
                }).catch(error => {
                    if (error.response) {
                        setMessage("Došlo k chybě při aktualizaci profilu uživatele " + profile.sub + " (" + error.response.status + ")");
                    }
                    else
                    {
                        setMessage("Požadavek nevrátil očekávanou odpověď.");
                    }
                    setFailure(true);
                });
            }               
        })
        .catch(error => {
            lockedProfile = true;
            lockedIcon = true;
            if (error.response)
            {
                if (error.response.status === 404)
                {
                    setMessage("Uživatel zatím neexistuje.");
                    setMessage("Vytváření záznamu uživatele " + profile.sub);
                    axios.post(process.env.REACT_APP_API_URL + "/users", {
                        Id: profile.sub,
                        FirstName: profile.given_name,
                        LastName: profile.family_name,
                        Gender: (profile.gender === "Male") ? 1 : (profile.gender === "Female") ? 2 : (profile.gender === "Other") ? 3 : 0,
                        Email: profile.email,
                        CanBeAuthor: (profile.theses_author) ? true : false,
                        CanBeEvaluator: (profile.theses_evaluator) ? true : false,
                        IconImage: profile.picture,
                        IconImageType: profile.picture_format
                    }, {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    }).then(response => {
                        setMessage("Profil vytvořen");
                    }).catch(error => {
                        if (error.response) {
                            setMessage("Došlo k chybě při vytváření uživatele " + profile.sub + " (" + error.response.status + ")");
                        }
                        else
                        {
                            setMessage("Požadavek nevrátil očekávanou odpověď.");
                        }
                        setFailure(true);
                    });
                }
                else
                {
                    setFailure(true);
                    setMessage("Požadavek vrátil chybu: " + error.response.status);
                }
            }
            else
            {
                setFailure(true);
                setMessage("Požadavek nevrátil očekávanou odpověď.");
            }
        })
        .then(()=>{
            setMessage("Získávání ikony uživatele");
            axios.get(process.env.REACT_APP_AUTH_URL + "/api/account/icon", {
                responseType: "blob",
                headers: {
                    Authorization: "Bearer " + accessToken
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
                if (lockedIcon !== true)
                {
                    let formData = new FormData();
                    formData.append("file", imageData, "picture.jpg");
                    axios.post(process.env.REACT_APP_API_URL + "/users/" + profile.sub + "/icon", 
                        formData,
                        {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": 'multipart/form-data'
                        }
                    })
                    .then(response => {
                    })
                    .catch(error => {
                        setMessage("Při ukládání ikony došlo k chybě.");
                        setFailure(true);
                    })
                    .then(()=>{
                        setAllOk(true);
                    })
                }  
                else
                {
                    setAllOk(true);
                }              
            })
            .catch(error => {
                if (error.response)
                {
                    setMessage("Požadavek na ikonu vrátil chybu: " + error.response.status);
                    setFailure(true);
                    console.log(error);
                } else {
                    setMessage("Při získávání ikony došlo k chybě.");
                    setFailure(true);
                    console.log(error);
                }
            })
            .then(()=>{
                //setAllOk(true);
            });
        });
    },[dispatch]);

    useEffect(()=>{     
        (async () => {
            setMessage("Čekání na uživatelská data");
            const signResult = await userManager.signinRedirectCallback();
            setupProfile(signResult.profile, signResult.access_token, signResult.id_token);
        })();
    },[userManager, dispatch]);
    if (allOk)
    {
        return <Redirect to="/" />
    } 
    else
    {
        return (
            <StyledSignInCallback>
            <Message>
                {failure === true ? <ErrorIcon width="60px" fill={theme.colors.menuForeground} /> : <Loader size="60px" normal={theme.colors.logoForeground} accent={theme.colors.logoBackground} />}
                <Heading>Dlouhodobé práce</Heading>
                <Paragraph>{message}</Paragraph>
            </Message>
            </StyledSignInCallback>
        );
    }
}
   
export default SignInCallback;