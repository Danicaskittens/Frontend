import { Service } from 'corky/flux/service';
import {IModel} from '../model';
import {registerUser,Genres, loginUser,changeGenres,changePassword} from '../ducks/appDuck';

export class ProfileService extends Service {
    selector =
    (state: IModel) => (
        {
           username: state.app.user.username,
           genres: state.app.user.genres.map(function(item){
               return {
                   
                   text: Genres[item.genre],
                   value: <number>item.genre,
                   choosen: item.choosen
               }
           }),
           loginError: state.app.loginError,
           emailError: state.app.emailError,
           passwordError: state.app.passwordError,
           confirmPasswordError: state.app.confirmPasswordError,
           arrayError: state.app.arrayError,
           message: state.app.changePasswordError
        }
    );
    actions = {
        register: (email:string, password: string, confirm:string) => registerUser.payload({data:{Email: email, Password: password, ConfirmPassword: confirm},options:{}}),
        login: (email:string, password: string) => loginUser.payload({data:{userName:email, password: password, grant_type: "password"}, options: {}}),
        sendGenres: (genres: Array<number>) => changeGenres.payload(genres),
        changePass: (old: string, newP: string,confirm: string) => changePassword.payload({data:{OldPassword: old, NewPassword: newP,ConfirmPassword: confirm }})
    }
}

var profileService = new ProfileService();

export default profileService;