import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { ClanController } from '../../../clan/clan.controller';
import { ClanService } from '../../../clan/clan.service';
import { ProfileService } from '../../../profile/profile.service';
import ProfileController from '../../../profile/profile.controller';
import { RequestHelperService } from '../../../requestHelper/requestHelper.service';
import { SwaggerDocumentBuilder } from '../../../common/swagger/swaggerDocumentBuilder';

const publicFields = [
  '_id',
  'name',
  'tag',
  'clanLogo',
  'labels',
  'furnitureTotalValue',
  'battlePoints',
  'playerCount',
  'goal',
  'phrase',
  'language',
  'isOpen',
].sort();

const clans = [
  createClan('1', 'Beta', 5),
  createClan('2', 'Alpha', 10),
  createClan('3', 'Gamma', 2),
];

describe('GET /clan endpoint', () => {
  let app: INestApplication;
  const readClanList = jest.fn(async (options) => {
    let result = [...clans];
    const nameCondition = options.filter?.$and?.find((condition) =>
      Object.prototype.hasOwnProperty.call(condition, 'name'),
    )?.name;

    if (nameCondition?.$eq)
      result = result.filter((clan) => clan.name === nameCondition.$eq);

    const [sortField, sortDirection] = Object.entries(
      options.sort || {},
    )[0] || ['_id', -1];
    result.sort((left, right) => {
      const comparison = left[sortField] > right[sortField] ? 1 : -1;
      return comparison * Number(sortDirection);
    });

    return [result.slice(options.skip, options.skip + options.limit), null];
  });
  const readOneById = jest.fn(async () => [clans[0], null]);
  const getLoggedUserInfo = jest.fn(async () => [
    {
      _id: 'profile-1',
      username: 'player',
      hasSecurityQuestion: false,
      Player: {
        _id: 'player-1',
        name: 'Player',
        points: 0,
        battlePoints: 0,
        claimableRewards: [],
        backpackCapacity: 10,
        uniqueIdentifier: 'player-1',
        parentalAuth: null,
        profile_id: 'profile-1',
        clan_id: clans[0]._id,
        Clan: clans[0],
        CustomCharacter: [],
      },
    },
    null,
  ]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ClanController, ProfileController],
      providers: [
        {
          provide: ClanService,
          useValue: { readClanList, readOneById },
        },
        {
          provide: ProfileService,
          useValue: { getLoggedUserInfo },
        },
        {
          provide: RequestHelperService,
          useValue: { count: jest.fn(async () => clans.length) },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    app = module.createNestApplication();
    app.use((req, _res, next) => {
      req.user = { profile_id: 'profile-1', player_id: 'player-1' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    readClanList.mockClear();
    readOneById.mockClear();
    getLoggedUserInfo.mockClear();
  });

  it('returns only the 12 public fields for every clan', async () => {
    const response = await request(app.getHttpServer())
      .get('/clan')
      .expect(200);

    expect(response.body.data.Clan).toHaveLength(3);
    for (const clan of response.body.data.Clan)
      expect(Object.keys(clan).sort()).toEqual(publicFields);
  });

  it('does not expose sensitive or expanded fields through select', async () => {
    const response = await request(app.getHttpServer())
      .get('/clan?select=password,ageRange,roles,Player,Stock,SoulHome')
      .expect(200);

    for (const clan of response.body.data.Clan) {
      expect(clan).not.toHaveProperty('password');
      expect(clan).not.toHaveProperty('ageRange');
      expect(clan).not.toHaveProperty('roles');
      expect(clan).not.toHaveProperty('admin_ids');
      expect(clan).not.toHaveProperty('Player');
      expect(clan).not.toHaveProperty('Stock');
      expect(clan).not.toHaveProperty('SoulHome');
    }
  });

  it('keeps pagination, search, and sorting functional', async () => {
    const sorted = await request(app.getHttpServer())
      .get('/clan?sort=playerCount&desc=true&limit=2&page=1')
      .expect(200);

    expect(sorted.body.data.Clan.map((clan) => clan.playerCount)).toEqual([
      10, 5,
    ]);
    expect(sorted.body.paginationData).toMatchObject({
      currentPage: 1,
      limit: 2,
      offset: 0,
      itemCount: 3,
      pageCount: 2,
    });

    const searched = await request(app.getHttpServer())
      .get('/clan?search=name="Gamma"')
      .expect(200);

    expect(searched.body.data.Clan).toHaveLength(1);
    expect(searched.body.data.Clan[0].name).toBe('Gamma');
  });

  it('continues to return the full clan from GET /clan/:_id', async () => {
    const response = await request(app.getHttpServer())
      .get('/clan/1')
      .expect(200);

    expect(response.body.data.Clan).toMatchObject({
      ageRange: 'Adults',
      password: 'secret',
      admin_ids: ['admin-1'],
      roles: [{ name: 'Leader' }],
    });
  });

  it('continues to return the full clan from GET /profile/info', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile/info')
      .expect(200);

    expect(response.body.data.Profile.Player.Clan).toMatchObject({
      ageRange: 'Adults',
      admin_ids: ['admin-1'],
      roles: [{ name: 'Leader' }],
    });
  });

  it('documents ClanListDto as the GET /clan response model', () => {
    const document = SwaggerModule.createDocument(
      app,
      new SwaggerDocumentBuilder().setTitle('test').setVersion('1').build(),
    );
    const responseSchema =
      document.paths['/clan'].get.responses['200']['content'][
        'application/json'
      ]['schema'];

    expect(responseSchema.properties.data.properties.Clan.items.$ref).toBe(
      '#/components/schemas/ClanListDto',
    );
  });
});

function createClan(_id: string, name: string, playerCount: number) {
  return {
    _id,
    name,
    tag: name.slice(0, 3),
    clanLogo: { logoType: 'Heart', pieceColors: ['#FFFFFF', '#000000'] },
    labels: ['ANIMEFANIT'],
    furnitureTotalValue: 1500,
    battlePoints: 320,
    playerCount,
    goal: 'Competitive',
    phrase: 'Victory through unity',
    language: 'English',
    isOpen: true,
    ageRange: 'Adults',
    password: 'secret',
    admin_ids: ['admin-1'],
    roles: [{ name: 'Leader' }],
    Player: [{ _id: 'player-1' }],
    Stock: { _id: 'stock-1' },
    SoulHome: { _id: 'soulhome-1' },
  };
}
