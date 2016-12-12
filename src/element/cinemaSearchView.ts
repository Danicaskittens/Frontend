import { Element } from 'corky/tags/element';
import template from '../template';
import cinemaSearchService from '../service/cinemaSearchService';
import {ICinemaSearchMovieResult} from '../ducks/cinemaSearchDuck';
import {app} from '../main';
import {cinemaMovieSearchLocation, getLocationFromBing} from '../ducks/cinemaSearchDuck';
import {mapKey} from '../config';


@template("cinema-search-view", cinemaSearchService)
export abstract class CinemaSearchView extends Element {
    cinemaResult: Array<ICinemaSearchMovieResult>

    cinemaSearch() {
        dateFromForm = (<HTMLInputElement>document.getElementById("datepicker")).value;
        dateFromForm = dateFromForm.trim();
        
        var isChecked = (<HTMLInputElement>document.getElementById('cinema-option')).checked;
        if (isChecked){
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
        else{
            var city = (<HTMLInputElement>document.getElementById("cinema-city-input")).value;
            city = city.trim();
            if(city !== "" && city !== undefined && city !== null)
                getLocation(city);
        }
    }
}

var dateFromForm = "";

var onSuccess = function(position) {
    app.dispatch(cinemaMovieSearchLocation.payload({template:{longitude: position.coords.longitude, latitude: position.coords.latitude}}));
}

function onError(error){
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

function getLocation(value){
    app.dispatch(getLocationFromBing.payload({query: {query: value, key: mapKey}}));
}