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
