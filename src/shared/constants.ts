export const SHARED_CONSTANTS = {
  MARKER_PARAMS: {
    type: 6,
    scale: 5,
    rotation: {x: 90, y: 0, z: 0}
  },
  BLIP_PARAMS: {
    type: 103,
    scale: 0.8,
    name: "team flag"  
  },
  TEAMS_COLORS: {
    red: [255, 0, 0, 50] as [number, number, number, number],
    blue: [0, 0, 255, 50] as [number, number, number, number],
    free: [222, 222, 222, 50] as [number, number, number, number],
  },
  TEAMS_INT_COLORS: {
    red: 1,
    blue: 3,
    free: 4,
  },
  LOBBY_POSITION: {
    x: 25,
    y: 19,
    z: 71
  },
  TIMER: {
    lobbyStart: 30,
    capture: 300,
    additional: [15, 60],
  },
  PLAYERS_TO_START_PER_TEAM: 1,
  GODMODE_TIMEOUT: 5000,
  MESSAGE_TIMEOUT: 3000,
  TIMER_PHASES: ['lobbyStart', 'capture', 'additional'],
  CAPTURE_INTERVAL: 1000,
  CAPTURE_MAX_PROGRESS: 100,
  CAPTURE_MIN_PROGRESS: 0,
  PLAYER_CAPTURE_PROGRESS_COEF: 1.25,
  PLAYER_CAPTURE_PROGRESS_WEIGHT: 3,
  CLEARED_ZONE_PROGRESS_RESTORE: 5,
  WEAPONS: {
    pdw: 0x0A3D4D34,
    musket: 0xA89CB99E,
    carbine: 0xFAD1F1C9,
    maschineGun: 0xDBBD7280,
    heavySniper: 0xA914799,
  },
  FLAG_NAMES: ['Alpha', 'Beta', 'Charlie'],
  MAPS: [
    {
        name: 'Аэропорт',
        time: {
            h: 0,
            m: 0,
            s: 0
        },
        weather: 'THUNDER',
        zone: [
            {
                x: -2587,
                y: 3285,
                z: 0,
            },
            {
                x: -2383,
                y: 3410,
                z: 0
            },
            {
                x: -2300,
                y: 3353,
                z: 0
            },
            {
                x: -2390,
                y: 3185,
                z: 0
            },
        ],
        spawns: {
            red: [
              {
                x: -2473,
                y: 3252,
                z: 33,
              },
              {
                x: -2478,
                y: 3259,
                z: 33,
              }
            ],
            blue: [
              {
                x: -2347,
                y: 3348,
                z: 33,
              },
              {
                x: -2345,
                y: 3348,
                z: 33,
              }
            ],
          },
        flags: [
            {
                x: -2436,
                y: 3346,
                z: 32,
            },
            {
                x: -2377,
                y: 3267,
                z: 32,
            },
            {
                x: -2418,
                y: 3288,
                z: 32,
            }
        ]
    }
  ]
};
