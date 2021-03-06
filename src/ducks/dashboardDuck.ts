import Flux from 'corky/flux';
import {app} from '../main';
import { loginUser, logoutUser, readStorage } from './appDuck';

export interface IDashboardState {
    dashboard: {
        result: Array<ISuggestion>
    },
    token: string
}

export interface IImdbResult {
    id: string;
    description: string;
    image: string;
}

var initialState: IDashboardState = {
    dashboard: {
        result: []
    },
    token:""
}

var emptyImdbRresult: IImdbResult = {
    id: "",
    image: "",
    description: ""
}

export interface ISuggestion {
    id: string,
    title: string,
    url: string,
    description: string,
    runtime: string,
    genre: string,
    timeAndLocation: Array<ITimeAndLocation>
}

export interface ITimeAndLocation {
    location: string,
    time: string,
}

export interface ITimeAndLocationArrayResponse {
    Data: Array<{
        Cinema: {
            Name: string;
            City: string;
        },
        Projections: Array<{
            Date: string;
            Time: string;
        }>,
        ImdbId: string;
    }>
}

export interface IDashboardResponse {
    Title: string,
    ImdbDb: string,
    Poster: string,
    Runtime: string,
    Plot: string,
    Genre: string,
    CinemaId: string,
}

export interface IDashboardArrayResponse {
    Data: Array<{
        Title: string,
        ImdbDb: string,
        Poster: string,
        Runtime: string,
        Plot: string,
        Genre: string,
        Actors: any
    }>
}

export interface IImdbResponse {
    data: {
        id: string;
        description: string;
        image: string;
    }
}

export interface ImdbRe {
    id: string;
    description: string;
    image: string;
}

export const getImageFromImdb = new Flux.RequestAction<any, ImdbRe>("IMAGE_FROM_IMDB","http://imdb.wemakesites.net/api/tt0848228", "GET");
export const getMovies = new Flux.RequestAction<any, Array<IDashboardResponse>>("DASHBOARD_LIFE", "https://moviebot-rage.azurewebsites.net/api/v2/Recommender/moviesByGenre", "GET");
export const getProjections = new Flux.RequestAction<{ query: {imdbid: string},options: any}, Array<ITimeAndLocation>>("TIME_AND_LOCATION","https://moviebot-rage.azurewebsites.net/api/v1/Search/CinemaFromMovie", "GET");

export var dashboardReducer = new Flux.Reducer<IDashboardState>(
    [
         {
        action: logoutUser,
        reduce: (state: IDashboardState, payload: any) => {
            state = initialState;
        }
    },
    {
        action: readStorage,
        reduce: (state: IDashboardState, payload: any) => {
            state.token = localStorage.getItem("token");
        }
    },
    {
        action: loginUser.response,
        reduce: (state: IDashboardState, payload: { userName: string, access_token: string }) => {
            state.token = payload.access_token;
        }
    },
        {
           action: getMovies.request,
           reduce: (state: IDashboardState, payload: any) => {
               payload.options = {};
               payload.options["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
               payload.options["Authorization"] = "Bearer " + state.token;
            
           }
       },
        {
            action: getMovies.response,
            reduce: (state: IDashboardState, payload: IDashboardArrayResponse) => {
                state.dashboard.result = payload.Data.map((obj) => {
                    return {
                        id: obj.ImdbDb,
                        url: obj.Poster,
                        title: obj.Title,
                        description: obj.Plot,
                        runtime: obj.Runtime,
                        genre: obj.Genre,
                        timeAndLocation: [],
                        actors: obj.Actors
                    }
                });
                return state;
            }
        },
        {
            action: getImageFromImdb.response,
            reduce: (state: IDashboardState, payload: IImdbResponse) => {
                //getImageFromImdb.payload(payload = imdbResponse);
                state.dashboard.result.forEach(element => {
                    if(element.id == payload.data.id){
                        element.description = payload.data.description;
                        element.url = payload.data.image;
                    }
                });
                return state;
            }
        },
         {
           action: getProjections.request,
           reduce: (state: IDashboardState, payload: any) => {
               payload.options = {};
               payload.options["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
           }
       },
        {
            action: getProjections.response,
            reduce: (state: IDashboardState, payload: ITimeAndLocationArrayResponse) => {
                state.dashboard.result.forEach(element => {
                    payload.Data.forEach(payl => {
                        if(element.id == payl.ImdbId){
                            payl.Projections.forEach(proj => {
                                var tAndL: ITimeAndLocation = {
                                    location: payl.Cinema.Name,
                                    time: proj.Date + ': ' + proj.Time
                                }
                                element.timeAndLocation.push(tAndL);
                            });
                        }
                    })
                });
                return state;
            }
        }
    ], initialState
);

function callImdbRequest(result){
    if(result !== undefined){
        result.forEach(element => {
             app.dispatch(getImageFromImdb.payload({}));
        });
    }
}