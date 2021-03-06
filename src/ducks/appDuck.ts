import Flux from 'corky/flux';
import { app } from '../main';


export var availableGenres = {
    "Data": [
        {
            "GenreId": 1,
            "Name": "Action"
        },
        {
            "GenreId": 2,
            "Name": "Animation"
        },
        {
            "GenreId": 3,
            "Name": "Comedy"
        },
        {
            "GenreId": 4,
            "Name": "Drama"
        },
        {
            "GenreId": 5,
            "Name": "Fantasy"
        },
        {
            "GenreId": 6,
            "Name": "SciFi"
        },
        {
            "GenreId": 7,
            "Name": "Thriller"
        }
    ]
}

export enum PageActive {
    None,
    Chat,
    Search,
    Dashboard,
    Profile,
    Register,
    Login,
    AdvancedSearch,
    CinemaSearch,
    Reservation,
    ReservationHistory
}

export enum Genres {
    None,
    Action,
    Animation,
    Comedy,
    Drama,
    Fantasy,
    SciFi,
    Thriller
}
export interface Profile {
    username: string,
    userpicture: string,
    token: string,
    genres: Array<IChoosenGenres>
}

export interface IAppState {
    active: PageActive,
    user: Profile,
    loginError: string,
    emailError: string,
    passwordError: string,
    confirmPasswordError: string,
    arrayError: Array<string>,
    changePasswordError: string
}

export interface IChoosenGenres {
    choosen: boolean,
    genre: Genres
}

export const confirmReservation = new Flux.Action<{ confirm: boolean }>("CONFIRM_RESERVATION");
var initialState: IAppState = {
    active: PageActive.None,
    user: {
        username: "",
        token: "",
        userpicture: "https://api.adorable.io/avatars/face/eyes5/nose7/mouth3/47B39D",
        genres: [
            { genre: 1, choosen: false },
            { genre: 2, choosen: false },
            { genre: 3, choosen: false },
            { genre: 4, choosen: false },
            { genre: 5, choosen: false },
            { genre: 6, choosen: false }]
    },
    loginError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
    arrayError: [],
    changePasswordError: ""
}


export interface ITokenResponse {
    access_token: string;
    token_type: string;
    userName: string;
    ".issued": string;
    ".expires": string;
}

export const goToView = new Flux.Action<{ view: PageActive }>("SWITCH_VIEW");
export const registerUser = new Flux.RequestAction<{ data: { Email: string, Password: string, ConfirmPassword: string }, options: any }, any>
    ("REGISTER_USER", "https://moviebot-rage.azurewebsites.net/api/Account/Register", "POST");
export const loginUser = new Flux.RequestAction<{ data: { userName: string, password: string, grant_type: string }, options: any }, ITokenResponse>
    ("LOGIN_USER", "https://moviebot-rage.azurewebsites.net/Token", "POST");

export const logoutUser = new Flux.Action("LOGOUT_USER");
export const readStorage = new Flux.Action("READ_STORAGE");
export const changeGenres = new Flux.Action<Array<number>>("CHANGE_GENRES");

export const loadUserGenres = new Flux.RequestAction<any, any>("GET_USER_GENRES", "http://moviebot-rage.azurewebsites.net/api/v2/FavoriteGenres/getByUserId", "GET");
export const addUserGenre = new Flux.RequestAction<{template:{genreId: string},options:any}, any>("ADD_USER_GENRE", "http://moviebot-rage.azurewebsites.net/api/v2/FavoriteGenres/add/{genreId}", "PUT");
export const removeUserGenre = new Flux.RequestAction<{template:{genreId: string},options:any}, any>("REMOVE_USER_GENRE", "http://moviebot-rage.azurewebsites.net/api/v2/FavoriteGenres/remove/{genreId}", "PUT");

export const changePassword = new Flux.RequestAction<{data:{OldPassword:string, NewPassword: string, ConfirmPassword: string}},any>
("CHANGE_PASSWORD",  "https://moviebot-rage.azurewebsites.net/api/Account/ChangePassword", "POST");

