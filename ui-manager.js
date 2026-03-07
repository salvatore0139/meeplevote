import { auth, db } from "./firebase.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ADMIN_EMAIL = "salvatoredidato01@gmail.com";

// 1. Iniezione dinamica della Navbar e dei CSS
function injectNavbar() {
    const navHTML = `
    <nav class="universal-nav">
        <div class="logo">🎲 Salvatore Games</div>
        <div class="nav-links">
            <a href="index.html">Sondaggio</a>
            <a href="catalogo.html">Catalogo</a>
            <div id="admin-slot"></div>
            <div id="user-zone" class="user-menu">
                <button id="btn-login-trigger" class="btn-login">Accedi</button>
                <div id="user-profile" style="display:none;" class="profile-container" onclick="document.getElementById('user-dropdown').classList.toggle('show')">
                    <img id="user-avatar" src="" alt="Avatar">
                    <div id="user-dropdown" class="dropdown-content">
                        <span id="display-username"></span>
                        <hr>
                        <a href="#" id="change-avatar-btn">Cambia Avatar</a>
                        <a href="#" id="btn-logout-universal">Esci</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>`;

    const style = document.createElement('style');
    style.textContent = `
        .universal-nav { background: #2c3e50; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; color: white; position: sticky; top: 0; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .nav-links { display: flex; align-items: center; gap: 20px; }
        .nav-links a { color: white; text-decoration: none; font-weight: 500; font-size: 0.95em; }
        .user-menu { position: relative; }
        .profile-container { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        #user-avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #27ae60; object-fit: cover; }
        .dropdown-content { display: none; position: absolute; right: 0; top: 48px; background: white; min-width: 160px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; }
        .dropdown-content.show { display: block; }
        .dropdown-content a, .dropdown-content span { color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 0.85em; }
        .dropdown-content a:hover { background: #f1f1f1; }
        .btn-login { background: #27ae60; color: white; border: none; padding: 8px 18px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        #admin-slot a { color: #e67e22; border: 1px solid #e67e22; padding: 4px 10px; border-radius: 4px; font-size: 0.8em; }
    `;
    
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// 2. Gestione Logica Utente
function initUserLogic() {
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.getElementById('btn-login-trigger');
        const profileZone = document.getElementById('user-profile');
        const adminSlot = document.getElementById('admin-slot');

        if (user) {
            loginBtn.style.display = 'none';
            profileZone.style.display = 'flex';

            // Listener real-time per dati utente (username e avatar)
            onSnapshot(doc(db, "utenti", user.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('user-avatar').src = data.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    document.getElementById('display-username').textContent = data.username || "Giocatore";
                }
            });

            // Se sei l'admin, aggiungi il link
            if (user.email === ADMIN_EMAIL) {
                adminSlot.innerHTML = `<a href="admin.html">DASHBOARD ADMIN</a>`;
            }
        } else {
            loginBtn.style.display = 'block';
            profileZone.style.display = 'none';
            adminSlot.innerHTML = '';
        }
    });

    // Azioni pulsanti
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'btn-logout-universal') {
            await signOut(auth);
            location.href = 'index.html';
        }
        if (e.target.id === 'btn-login-trigger') {
            // Qui apriresti il tuo modal di login o vai alla pagina login
            alert("Usa il tasto 'Vota' per loggarti"); 
        }
        if (e.target.id === 'change-avatar-btn') {
            const url = prompt("Incolla l'URL della nuova immagine:");
            if (url && auth.currentUser) {
                await updateDoc(doc(db, "utenti", auth.currentUser.uid), { photoURL: url });
            }
        }
    });
}

// Avvio automatico
injectNavbar();
initUserLogic();
