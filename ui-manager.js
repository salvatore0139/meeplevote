import { auth, db } from "./firebase.js";
import { doc, onSnapshot, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ADMIN_EMAIL = "salvatoredidato01@gmail.com";

// 1. Iniezione HTML e CSS della Navbar e del Modal
function injectUI() {
    const navHTML = `
    <nav class="universal-nav">
        <div class="logo">🎲 Salvatore Games</div>
        <div class="nav-links">
            <a href="index.html">Catalogo</a>
            <a href="sondaggi.html">Sondaggi</a>
            <div id="admin-slot"></div>
            <div id="user-zone" class="user-menu">
                <button id="btn-login-trigger" class="btn-login">Accedi</button>
                <div id="user-profile" style="display:none;" class="profile-container" onclick="document.getElementById('user-dropdown').classList.toggle('show')">
                    <div class="avatar-wrapper">
                        <img id="user-avatar" src="" alt="Avatar">
                        <div id="status-dot" class="dot"></div>
                    </div>
                    <div id="user-dropdown" class="dropdown-content">
                        <span id="display-username" style="font-weight:bold; color: #2c3e50;"></span>
                        <span id="display-status" style="font-size:0.7em; padding-top:0;"></span>
                        <hr>
                        <a href="#" id="change-username-btn">Cambia Username</a>
                        <a href="#" id="change-avatar-btn">Cambia Avatar</a>
                        <a href="#" id="btn-logout-universal">Esci</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div id="login-modal" class="auth-modal">
        <div class="auth-modal-content">
            <h3 id="auth-title">Accedi</h3>
            <input type="text" id="auth-username" placeholder="Username (es. Mario)" style="display:none;">
            <input type="email" id="auth-email" placeholder="Email">
            <input type="password" id="auth-password" placeholder="Password">
            <button class="btn-login" id="btn-do-auth" style="width:100%; margin-top:10px;">Entra</button>
            <p id="auth-switch" style="font-size:0.8em; cursor:pointer; margin-top:15px; text-align:center; color:#666;">
                Non hai un account? Registrati qui.
            </p>
            <button class="btn-close-modal" onclick="document.getElementById('login-modal').style.display='none'">Annulla</button>
        </div>
    </div>`;

    const style = document.createElement('style');
    style.textContent = `
        .universal-nav { background: #2c3e50; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; color: white; position: sticky; top: 0; z-index: 9999; font-family: 'Segoe UI', sans-serif; }
        .nav-links { display: flex; align-items: center; gap: 20px; }
        .nav-links a { color: white; text-decoration: none; font-weight: 500; font-size: 0.9em; transition: 0.3s; }
        .nav-links a:hover { color: #27ae60; }
        .user-menu { position: relative; }
        .profile-container { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .avatar-wrapper { position: relative; display: flex; }
        #user-avatar { width: 35px; height: 35px; border-radius: 50%; border: 2px solid #27ae60; object-fit: cover; background: #eee; }
        .dot { width: 10px; height: 10px; border-radius: 50%; position: absolute; bottom: 0; right: 0; border: 2px solid #2c3e50; }
        .dot-valid { background: #27ae60; }
        .dot-pending { background: #f1c40f; }
        .dropdown-content { display: none; position: absolute; right: 0; top: 48px; background: white; min-width: 180px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 8px; z-index: 10000; padding: 5px 0; }
        .dropdown-content.show { display: block; }
        .dropdown-content a, .dropdown-content span { color: #333; padding: 10px 16px; text-decoration: none; display: block; font-size: 0.85em; }
        .dropdown-content a:hover { background: #f1f1f1; }
        .btn-login { background: #27ae60; color: white; border: none; padding: 8px 18px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .auth-modal { display: none; position: fixed; z-index: 10001; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.75); }
        .auth-modal-content { background: white; margin: 10% auto; padding: 30px; width: 320px; border-radius: 12px; position: relative; color: #333; font-family: sans-serif; }
        .auth-modal-content input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        #admin-slot a { color: #ffa500; font-weight: bold; font-size: 0.8em; border: 1px solid #ffa500; padding: 4px 10px; border-radius: 4px; text-decoration: none; }
    `;
    
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// 2. Gestione Logica Auth e Firestore
function initLogic() {
    let isLoginMode = true;

    onAuthStateChanged(auth, async (user) => {
        const loginBtn = document.getElementById('btn-login-trigger');
        const profileZone = document.getElementById('user-profile');
        const adminSlot = document.getElementById('admin-slot');

        if (user) {
            loginBtn.style.display = 'none';
            profileZone.style.display = 'flex';
            if (user.email === ADMIN_EMAIL) adminSlot.innerHTML = `<a href="admin.html">🛠 ADMIN</a>`;

            onSnapshot(doc(db, "utenti", user.uid), (snap) => {
                if (snap.exists()) {
                    const d = snap.data();
                    document.getElementById('user-avatar').src = d.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    document.getElementById('display-username').textContent = d.username || "Giocatore";
                    
                    const statusTxt = document.getElementById('display-status');
                    const dot = document.getElementById('status-dot');
                    if(d.validato) {
                        statusTxt.textContent = "✅ Validato";
                        statusTxt.style.color = "#27ae60";
                        dot.className = "dot dot-valid";
                    } else {
                        statusTxt.textContent = "⏳ In attesa";
                        statusTxt.style.color = "#f39c12";
                        dot.className = "dot dot-pending";
                    }
                }
            });
        } else {
            loginBtn.style.display = 'block';
            profileZone.style.display = 'none';
            adminSlot.innerHTML = '';
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.id === 'btn-login-trigger') document.getElementById('login-modal').style.display = 'block';
        
        if (e.target.id === 'auth-switch') {
            isLoginMode = !isLoginMode;
            document.getElementById('auth-title').textContent = isLoginMode ? 'Accedi' : 'Registrati';
            document.getElementById('auth-username').style.display = isLoginMode ? 'none' : 'block';
            document.getElementById('btn-do-auth').textContent = isLoginMode ? 'Entra' : 'Crea Account';
            e.target.textContent = isLoginMode ? 'Non hai un account? Registrati.' : 'Hai un account? Accedi.';
        }

        if (e.target.id === 'btn-do-auth') {
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-password').value;
            const user = document.getElementById('auth-username').value;

            try {
                if (isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, pass);
                } else {
                    const res = await createUserWithEmailAndPassword(auth, email, pass);
                    await setDoc(doc(db, "utenti", res.user.uid), {
                        username: user,
                        photoURL: "",
                        validato: false,
                        email: email,
                        role: "user"
                    });
                }
                document.getElementById('login-modal').style.display = 'none';
            } catch (err) { alert("Errore: " + err.message); }
        }

        if (e.target.id === 'btn-logout-universal') {
            await signOut(auth);
            location.href = 'index.html';
        }

        // CAMBIO DATI (In linea con le Regole Firestore)
        if (e.target.id === 'change-username-btn') {
            const nuovo = prompt("Nuovo username:");
            if (nuovo) await updateDoc(doc(db, "utenti", auth.currentUser.uid), { username: nuovo });
        }

        if (e.target.id === 'change-avatar-btn') {
            const url = prompt("Incolla URL nuova immagine profilo:");
            if (url) await updateDoc(doc(db, "utenti", auth.currentUser.uid), { photoURL: url });
        }
    });
}

injectUI();
initLogic();
