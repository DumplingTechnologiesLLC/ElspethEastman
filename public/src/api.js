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
}

const apiInstance = new API();

export default apiInstance;
