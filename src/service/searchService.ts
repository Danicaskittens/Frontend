import { Service } from 'corky/flux/service';
import {IModel} from '../model';
import {searchMovieTitleDummy,ISearchMovieResult} from '../ducks/searchDuck';

export class SearchService extends Service {
    selector =
    (state: IModel) => (
        {
           result: state.search.result
        }
    );
    actions = {
        
    }
}

var searchService = new SearchService();

export default searchService;