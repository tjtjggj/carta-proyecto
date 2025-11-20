// =========================
// VARIABLES
// =========================

const targetDate = new Date(Date.now() + 30000); // 30s para pruebas
// CAMBIA ESTO EN PRODUCCIÓN:
// const targetDate = new Date("2024-12-18T00:00:00");

const overlay = document.getElementById("countdown-overlay");
const cdNum = document.getElementById("cd-num");
const cdSub = document.getElementById("cd-sub");
const overlayEnvelope = document.getElementById("overlayEnvelope");

const particles = document.getElementById("particles");

const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const menuLinks = document.querySelectorAll(".menu-link");

const p1cont = document.getElementById("p1-continue");
const p2cont = document.getElementById("p2-continue");


// =========================
// FUNCIÓN PARA MOSTRAR PÁGINAS
// =========================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

function setHamburgerVisible(visible) {
    if (visible) {
        hamburger.style.visibility = "visible";
        hamburger.classList.remove("disabled");
    } else {
        hamburger.style.visibility = "hidden";
        hamburger.classList.add("disabled");
    }
}

setHamburgerVisible(false);


// =========================
// MENÚ LATERAL
// =========================
hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("href").replace("#", "");
        showPage(id);
        sidebar.classList.remove("open");
    });
});


// =========================
// TEMPORIZADOR — FUNCIÓN NUEVA Y CORREGIDA
// =========================
let cdInterval = null;

function forceUnlock() {
    cdNum.textContent = "00d 00:00:00";
    cdSub.textContent = "Pulsa la carta para desbloquear";

    overlayEnvelope.style.display = "flex";
    overlayEnvelope.style.opacity = "1";
}

