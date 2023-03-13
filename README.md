# Kodimon

![kodimon-promo](https://user-images.githubusercontent.com/73470112/182820288-9b0f8544-683e-4e52-8f3a-06643bb291aa.gif)


_Fullstack challange to create a Pokemon battle game._
> Pokemon provided by [PokeAPI](https://pokeapi.co/)

## Run project

### Online

> **Check out [live Kodimon](http://kodimon.cacan.dev/)**

### Local

<details>
  <summary>How to start project locally</summary> 
  
- Clone repository
- Install project with
  ```sh
  npm install
  ```
- Start development mode with
  ```sh
  npm run dev
  ```
- Build and start production with
  ```sh
  npm run build
  npm run start
  ```

</details>

## Frontend challange

- [x] Create two screens
- [x] Fetch and display two random Pokemons
- [x] Display stats data
- [x] Display all actions in Logs
- [x] Update HP bar
- [x] Display popup on end-game
  - [ ] Option to start newgame with Pokemon who won
- [x] Styling and animating UI

## Backend challange

- [x] Fetching data and providing it to frontend
- [x] Calculating all battle logic
- [ ] Login and register users
- [ ] Store battle histories

## State management

- Serverside state
  - State in initialized with user assigned id, per game, when user starts game
  - Game state is written and read in Map object only
- Local state
  - React Query fetches data from backend (tRPC)
  - Using Jotai to store&update local state where/if prop drilling is needed

## Game logic

- Faster pokemon attacks first
- Pokemon has 20% chance to miss attack
- Damage pokemon do is half-attack lowered by another's pokemon defense as percentage
- Caveat solutions: If pokemon has defense 100+, defense is halved but opponent's miss-chance is doubled

# Tech Stack

> ### Create T3 App
>
> This app is bootstrapped with [T3-Stack](https://create.t3.gg/).

## Tools / Dependencies

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [React Query](https://react-query-v3.tanstack.com/)
- [Axios](https://axios-http.com/)
- [Jotai](https://jotai.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-spring](https://react-spring.dev/)
- [react-modal](https://github.com/reactjs/react-modal)
