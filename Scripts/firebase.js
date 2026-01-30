import { initializeApp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";




const firebaseConfig = {
    apiKey: "AIzaSyAt0NNkaWl_a3aNLuIboR1SyokLhn7YBi4",
    authDomain: "aura-home-database.firebaseapp.com",
    projectId: "aura-home-database",
    storageBucket: "aura-home-database.firebasestorage.app",
    messagingSenderId: "630414914244",
    appId: "1:630414914244:web:e8519a2537be0ce86e8f91"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
