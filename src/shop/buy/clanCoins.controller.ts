import {
    Controller,
    Post,
  } from '@nestjs/common';

@Controller('clanCoins')
export class ClanCoinsController {
    public constructor() {}
    
   @Post()
     //@Authorize({ action: Action.create})
     public async create() {
        
       return null; // Implement your logic here
     }
    }