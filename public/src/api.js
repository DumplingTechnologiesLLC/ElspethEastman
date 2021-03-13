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

  async submitContactMe(data) {
    const response = await fetch(this.endpoints.contactMe, {
      method: 'POST',
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json();
  }

  async retrieveExperience() {
    return {
      'Voice Credits': [
        { id: 0, year: '2018', credit: 'Love Is Dead – Wanderer, Armor Games' },
        { id: 1, year: '2018', credit: 'Bunker Punks – Kassidee, Cleopatra Rex, Ninja Robot Dinosaur' },
        { id: 2, year: '2018', credit: 'Timespinner – Lunais, Lunar Ray Games' },
        { id: 3, year: '2017', credit: 'Battle Chef Brigade – Kirin, Lily, Trinket Studios' },
        { id: 4, year: '2017', credit: 'Tooth and Tail – The Quartermaster, Pocketwatch Games' },
        { id: 5, year: '2017', credit: 'Punch Planet – Cid, Sector-K Games' },
        { id: 6, year: '2017', credit: 'Relic Hunters – Pinkyy, Rogue Snail' },
        { id: 7, year: '2017', credit: 'Ragtags (Animation) – Bea, Storyhive' },
        { id: 8, year: '2017', credit: 'Industries of Titan (trailer) – Council Scout, Brace Yourself Games' },
        { id: 9, year: '2016', credit: 'Darkest Dungeon – The Hag, Red Hook Studios' },
        { id: 10, year: '2015', credit: 'Dragon Trainer Tristana – League of Legends, Riot Games' },
        { id: 11, year: '2015', credit: 'Tristana Reworked – League of Legends, Riot Games' },
        { id: 12, year: '2015', credit: 'Xian Mei – Dead Island: Epidemic, Deep Silver' },
        { id: 13, year: '2015', credit: 'Engineer – Habitat: A Thousand Generations in Orbit, Versus Evil' },
        { id: 14, year: '2015', credit: 'Matkina – Torment: Tides of Numenera, inXile Entertainment' },
        { id: 15, year: '2015', credit: 'Baxter – Emerald, krangGAMES' },
        { id: 16, year: '2014', credit: 'Female VO – Dungeonmans, Adventurepro Games' },
        { id: 17, year: '2014', credit: 'Commander – Battle Group 2, Bane Games' },
        { id: 18, year: '2014', credit: 'Thief/Rogue/Dancer/Assassin – Lionheart Tactics, Emerald City Games' },
        { id: 19, year: '2014', credit: 'Cadence – Crypt of the NecroDancer, Brace Yourself Games' },
        { id: 20, year: '', credit: '(IGF Finalist – Excellence in Audio/Design)' },
        { id: 21, year: '2014', credit: 'Additional Sadira/Orchid vocals – Killer Instinct, Microsoft' },
        { id: 22, year: '2014', credit: 'Captain/Gunner/Engineer – Guns of Icarus Online, Muse Games' },
        { id: 23, year: '2013', credit: 'Allie the Alligator emotes – Where’s My Water, Disney Mobile' },
        { id: 24, year: '2013', credit: 'Narrator/Ship’s Robot – The Traveler, Game Loop' },
        { id: 25, year: '2013', credit: 'Wood Witch – Pact, Lorestrome Productions' },
        { id: 26, year: '2013', credit: 'Demon girl – Shadow Tag, Elvidian Productions' },
      ],
      'Music - Games': [
        { id: 27, year: '2015', credit: 'krangGAMES – i saw her standing there' },
        { id: 28, year: '2014', credit: ' krangGAMES – i saw her across the world' },
        { id: 29, year: '', credit: 'Canadian Videogame Best Social Game Winner' },
        { id: 30, year: 'TBA', credit: 'krangGAMES – Wholesome Family Dinnertime' },
        { id: 31, year: 'TBA', credit: 'Game Loop – The Traveler' },
        { id: 32, year: '2013', credit: 'Adventure Works – Huck Finn’s River Run' },
        { id: 33, year: '2012', credit: 'Adventure Works – Trip Harrison: Origins' },
        { id: 34, year: '2012', credit: 'Adventure Works – Treasure Island Shootout' },
      ],
      'Music - Miscellaneous': [
        { id: 35, year: '2014', credit: 'album – i saw her across the world' },
        { id: 36, year: '2013', credit: 'album – Return of the Elspeth!' },
        { id: 37, year: '2012', credit: 'album – Elspeth! The Musical' },
        { id: 38, year: '', credit: 'Sleepy Ninja Toast – Powerpuff Girls Main Theme remix' },
        { id: 39, year: '', credit: 'Podcast intro – I Do Geek' },
        { id: 40, year: '', credit: 'Sleepy Ninja Toast – Halloween Costumes' },
        { id: 41, year: '', credit: 'Intro, Background themes – Rated E With Elspeth' },
      ],
    };
  }
}

const apiInstance = new API();

export default apiInstance;
