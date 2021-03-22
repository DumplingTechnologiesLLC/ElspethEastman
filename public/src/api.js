import ENDPOINTS from './endpoints';

class API {
  constructor() {
    this.endpoints = ENDPOINTS;
  }

  /* eslint-disable class-methods-use-this */
  async retrieveProjects() {
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
    //   return null;
    // }
    // return response.json();
  }

  /* eslint-disable class-methods-use-this */
  async retrievePaginatedProjects(page) {
    return null;
    // return [
    //   {
    //     title: 'I Survive Suite 776?',
    //     src: 'z-PnMBmKcG4',
    //   },
    //   {
    //     title: 'HONK - Untitled Goose Game: Part 1',
    //     src: '__58UlVn2kU',
    //   },
    //   {
    //     title: 'A Fungus Among Us',
    //     src: 'joRIUgfFwdE',
    //   },
    //   {
    //     title: 'Elspeth Plays Fall Guys: BEST CLIPS!',
    //     src: 'Xvlq_dy74GU',
    //   },
    // ];
    // const response = await fetch(`${this.endpoints.projects.list}?page=${page}`);
    // if (!response.ok) {
    //   return null;
    // }
    // return response.json();
  }

  async submitContactMe(data) {
    try {
      const response = await fetch(this.endpoints.contactMe, {
        method: 'POST',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json();
    } catch (error) {
      return {
        ok: false,
      };
    }
  }

  async retrieveFooterData() {
    return {
      ok: true,
      stats: [
        {
          id: 1,
          value: '3457 cups',
          label: 'of coffee',
          percent: 28,
        },
        {
          id: 2,
          value: '4257 clips',
          label: 'recorded',
          percent: 50,
        },
        {
          id: 3,
          value: '3744 hours',
          label: 'streaming',
          percent: 66,
        },
        {
          id: 4,
          value: '467 clips',
          label: 'of bloopers',
          percent: 33,
        },
      ],
      affiliations: [
        'Game Audio Network Guild (G.A.N.G.) Professional',
        'Independent Game Developers Association',
        '(IGDA) Core Member',
      ],
    };
    // TODO: Wire up
  }

  async retrieveExperience() {
    try {
      const response = await fetch(
        `${this.endpoints.experience.list}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }
}

const apiInstance = new API();

export default apiInstance;
