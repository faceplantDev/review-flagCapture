export const SHARED_CONSTANTS = {
  MARKER_PARAMS: {
    type: 6,
    scale: 5,
    rotation: {x: 90, y: 0, z: 0}
  },
  BLIP_PARAMS: {
    type: 2,
    scale: 0.8,
    name: "team flag"  
  },
  TEAMS_COLORS: {
    red: [255, 0, 0, 50] as [number, number, number, number],
    blue: [0, 0, 255, 50] as [number, number, number, number],
    free: [0, 0, 0, 50] as [number, number, number, number],
  },
  TEAMS_INT_COLORS: {
    red: 1,
    blue: 3,
    free: 4,
  },
  LOBBY_POSITION: {
    x: 0,
    y: 0,
    z: 0
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
  PLAYER_CAPTURE_PROGRESS_WEIGHT: 2,
  CLEARED_ZONE_PROGRESS_RESTORE: 5,
  WEAPONS: {
    appPistol: 0x3656C8C1,
    pdw: 0x0A3D4D34,
    musket: 0xA89CB99E,
    carbine: 0xFAD1F1C9,
    maschineGun: 0xDBBD7280,
    heavySniper: 0xA914799,
  },
  FLAG_NAMES: ['A', 'B', 'C'],
  MAPS: [
    {
        name: 'Аэропорт',
        zone: [
            {
                x: 0,
                y: 0,
                z: 0,
            }
        ],
        spawns: {
            red: [
              {
                x: 0,
                y: 0,
                z: 0,
              },
              {
                x: 0,
                y: 0,
                z: 0,
              },
              {
                x: 0,
                y: 0,
                z: 0,
              },
              {
                x: 0,
                y: 0,
                z: 0,
              },
            ],
            blue: [
              {
                x: 0,
                y: 0,
                z: 0,
              },
              {
                x: 0,
                y: 0,
                z: 0,
              },
              {
                x: 0,
                y: 0,
                z: 0,
              },
            ],
          },
        flags: [
            {
                x: 0,
                y: 0,
                z: 0,
            },
            {
                x: 0,
                y: 0,
                z: 0,
            },
            {
                x: 0,
                y: 0,
                z: 0,
            },
            {
                x: 0,
                y: 0,
                z: 0,
            }
        ]
    }
  ]
};
