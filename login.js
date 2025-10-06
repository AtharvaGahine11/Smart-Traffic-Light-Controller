// ==================== IMPORTS ====================
import { auth } from "./firebase.js"; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 

// ==================== ELEMENTS ====================
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// ==================== EVENT LISTENER ====================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = ""; // Clear previous errors

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Firebase Authentication Sign-in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("User logged in:", user.uid);
        
        // Successful login: Redirect to the main traffic controller page
        window.location.href = "main.html"; // <-- CHANGED FROM index.html to main.html

    } catch (error) {
        console.error("Login failed:", error.code, error.message);
        
        let errorMessage = "Login failed. Please check your credentials.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
             errorMessage = "Invalid Email or Password.";
        }
        loginError.textContent = errorMessage;
    }
});
