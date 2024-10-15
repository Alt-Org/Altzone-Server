import { Player } from "../../../player/player.schema";
import { Profile } from "../../../profile/profile.schema";

export default class LoggedUser {
    private constructor() {
        LoggedUser.profile = {
            _id: '',
            username: 'user',
            password: 'password',
            isSystemAdmin: false
        }

        LoggedUser.player = {
            _id: '',
            backpackCapacity: 10,
            name: 'player',
            uniqueIdentifier: 'player',
            profile_id: ''
        }
    }

    private static profile: Profile & {_id: string} = {
        _id: '',
        username: 'user',
        password: 'password',
        isSystemAdmin: false
    };
    private static player: Player & {_id: string} = {
        _id: '',
        backpackCapacity: 10,
        name: 'player',
        uniqueIdentifier: 'player',
        profile_id: ''
    };

    static setProfile_id(_id: string){
        // LoggedUser.init();
        LoggedUser.profile._id = _id;
        LoggedUser.player.profile_id = _id;
    }

    static setPlayer_id(_id: string){
        // LoggedUser.init();
        LoggedUser.player._id = _id;
    }

    static getProfile(){
        // LoggedUser.init();
        return LoggedUser.profile;
    }

    static getPlayer(){
        // LoggedUser.init();
        return LoggedUser.player;
    }
} 