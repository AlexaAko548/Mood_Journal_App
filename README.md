# IT5103N Group 2 - Activity Documentation

## Week 1

Progress:
   - made a mood journal app
   - experimented with pictures/gif


## Week 2

Progress:
   - changed the theme to dark
   - login page
   - added drawer
   - made profile page with logout button
     
<p float="left">
  <img src="assets/images/screenshots/week2_1.jpeg" alt="Home Screen" width="200"/>
  <img src="assets/images/screenshots/week2_2.jpeg" alt="Add New Entry Screen" width="200"/>
  <img src="assets/images/screenshots/week2_3.jpeg" alt="Drawer" width="200"/>
  <img src="assets/images/screenshots/week2_4.jpeg" alt="Profile Screen" width="200"/>
</p>


## Week 3 - Activity (Advanced Navigation)

I implemented natural gestures — the drawer opens with a swipe, touchables/pressables use hitSlop (and Android ripple) for comfortable tapping, and icons/buttons open modals or navigate between screens. For transitions I used react-native-reanimated: FadeIn/FadeOut for error messages and the preview, layout spring animations for list changes, and a small shake effect to highlight invalid inputs. For persistence I used AsyncStorage with a hydration guard so data loads before any saves, debounced writes to avoid race conditions, and explicit cache clears on actions like form submit or removals.

Progress:
   - implemented gestures and navigation persistence
   - added transitions


## Week 4 - Activity 1 (State Management)

I use useReducer for playlist/song state (so actions and undo/redo stay explicit) and useState for small UI bits like modal inputs; reducers are kept pure and immutable. Persistence is handled with AsyncStorage plus a hydration guard so the app loads data first and only writes after initial load to avoid clobbering. For testing I write unit tests for reducers with Jest to confirm each action yields the right state, then use React Native Testing Library for integration tests that exercise UI flows and AsyncStorage behavior. Finally I do quick manual smoke/E2E checks (add/edit/remove items, restart app, test back navigation) to catch real-world edge cases.

Progress:
   - updated playlist page (can add, remove, and edit playlist)
   - added playlist detail (can add and remove songs)
   - added transitions and animations
   - implemented undo/redo

<p float="left">
  <img src="assets/images/screenshots/week4_1.png" alt="Playlist Screen" width="200"/>
  <img src="assets/images/screenshots/week4_2.png" alt="Playlist Detail Screen" width="200"/>
</p>

Progress:
   - updated the adding and editing of playlist
   - updated the adding of songs inside a playlist

<p float="left">
  <img src="assets/images/screenshots/week4_1(updated).png" alt="Playlist Screen" width="200"/>
  <img src="assets/images/screenshots/week4_1.1(updated).png" alt="Playlist Screen" width="200"/>
  <img src="assets/images/screenshots/week4_1.2(updated).png" alt="Playlist Screen" width="200"/>
  <img src="assets/images/screenshots/week4_2(updated).png" alt="Playlist Detail Screen" width="200"/>
  <img src="assets/images/screenshots/week4_2.1(updated).png" alt="Playlist Detail Screen" width="200"/>
</p>


## Week 4 - Activity 2 (Spotify Profile Creation Form)

I validate inputs live as the user types: usernames must be 3–20 characters and can include letters, numbers, and underscores; emails must match a standard email format; and a genre must be selected from the list. For animations I used react-native-reanimated — invalid inputs get a quick shake to draw attention and error messages/preview fade in smoothly. The preview updates instantly as I type and uses a genre-based placeholder image; cached form data is saved to AsyncStorage and cleared on successful submit so the form auto-fills after reload but resets when submission succeeds.

Progress:
   - updated profile page
   - added profile preview

<p float="left">
  <img src="assets/images/screenshots/week4_act2(1).png" alt="Playlist Screen" width="200"/>
  <img src="assets/images/screenshots/week4_act2(2).png" alt="Playlist Screen" width="200"/>
</p>


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
