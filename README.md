> This project is designed for the ARK: Survival Evolved community. Friendly Fibercraft, established in 2021, is a network of servers offering the best in-game experience. The most important project features are listed below.

# Major Features

## Website (TypeScript, Next.js)

- A web store built with [tebex.io](https://www.tebex.io/) to handle payments
- A section showcasing top customers and recent payments
- A server list displaying player counts and featuring a join button.
- A management panel for admins to control the website and servers.
- A management panel with a permission system for each section.
- A user interface built with [shadcn](https://ui.shadcn.com/) and [Aceternity](https://ui.aceternity.com/)
- A feature to modify in-game plugin configurations by editing local system files.
- An advanced search system for admins, connecting four database tables.
- An authorization built with [next-auth](https://next-auth.js.org/) and API system built using [tRPC](https://trpc.io/)
- Comprehensive logs for every management action.
- The ability to send and receive commands to selected servers in real time using RCON.
- server control page to start, stop, or restart a server.

## In-game Plugin "Tribe Score" (C++)

The plugin was made in collaboration with another developer

- A custom plugin (Dynamic Link Library) designed to track and rank the best teams on the server
- The plugin awards points to teams that destroy other teams' structures in real time, displaying in-game visuals and calculating points based on structure type
- Developed using the [ARK: Server API](https://gameservershub.com/forums/resources/ark-server-api.12/)
- Optimized to handle hundreds of queries per second, ensuring fair and accurate points calculation
- Points are displayed on the Discord server and the website
- Option to disable in-game visual points display

## Discord Bot (TypeScript)

The bot was built using the module [discord.js](https://discord.js.org/)

- A testimonials section where players can submit their opinions on the network, which, once approved by admins, will be displayed on the website's landing page
- A widget to link in-game accounts with Discord accounts
- A widget allowing players to kick themselves from the in-game server (resolving an annoying game bug)
- An API that facilitates seamless communication between the Discord server and the website.
- In-game perks for users who boost the server
- Tribe Scoreboard showcasing the top 10 teams, updated every hour with highlights and progress since the last update.