export var appReducer = new Flux.Reducer<IAppState>([
    {
        action: changePassword.request,
        reduce: (state: IAppState, payload: any) => {
            payload.options = {};
            payload.options["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
            payload.options["Authorization"] = "Bearer " + state.user.token;
            state.changePasswordError = "";

        }
    },
    {
        action: changePassword.response,
        reduce: (state: IAppState, payload: any) => {
           

        }
    },
    {
        action: changePassword.error,
        reduce: (state: IAppState, payload: any) => {
           state.changePasswordError = "There was an error when trying to change your password."
           if( payload.response.body.ModelState.ConfirmPassword)
            state.changePasswordError +=" " +  payload.response.body.ModelState.ConfirmPassword;
           if( payload.response.body.ModelState.NewPassword)
                state.changePasswordError +=" " +  payload.response.body.ModelState.NewPassword;
                

        }
    },
    {
        action: loadUserGenres.request,
        reduce: (state: IAppState, payload: any) => {
            payload.options = {};
            payload.options["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
            payload.options["Authorization"] = "Bearer " + state.user.token;

        }
    },
    {
        action: loadUserGenres.response,
        reduce: (state: IAppState, payload: {Data:Array<{GenreId : Genres, Name: string}>}) => {
            state.user.genres.forEach(element => {
                if(payload.Data.some(function(k){ if(k.GenreId === element.genre) return true;}))
                    element.choosen = true;
            });

        }
    },
    {
        action: logoutUser,
        reduce: (state: IAppState, payload: any) => {
            state = initialState;
            localStorage.setItem('user', null);
            localStorage.setItem('token', null);
            localStorage.setItem('expires', null);
        }
    },
    {
        action: changeGenres,
        reduce: (state: IAppState, payload: Array<number>) => {
            var options = {};
            options["Authorization"] = "Bearer " + state.user.token;
            state.user.genres.forEach(element => {
                if (payload.indexOf(<number>element.genre) !== -1)
                 {   element.choosen = true;
                     saveGenre(<number>element.genre,options);
                }
                else{
                    element.choosen = false;
                    deleteGenre(<number>element.genre,options);
                }
                    
            })
        }
    },
    {
        action: readStorage,
        reduce: (state: IAppState, payload: any) => {
            state.user.username = localStorage.getItem("user");
            state.user.token = localStorage.getItem("token");
        }
    },
    {
        action: goToView,
        reduce: (state: IAppState, payload: { view: PageActive }) => {
            state.active = payload.view;
            if(state.changePasswordError !=="")
                state.changePasswordError = "";
        }
    },
    {
        action: registerUser.request,
        reduce: (state: IAppState, payload: { data: { Email: string, Password: string, ConfirmPassword: string }, options: any }) => {
            payload.options = {};
            payload.options["Content-Type"] = "application/x-www-form-urlencoded;  charset=utf-8";
        }
    },
    {
        action: registerUser.response,
        reduce: (state: IAppState, payload: any) => {
            console.log("Success", payload);
            state.active = PageActive.Login;
            state.emailError = "";
            state.passwordError = "";
            state.confirmPasswordError = "";
            state.arrayError.length = 0;
        }
    },
    {
        action: registerUser.error,
        reduce: (state: IAppState, payload: any) => {
            console.log("Error occured", payload);
            var modelState = payload.response.body.ModelState;
            if (modelState['model.Email'] !== undefined){
                state.emailError = modelState['model.Email'][0];
            }
            else {
                state.emailError = "";
            }
            if (modelState['model.Password'] !== undefined){
                state.passwordError = modelState['model.Password'][0];
            }
            else {
                state.passwordError = "";
            }
            if (modelState['model.ConfirmPassword'] !== undefined){
                state.confirmPasswordError = modelState['model.ConfirmPassword'][0];
            }
            else {
                state.confirmPasswordError = "";
            }
            if (modelState[''] !== undefined){
                state.arrayError = modelState[''][0].split(". ");
            }
            else {
                state.arrayError.length = 0;
            }
        }
    },
    {
        action: loginUser.request,
        reduce: (state: IAppState, payload: { data: { userName: string, password: string, grant_type: string }, options: any }) => {
            payload.options = {};
            payload.options["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
        }
    },
    {
        action: loginUser.response,
        reduce: (state: IAppState, payload: ITokenResponse) => {
            console.log("Success", payload);
            app.redirect('/dashboard');
            state.user.username = payload.userName;
            state.user.token = payload.access_token;
            localStorage.setItem('user', payload.userName);
            localStorage.setItem('token', payload.access_token);
            localStorage.setItem('expires', payload[".expires"]);
            state.loginError = "";
            console.log("payload login", payload);
        }
    },
    {
        action: loginUser.error,
        reduce: (state: IAppState, payload: any) => {
            console.log("Error occured", payload);
            state.loginError = payload.response.body.error_description;
        }
    }
], initialState);

function saveGenre(genre,options){
    setTimeout(function(){
        app.dispatch(addUserGenre.payload({template:{genreId: genre},options:options}));
    }, 100);
}
function deleteGenre(genre,options){
     setTimeout(function(){
        app.dispatch(removeUserGenre.payload({template:{genreId: genre},options:options}));
    }, 100);
}