function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    // YA LLEGÓ LA HORA
    if (diff <= 0) {
        forceUnlock();
        if (cdInterval) clearInterval(cdInterval);
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    cdNum.textContent = `${days}d ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

updateCountdown();
cdInterval = setInterval(updateCountdown, 1000);


// =========================
// SOBRE — DESBLOQUEO
// =========================
overlayEnvelope.addEventListener("click", () => {
    // Evita que abra antes del tiempo
    if (new Date() < targetDate) {
        overlayEnvelope.animate(
            [{ transform: "scale(0.95)" }, { transform: "scale(1)" }],
            { duration: 200 }
        );
        return;
    }

    spawnParticlesFromElement(overlayEnvelope, 50);

    overlay.style.display = "none";

    showPage("page1");
});


// =========================
// ANIMACIÓN DE PARTÍCULAS
// =========================
function spawnParticlesFromElement(el, count = 20) {
    const rect = el.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.textContent = Math.random() > 0.5 ? "🌸" : "💖";

        const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width;
        const y = rect.top + rect.height / 2;

        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.fontSize = `${14 + Math.random() * 20}px`;
        p.style.animation = `popUp ${2 + Math.random() * 2}s ease-out`;

        particles.appendChild(p);

        setTimeout(() => p.remove(), 4000);
    }
}


// =========================
// PÁGINAS 1 → 2 → 3
// =========================
p1cont.addEventListener("click", () => {
    showPage("page2");
});

p2cont.addEventListener("click", () => {
    showPage("page3");

    // ACTIVAR MENÚ DESDE AQUÍ
    setHamburgerVisible(true);
    document.querySelectorAll(".extra").forEach(e => e.classList.remove("disabled"));
});


// ====================================================
//                FIREBASE — ÁLBUM
// ====================================================
const albumGrid = document.getElementById("albumGrid");
const albumUrl = document.getElementById("albumUrl");
const albumFile = document.getElementById("albumFile");
const addAlbumBtn = document.getElementById("addAlbumBtn");

async function loadAlbum() {
    const { db, collection, getDocs, query, orderBy } = window.__FIREBASE;

    albumGrid.innerHTML = "";

    const q = query(collection(db, "albums"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    snap.forEach(docSnap => {
        const data = docSnap.data();
        const src = data.url;

        const wrap = document.createElement("div");
        wrap.className = "album-item";

        const img = document.createElement("img");
        img.src = src;

        wrap.appendChild(img);
        albumGrid.appendChild(wrap);
    });
}

async function addAlbumByUrl() {
    const { db, addDoc, collection } = window.__FIREBASE;

    const url = albumUrl.value.trim();
    if (!url) return alert("Introduce una URL válida");

    await addDoc(collection(db, "albums"), {
        url,
        createdAt: Date.now()
    });

    albumUrl.value = "";
    loadAlbum();
}

async function addAlbumByFile(file) {
    const { storage, sRef, uploadBytes, getDownloadURL, db, addDoc, collection } =
        window.__FIREBASE;

    const key = "albums/" + Date.now() + "_" + file.name;
    const ref = sRef(storage, key);

    const blob = await file.arrayBuffer();
    const u = new Uint8Array(blob);

    await uploadBytes(ref, u);
    const url = await getDownloadURL(ref);

    await addDoc(collection(db, "albums"), {
        url,
        createdAt: Date.now()
    });

    loadAlbum();
}

addAlbumBtn.addEventListener("click", () => {
    if (albumFile.files.length > 0) {
        addAlbumByFile(albumFile.files[0]);
        albumFile.value = "";
    } else {
        addAlbumByUrl();
    }
});


// ====================================================
//                  FIREBASE — LUGARES
// ====================================================
async function loadPlaces() {
    const { db, collection, getDocs, addDoc } = window.__FIREBASE;

    const cont = document.getElementById("lugaresList");
    cont.innerHTML = "";

    const snap = await getDocs(collection(db, "places"));

    if (snap.empty) {
        const defaults = [
            "Café romántico", "Mirador al atardecer", "Parque central", "Paseo en bici",
            "Museo", "Picnic", "Restaurante bonito", "Cine", "Playa", "Paseo nocturno"
        ];
        for (const name of defaults) {
            await addDoc(collection(db, "places"), { name, state: "" });
        }
        return loadPlaces();
    }

    snap.forEach(docSnap => {
        const data = docSnap.data();
        const id = docSnap.id;

        const row = document.createElement("div");
        row.className = "list-item";

        const left = document.createElement("div");
        left.textContent = data.name;

        const right = document.createElement("div");
        right.className = "place-actions";

        const check = document.createElement("button");
        check.textContent = "✓";
        check.className = "check-btn";

        const cross = document.createElement("button");
        cross.textContent = "✕";
        cross.className = "cross-btn";

        if (data.state === "checked") check.classList.add("checked");
        if (data.state === "crossed") cross.classList.add("crossed");

        check.onclick = () => togglePlaceState(id, "checked", check, cross);
        cross.onclick = () => togglePlaceState(id, "crossed", check, cross);

        right.appendChild(check);
        right.appendChild(cross);

        row.appendChild(left);
        row.appendChild(right);

        cont.appendChild(row);
    });
}


async function togglePlaceState(id, state, checkBtn, crossBtn) {
    const { db, doc, getDoc, updateDoc } = window.__FIREBASE;

    const dref = doc(db, "places", id);
    const snap = await getDoc(dref);

    if (!snap.exists()) return;

    const current = snap.data().state || "";
    const newState = current === state ? "" : state;

    await updateDoc(dref, { state: newState });

    checkBtn.classList.remove("checked");
    crossBtn.classList.remove("crossed");

    if (newState === "checked") checkBtn.classList.add("checked");
    if (newState === "crossed") crossBtn.classList.add("crossed");
}

document.getElementById("addLugarBtn").addEventListener("click", async () => {
    const { db, addDoc, collection } = window.__FIREBASE;

    const value = document.getElementById("lugarInput").value.trim();
    if (!value) return;

    await addDoc(collection(db, "places"), { name: value, state: "" });
    document.getElementById("lugarInput").value = "";
    loadPlaces();
});


// ====================================================
//                  INICIALIZACIÓN
// ====================================================
loadAlbum();
loadPlaces();
