const USER_MARKER =
  'http://res.cloudinary.com/yemiwebby-com-ng/image/upload/v1526555652/user_my7yzc.png';
const OFFLINE_MARKER =
  'http://res.cloudinary.com/yemiwebby-com-ng/image/upload/v1526555651/offline_elrlvi.png';
const ONLINE_MARKER =
  'http://res.cloudinary.com/yemiwebby-com-ng/image/upload/v1526555651/online_bpf5ch.png';
const RADIUS = 2000;

const iconOptions = {
  iconSize: [20, 27],
  iconAnchor: [10, 27],
};

new Vue({
  el: '#app',
  data: {
    users: [],
    referencePoint: { lat: 6.51, lng: 3.34 },
    zoomLevel: 13,
    markers: {},
    selectedUser: { name: '' },
  },
  created() {
    let pusher = new Pusher('PUSHER_API_KEY', {
      cluster: 'PUSHER_CLUSTER',
      encrypted: true,
    });

    pusher.subscribe('map-geofencing').bind('location', (data) => {
      this.initializeUsers(data.person.position, data.people);
      this.selectedUser = data.person;
    });
  },
  mounted() {
    this.setMap();
    this.getUser();
    this.setCenter(this.referencePoint, false);
  },
  methods: {
    setMap() {
      this.map = L.map('map').setView(this.referencePoint, this.zoomLevel);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);
    },

    setCenter(position, setCenterMarker = true) {
      this.map.setView(position);
      this.addCircle(position, setCenterMarker);
    },

    getUser() {
      axios.get('/users').then((response) => {
        this.users = this.getRandomUsers(response.data, 6);
      });
    },

    getRandomUsers(people, number) {
      const selected = [];
      for (var i = 0; i < number; i++) {
        const index = Math.floor(Math.random() * people.length);
        if (selected.includes(index)) continue;
        selected.push(index);
      }
      const selectedUsers = selected.map((index) => {
        const users = ({ name, position } = people[index]);
        return users;
      });
      return selectedUsers;
    },

    getUserLocation(position) {
      const user = { position };
      axios.post('/users', user).then((response) => {
        console.log(response);
      });
    },

    initializeUsers(position, people) {
      this.referencePoint = position;
      this.setCenter(this.referencePoint);

      for (var i = 0; i < people.length; i++) {
        if (this.withinRegion(this.referencePoint, people[i], RADIUS)) {
          this.addMarker(people[i], ONLINE_MARKER);
        } else {
          this.addMarker(people[i], OFFLINE_MARKER);
        }
      }
    },

    addMarker(props, iconUrl) {
      const existing = this.markers[props.name];

      if (existing) {
        existing.setIcon(L.icon({ iconUrl }));
      } else {
        const marker = new L.Marker(props.position, {
          icon: L.icon({
            ...iconOptions,
            iconUrl,
          }),
        })
          .bindTooltip(props.name)
          .addTo(this.map);

        this.markers[props.name] = marker;
      }
    },

    addCircle(position, setCenterMarker = true) {
      if (this.circle) {
        this.circle.setLatLng(position);
        this.circle.redraw();
      } else {
        this.circle = new L.Circle(position, {
          radius: RADIUS,
          strokeColor: '#00ff00',
          fillColor: '#484040bf',
        }).addTo(this.map);
      }

      if (setCenterMarker) {
        if (this.centerMarker) {
          this.centerMarker.setLatLng(position);
        } else {
          this.centerMarker = new L.Marker(position, {
            zIndexOffset: 1,
            icon: L.icon({
              ...iconOptions,
              iconUrl: USER_MARKER,
            }),
          }).addTo(this.map);
        }
      }
    },

    withinRegion(position, user, radius) {
      const to = new L.LatLng(user.position.lat, user.position.lng);
      const from = new L.LatLng(position.lat, position.lng);
      const distance = from.distanceTo(to);
      return distance <= radius;
    },

    loadMoreUsers() {
      this.getUser();
    },
  },
});
