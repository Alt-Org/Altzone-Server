import {CommonMocker, GetWrongFieldDTOptions} from "./commonMocker";
import {ProfileDto} from "../../profile/dto/profile.dto";
import {ModelName} from "../../common/enum/modelName.enum";

type ProfileWithPassword = ProfileDto&{password: string};
export class ProfileMocker{
    public static readonly usernames: string[] = [
        'shaquille.oatmeal', 'hanging_with_my_gnomies', 'hoosier-daddy',
        'fast_and_the_curious', 'google_was_my_idea', 'casanova',
        'HairyPoppins', 'whos_ur_buddha', 'me_for_president',
        'tinfoilhat', 'oprahwindfury', 'anonymouse',
        'HeartTicker', 'YESIMFUNNY', 'pluralizes_everythings',
        'laugh_till_u_pee', 'unfriendme', 'Babushka',
    ];
    public static profiles: Partial<ProfileWithPassword>[] = [];
    private static nameIndex: number = 0;
    private static collisionIndex: number = 0;

    public static getValid(){
        const username = this.getUsername();
        const password = CommonMocker.getRandString(['my_password', 'psw', '1234', 'superLongPassword']);

        const newValidObj: Partial<ProfileWithPassword> = {username, password};
        ProfileMocker.profiles.push(newValidObj);

        return newValidObj;
    }

    public static getWithoutFields(fieldsToEscape: string[]) {
        const validObj = this.getValid() as ProfileDto;
        return CommonMocker.removeObjectFields(validObj, fieldsToEscape);
    }
    public static getWrongDT(fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): {}{
        const validObj = this.getValid();
        return CommonMocker.generateObjWithWrongDT(validObj, fieldsToBeWrong, options);
    }

    public static getObjMeta(){
        return CommonMocker.getMetadataForObject('Profile', ModelName.PROFILE);
    }
    public static getArrMeta(count: number){
        return CommonMocker.getMetadataForArray('Profile', ModelName.PROFILE, count);
    }

    private static getUsername(){
        if(this.nameIndex >= this.usernames.length){
            this.nameIndex = 0;
            this.collisionIndex++;
        }

        const result = ProfileMocker.usernames[this.nameIndex] + this.collisionIndex;
        this.nameIndex++;
        return result;
    }
}