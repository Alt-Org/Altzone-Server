import {Discriminator} from "../enum/discriminator.enum";

export default interface IDiscriminator {
    discriminator?: Discriminator;
    discriminators?: Discriminator[];
}