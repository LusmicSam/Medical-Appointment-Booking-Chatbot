import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBOHjP4Vvd9VjJUwCiVXSgRX46gkf8BSoE",
    authDomain: "ai-projects-d261b.firebaseapp.com",
    projectId: "ai-projects-d261b",
    storageBucket: "ai-projects-d261b.appspot.com",
    messagingSenderId: "715519778537",
    appId: "1:715519778537:web:6eeadc4de803855b725a78",
    measurementId: "G-ZCCQ1NF881",
    databaseURL: "https://ai-projects-d261b-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };