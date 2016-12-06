import { Element } from 'corky/tags/element';
import template from '../template';
import advancedSearchService from '../service/advancedSearchService';
import {IAdvancedSearchMovieResult} from '../ducks/advancedSearchDuck';
import {app} from '../main';
import {advancedMovieSearch, advancedMovieSearchLocation, getLocationFromBing} from '../ducks/advancedSearchDuck';
import {mapKey} from '../config';


@template("advanced-search-view",advancedSearchService)
export abstract class AdvancedSearchView extends Element {
    result: Array<IAdvancedSearchMovieResult>

    advancedSearch() {
        var isChecked = (<HTMLInputElement>document.getElementById('search-option')).checked;
        if (isChecked){
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
        else{
            var value = (<HTMLInputElement>document.getElementById("city-input")).value;
            value = value.trim();
            if(value !== "" && value !== undefined && value !== null)
                getLocation(value);
        }
    }
}

var onSuccess = function(position) {
    app.dispatch(advancedMovieSearchLocation.payload({ query: { longitude: position.coords.longitude, latitude: position.coords.latitude}}));
}

function onError(error){
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

function getLocation(value){
    app.dispatch(getLocationFromBing.payload({query: {query: value, key: mapKey}}));
}
