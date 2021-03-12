import ENDPOINTS from './endpoints';

class API {
  constructor() {
    this.endpoints = ENDPOINTS;
  }

  /* eslint-disable class-methods-use-this */
  async retrieveProjects(page) {
    return [
      {
        title: 'I Survive Suite 776?',
        src: 'z-PnMBmKcG4',
      },
      {
        title: 'HONK - Untitled Goose Game: Part 1',
        src: '__58UlVn2kU',
      },
      {
        title: 'A Fungus Among Us',
        src: 'joRIUgfFwdE',
      },
      {
        title: 'Elspeth Plays Fall Guys: BEST CLIPS!',
        src: 'Xvlq_dy74GU',
      },
    ];
    // const response = await fetch(`${this.endpoints.projects.list}?page=${page}`);
    // if (!response.ok) {
    //   // TODO: Toast an error message
    //   return [];
    // }
    // return response.json();
  }

  async retrieveExperience() {
    return {
      'Voice Credits': [
        { year: '2018', credit: 'Love Is Dead – Wanderer, Armor Games' },
        { year: '2018', credit: 'Bunker Punks – Kassidee, Cleopatra Rex, Ninja Robot Dinosaur' },
        { year: '2018', credit: 'Timespinner – Lunais, Lunar Ray Games' },
        { year: '2017', credit: 'Battle Chef Brigade – Kirin, Lily, Trinket Studios' },
        { year: '2017', credit: 'Tooth and Tail – The Quartermaster, Pocketwatch Games' },
        { year: '2017', credit: 'Punch Planet – Cid, Sector-K Games' },
        { year: '2017', credit: 'Relic Hunters – Pinkyy, Rogue Snail' },
        { year: '2017', credit: 'Ragtags (Animation) – Bea, Storyhive' },
        { year: '2017', credit: 'Industries of Titan (trailer) – Council Scout, Brace Yourself Games' },
        { year: '2016', credit: 'Darkest Dungeon – The Hag, Red Hook Studios' },
        { year: '2015', credit: 'Dragon Trainer Tristana – League of Legends, Riot Games' },
        { year: '2015', credit: 'Tristana Reworked – League of Legends, Riot Games' },
        { year: '2015', credit: 'Xian Mei – Dead Island: Epidemic, Deep Silver' },
        { year: '2015', credit: 'Engineer – Habitat: A Thousand Generations in Orbit, Versus Evil' },
        { year: '2015', credit: 'Matkina – Torment: Tides of Numenera, inXile Entertainment' },
        { year: '2015', credit: 'Baxter – Emerald, krangGAMES' },
        { year: '2014', credit: 'Female VO – Dungeonmans, Adventurepro Games' },
        { year: '2014', credit: 'Commander – Battle Group 2, Bane Games' },
        { year: '2014', credit: 'Thief/Rogue/Dancer/Assassin – Lionheart Tactics, Emerald City Games' },
        { year: '2014', credit: 'Cadence – Crypt of the NecroDancer, Brace Yourself Games' },
        { year: '', credit: '(IGF Finalist – Excellence in Audio/Design)' },
        { year: '2014', credit: 'Additional Sadira/Orchid vocals – Killer Instinct, Microsoft' },
        { year: '2014', credit: 'Captain/Gunner/Engineer – Guns of Icarus Online, Muse Games' },
        { year: '2013', credit: 'Allie the Alligator emotes – Where’s My Water, Disney Mobile' },
        { year: '2013', credit: 'Narrator/Ship’s Robot – The Traveler, Game Loop' },
        { year: '2013', credit: 'Wood Witch – Pact, Lorestrome Productions' },
        { year: '2013', credit: 'Demon girl – Shadow Tag, Elvidian Productions' },
      ],
      'Music - Games': [
        { year: '2015', credit: 'krangGAMES – i saw her standing there' },
        { year: '2014', credit: ' krangGAMES – i saw her across the world' },
        { year: '', credit: 'Canadian Videogame Best Social Game Winner' },
        { year: 'TBA', credit: 'krangGAMES – Wholesome Family Dinnertime' },
        { year: 'TBA', credit: 'Game Loop – The Traveler' },
        { year: '2013', credit: 'Adventure Works – Huck Finn’s River Run' },
        { year: '2012', credit: 'Adventure Works – Trip Harrison: Origins' },
        { year: '2012', credit: 'Adventure Works – Treasure Island Shootout' },
      ],
      'Music - Miscellaneous': [
        { year: '2014', credit: 'album – i saw her across the world' },
        { year: '2013', credit: 'album – Return of the Elspeth!' },
        { year: '2012', credit: 'album – Elspeth! The Musical' },
        { year: '', credit: 'Sleepy Ninja Toast – Powerpuff Girls Main Theme remix' },
        { year: '', credit: 'Podcast intro – I Do Geek' },
        { year: '', credit: 'Sleepy Ninja Toast – Halloween Costumes' },
        { year: '', credit: 'Intro, Background themes – Rated E With Elspeth' },
      ],
    };
  }
}

const apiInstance = new API();

export default apiInstance;
