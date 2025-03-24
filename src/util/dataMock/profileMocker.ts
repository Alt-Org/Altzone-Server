import {CommonMocker, GetWrongFieldDTOptions} from "./commonMocker";
import {ProfileDto} from "../../profile/dto/profile.dto";
import {ModelName} from "../../common/enum/modelName.enum";

type ProfileWithPassword = ProfileDto&{password: string};
export class ProfileMocker{
    public readonly usernames: string[] = [
        'shaquille.oatmeal', 'hanging_with_my_gnomies', 'hoosier-daddy',
        'fast_and_the_curious', 'google_was_my_idea', 'casanova',
        'HairyPoppins', 'whos_ur_buddha', 'me_for_president',
        'tinfoilhat', 'oprahwindfury', 'anonymouse',
        'HeartTicker', 'YESIMFUNNY', 'pluralizes_everythings',
        'laugh_till_u_pee', 'unfriendme', 'Babushka',
    ];
    public profiles: Partial<ProfileWithPassword>[] = [];
    private nameIndex: number = 0;
    private collisionIndex: number = 0;
    private commonMocker = new CommonMocker();

    public getValid(){
        const username = this.getUsername();
        const password = this.commonMocker.getRandString(['my_password', 'psw', '1234', 'superLongPassword']);

        const newValidObj: Partial<ProfileWithPassword> = {username, password};
        this.profiles.push(newValidObj);

        return newValidObj;
    }

    public getNotUnique(existingObj: object): object[]{
        const resp = this.commonMocker.generateNotUniqueFieldsResponse(['username']);
        return [existingObj, resp];
    }

    public getWithoutFields(fieldsToEscape: string[]) {
        const validObj = this.getValid() as ProfileDto;
        return this.commonMocker.removeObjectFields(validObj, fieldsToEscape);
    }
    public getWrongDT(fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): unknown[] {
        const validObj = this.getValid();
        const resp = this.commonMocker.generateWrongDataTypesResponse(validObj, fieldsToBeWrong);
        const req = this.commonMocker.generateObjWithWrongDT(validObj, fieldsToBeWrong, options);
        return [req, resp];
    }

    public getObjMeta(){
        return this.commonMocker.getMetadataForObject('Profile', ModelName.PROFILE);
    }
    public getArrMeta(count: number){
        return this.commonMocker.getMetadataForArray('Profile', ModelName.PROFILE, count);
    }

    private getUsername(){
        if(this.nameIndex >= this.usernames.length){
            this.nameIndex = 0;
            this.collisionIndex++;
        }

        const result = this.usernames[this.nameIndex] + this.collisionIndex;
        this.nameIndex++;
        return result;
    }
}