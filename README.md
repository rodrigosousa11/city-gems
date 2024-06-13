# City Gems

City Gems is a mobile application designed to facilitate the exploration and discovery of cultural heritage sites in the cities of Portugal, starting with Porto. This project encompasses both a server and a client application.

## Project Structure

The project is divided into two main parts:
1. **Server**: A backend built with Node.js and Express.js.
2. **Client**: A mobile application built with React Native and Expo.

## Features

### Server

- **Authentication**: User registration, login, token generation, token and role validation, token refreshing and password recovery.
- **User Management**: Add, remove, update, and search for users.
- **POI Management**: Add, remove, update, and search for points of interest (POIs).
- **Reviews Management**: Add, remove, update, and search for reviews.
- **Lists Management**: Add, remove, update, and search for lists of favorite locations.

### Client

- **User Interface**: Intuitive and user-friendly UI for easy navigation and exploration of POIs.
- **Geolocation**: Accurate geolocation services to find and navigate to POIs.
- **Community Participation**: Users can leave reviews and ratings for POIs.
- **Data Management**: Users can create and manage lists of their favorite locations.
- **Suggestions**: Users receive suggestions for nearby POIs based on their location and most visited POIs.
- **Admin Features**: Admin users can manage POIs, users, and reviews.

## Technologies Used

### Server

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- bcrypt for password hashing
- Jest and Postman for testing

### Client

- React Native
- Expo
- Axios for HTTP requests
- Firebase for POI images storage
- Various React Native libraries for enhanced functionality (e.g., maps, image manipulation, secure storage)

## Interfaces

### User View
<div align="center">
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/9dfb920d-47d9-4083-8b1a-0199d3c887b3" alt="inicial" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/82dd3cf9-6fb6-4191-abf9-d43c0b25a7e4" alt="login" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/f02b19fb-84aa-428d-a934-1754f2a0b6a9" alt="signup" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/914b1d3b-1a65-4372-910f-929abd956645" alt="home" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/a062fd43-a156-43c0-ba2b-0ea0263ea0d5" alt="poi" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/b9b549c8-797e-47b1-b6c0-0e40651d4856" alt="map" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/7aeb2b8c-50a1-47c1-ba0e-21fbc3e1e710" alt="lists" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/c29f9c79-264f-49cd-9519-6bbb2626c22d" alt="settings" width="200"/>
</div>

### Admin Features
<div align="center">
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/67c13bc4-101e-47c0-bc4e-5a99e6ff3262" alt="settings" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/171f82e5-09e4-4493-808f-c3e7a32e819d" alt="settings2" width="200"/>
  <img src="https://github.com/rodrigosousa11/city-gems/assets/96240973/24dafef4-b8f1-4fc7-b31e-4b1571b43019" alt="settings3" width="200"/>
</div>




## Future Work

- Expansion to include more cities and POIs.
- App stores deployment.
- Integration with more data sources for richer POI information.
- Translation to multiple languages.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
