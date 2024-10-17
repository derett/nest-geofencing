// ./src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { people } from './users';
import * as Pusher from 'pusher';

@Injectable()
export class UsersService {
  getAllUsers() {
    return people.map((person) => ({
      name: person.name,
      position: person.position,
    }));
  }

  intializePusher() {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });

    return pusher;
  }

  postLocation(user) {
    const { lat, lng } = user.position;

    people.forEach((person, index) => {
      if (person.position.lat === user.position.lat) {
        people[index] = { ...person, position: { lat, lng } };
        return this.intializePusher().trigger('map-geofencing', 'location', {
          person: people[index],
          people,
        });
      }
    });
  }
}
