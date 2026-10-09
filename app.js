const PUBLIC_VAPID_KEY = 'BKsTf1wxQNiM0tlZUpgzbxoPP-C3phHxs4wEKs7MgK-XJ1vp37vl3YWUNewnNjvTS7I-pHIrGUna2TVpWXmCwpM'; // <-- Pon aquí tu clave pública VAPID

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch((err) => console.error('Error al registrar Service Worker:', err));
    });
}

// 2. Control de Estado de Red
const statusEl = document.getElementById('net-status');
function updateOnlineStatus() {
    if (navigator.onLine) {
        statusEl.textContent = '● En línea';
        statusEl.className = 'status-pill online';
    } else {
        statusEl.textContent = '● Modo Offline';
        statusEl.className = 'status-pill offline';
    }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 3. Notificaciones Push a través del Servidor Node.js (web-push)
const btnNotify = document.getElementById('btn-notify');
btnNotify.addEventListener('click', async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Este navegador no soporta Notificaciones Push.');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('Las notificaciones están desactivadas o fueron denegadas.');
        return;
    }

    try {
        const reg = await navigator.serviceWorker.ready;

        // Obtener o crear suscripción con la clave VAPID
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });
        }

        // 1. Guardar suscripción en el backend Node.js
        await fetch('http://localhost:3000/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub)
        });

        // 2. Solicitar al servidor que envíe la notificación
        await fetch('http://localhost:3000/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: '⛩️ AniTracker Express',
                body: '¡Notificación enviada desde el servidor Node.js correctamente!'
            })
        });

    } catch (error) {
        console.error('Error al conectar con el servidor Push:', error);
        alert('No se pudo conectar con el servidor de notificaciones (localhost:3000). Asegúrate de tener Node.js ejecutándose.');
    }
});

// 4. LÓGICA DEL CARRUSEL DINÁMICO
const heroBanner = document.getElementById('hero-banner');
const heroTitle = document.getElementById('hero-title');
const heroTags = document.getElementById('hero-tags');
const heroDesc = document.getElementById('hero-desc');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');

const carouselData = [
    {
        title: "Sword Art Online",
        image: "icons/Sword Art Online.png",
        tags: ["Acción", "Fantasía", "Isekai"],
        desc: "Kirito debe luchar a través de cien pisos en el juego de realidad virtual para sobrevivir."
    },
    {
        title: "Attack on Titan",
        image: "icons/Attack on Titan.png",
        tags: ["Acción", "Drama", "Misterio"],
        desc: "La humanidad se refugia tras muros gigantescos para escapar de los Titanes devoradores."
    },
    {
        title: "Konosuba",
        image: "icons/Konosuba.png",
        tags: ["Comedia", "Fantasía", "Parodia"],
        desc: "Kazuma renace en un mundo de fantasía junto a una diosa inútil y una fiesta caótica."
    },
    {
        title: "My Hero Academia",
        image: "icons/MyHero Academia.png",
        tags: ["Shonen", "Superhéroes", "Escolar"],
        desc: "Izuku Midoriya sueña con convertirse en el héroe número uno sin tener superpoderes."
    },
    {
        title: "DanMachi",
        image: "icons/DanMachi.png",
        tags: ["Aventura", "Magia", "Fantasía"],
        desc: "Bell Cranel explora la Mazmorra de Orario bajo la bendición de la Diosa Hestia."
    }
];

let currentSlide = 0;

function updateCarousel(index) {
    const item = carouselData[index];
    heroBanner.style.backgroundImage = `linear-gradient(90deg, #181a29 0%, rgba(24, 26, 41, 0.8) 50%, rgba(16, 17, 25, 0.4) 100%), url('${item.image}')`;
    heroTitle.textContent = item.title;
    heroDesc.textContent = item.desc;

    heroTags.innerHTML = '';
    item.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        heroTags.appendChild(span);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselData.length;
    updateCarousel(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselData.length) % carouselData.length;
    updateCarousel(currentSlide);
}

if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

// Autoplay cada 5 segundos
setInterval(nextSlide, 5000);
updateCarousel(0);

// 5. MAPEO DE IMÁGENES PARA LAS TARJETAS INFERIORES Y CATÁLOGO
const animeImages = {
    "attack on titan": "icons/Attack on Titan.png",
    "shingeki no kyojin": "icons/Attack on Titan.png",
    "chuunibyou": "icons/Chuunibyou.png",
    "danmachi": "icons/DanMachi.png",
    "date a live": "icons/DateALive.png",
    "fairy tail": "icons/FairyTail.png",
    "free!": "icons/Free!.png",
    "free": "icons/Free!.png",
    "infinite stratos": "icons/Infinite Stratos.png",
    "konosuba": "icons/Konosuba.png",
    "lcl": "icons/LCL.png",
    "monachina": "icons/Monachina.png",
    "monachina 2": "icons/Monachina2.png",
    "my hero academia": "icons/MyHero Academia.png",
    "boku no hero": "icons/MyHero Academia.png",
    "no game no life": "icons/No Game No Life.png",
    "school days": "icons/School Days.png",
    "sword art online": "icons/Sword Art Online.png",
    "sao": "icons/Sword Art Online.png"
};

const animeForm = document.getElementById('anime-form');
const animeList = document.getElementById('anime-list');
const searchInput = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');
const clearSearchBtn = document.getElementById('clear-search');
const episodesHeading = document.getElementById('episodes-heading');
const episodesSub = document.getElementById('episodes-sub');
const episodesSection = document.getElementById('episodes-section');
const btnWatch = document.querySelector('.btn-watch');

const catalogAnimes = [
    { title: "Sword Art Online", image: "icons/Sword Art Online.png" },
    { title: "Attack on Titan", image: "icons/Attack on Titan.png" },
    { title: "Konosuba", image: "icons/Konosuba.png" },
    { title: "My Hero Academia", image: "icons/MyHero Academia.png" },
    { title: "DanMachi", image: "icons/DanMachi.png" },
    { title: "Chuunibyou", image: "icons/Chuunibyou.png" },
    { title: "Date A Live", image: "icons/DateALive.png" },
    { title: "Fairy Tail", image: "icons/FairyTail.png" },
    { title: "Free!", image: "icons/Free!.png" },
    { title: "Infinite Stratos", image: "icons/Infinite Stratos.png" },
    { title: "LCL", image: "icons/LCL.png" },
    { title: "Monachina", image: "icons/Monachina.png" },
    { title: "No Game No Life", image: "icons/No Game No Life.png" },
    { title: "School Days", image: "icons/School Days.png" }
];

function getAnimeCover(title) {
    const cleanTitle = title.toLowerCase().trim();
    return animeImages[cleanTitle] || "icons/Sword Art Online.png";
}

function loadAnimes(query = '') {
    const list = JSON.parse(localStorage.getItem('anitracker_list') || '[]');
    const cleanQuery = query.toLowerCase().trim();
    animeList.innerHTML = '';

    if (episodesHeading && episodesSub) {
        if (cleanQuery) {
            episodesHeading.textContent = `Resultados (${list.filter(i => i.title.toLowerCase().includes(cleanQuery)).length})`;
            episodesSub.textContent = `FILTRADO POR: "${query}"`;
        } else {
            episodesHeading.textContent = `Episodios`;
            episodesSub.textContent = `RECIENTEMENTE ACTUALIZADO`;
        }
    }

    if (list.length === 0) {
        animeList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; grid-column: 1 / -1; padding: 1.5rem 0;">No has agregado capítulos aún.</p>`;
        return;
    }

    const filteredList = cleanQuery
        ? list.filter(item => item.title.toLowerCase().includes(cleanQuery))
        : list;

    if (filteredList.length === 0) {
        animeList.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 2rem 1rem; text-align: center; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-dark);">
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 0.8rem;">
                    No se encontraron animes en tu lista que coincidan con "<strong>${escapeHtml(query)}</strong>".
                </p>
                <button type="button" onclick="clearSearchAndReload()" style="background: var(--pink-accent); color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    Mostrar todos los episodios
                </button>
            </div>
        `;
        return;
    }

    filteredList.forEach((item) => {
        const li = document.createElement('li');
        const coverUrl = getAnimeCover(item.title);
        const itemId = item.id || `${item.title}-${item.ep}`;

        li.innerHTML = `
      <div class="card-thumb" style="background-image: url('${coverUrl}');">
        <span class="ep-tag">Episodio ${escapeHtml(String(item.ep))}</span>
      </div>
      <div class="card-body">
        <div class="card-info">
          <span class="card-title">${escapeHtml(item.title)}</span>
          <span class="card-time">Actualizado recién</span>
        </div>
        <button class="btn-delete" onclick="deleteAnimeById('${itemId}')" title="Eliminar">🗑️</button>
      </div>
    `;
        animeList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateSearchDropdown(query) {
    if (!searchDropdown) return;
    const cleanQuery = query.toLowerCase().trim();

    if (!cleanQuery) {
        searchDropdown.style.display = 'none';
        searchDropdown.innerHTML = '';
        return;
    }

    const savedList = JSON.parse(localStorage.getItem('anitracker_list') || '[]');
    const matchingSaved = savedList.filter(item => item.title.toLowerCase().includes(cleanQuery));
    const matchingCatalog = catalogAnimes.filter(item =>
        item.title.toLowerCase().includes(cleanQuery) &&
        !matchingSaved.some(s => s.title.toLowerCase() === item.title.toLowerCase())
    );

    if (matchingSaved.length === 0 && matchingCatalog.length === 0) {
        searchDropdown.innerHTML = `
            <div style="padding: 12px; font-size: 0.85rem; color: var(--text-muted); text-align: center;">
                No se encontraron coincidencias para "${escapeHtml(query)}"
            </div>
        `;
        searchDropdown.style.display = 'block';
        return;
    }

    let html = '';

    if (matchingSaved.length > 0) {
        html += `<div class="search-dropdown-header">En tu lista (${matchingSaved.length})</div>`;
        matchingSaved.slice(0, 4).forEach(item => {
            const cover = getAnimeCover(item.title);
            html += `
                <div class="search-dropdown-item" onclick="selectSavedAnime('${escapeHtml(item.title)}')">
                    <div class="thumb" style="background-image: url('${cover}')"></div>
                    <div class="info">
                        <span class="title">${escapeHtml(item.title)}</span>
                        <span class="sub">Episodio ${escapeHtml(String(item.ep))}</span>
                    </div>
                    <span class="action-tag">Ver</span>
                </div>
            `;
        });
    }

    if (matchingCatalog.length > 0) {
        html += `<div class="search-dropdown-header">Del catálogo</div>`;
        matchingCatalog.slice(0, 3).forEach(item => {
            html += `
                <div class="search-dropdown-item" onclick="selectCatalogAnime('${escapeHtml(item.title)}')">
                    <div class="thumb" style="background-image: url('${item.image}')"></div>
                    <div class="info">
                        <span class="title">${escapeHtml(item.title)}</span>
                        <span class="sub">Disponible para agregar</span>
                    </div>
                    <span class="action-tag" style="background: rgba(255,255,255,0.15);">+ Agregar</span>
                </div>
            `;
        });
    }

    searchDropdown.innerHTML = html;
    searchDropdown.style.display = 'block';
}

window.selectSavedAnime = (title) => {
    if (searchInput) searchInput.value = title;
    if (searchDropdown) searchDropdown.style.display = 'none';
    if (clearSearchBtn) clearSearchBtn.style.display = 'block';
    loadAnimes(title);
    scrollToEpisodes();
};

window.selectCatalogAnime = (title) => {
    if (searchDropdown) searchDropdown.style.display = 'none';
    const titleInput = document.getElementById('anime-title');
    const epInput = document.getElementById('anime-ep');
    if (titleInput && epInput) {
        titleInput.value = title;
        epInput.value = '1';
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        epInput.focus();
    }
};

function scrollToEpisodes() {
    if (episodesSection) {
        episodesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.clearSearchAndReload = () => {
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (searchDropdown) searchDropdown.style.display = 'none';
    loadAnimes();
};

// Búsqueda en tiempo real
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearSearchBtn) {
            clearSearchBtn.style.display = val.length > 0 ? 'block' : 'none';
        }
        loadAnimes(val);
        updateSearchDropdown(val);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchDropdown) searchDropdown.style.display = 'none';
            scrollToEpisodes();
        } else if (e.key === 'Escape') {
            if (searchDropdown) searchDropdown.style.display = 'none';
        }
    });

    searchInput.addEventListener('focus', (e) => {
        if (e.target.value.trim().length > 0) {
            updateSearchDropdown(e.target.value);
        }
    });
}

// Ocultar desplegable de búsqueda al dar clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box-wrapper')) {
        if (searchDropdown) searchDropdown.style.display = 'none';
    }
});

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', window.clearSearchAndReload);
}

// Agregar Anime a LocalStorage
if (animeForm) {
    animeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('anime-title');
        const epInput = document.getElementById('anime-ep');
        const title = titleInput.value.trim();
        const ep = epInput.value.trim();

        if (!title || !ep) return;

        const list = JSON.parse(localStorage.getItem('anitracker_list') || '[]');
        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            title,
            ep
        };
        list.unshift(newItem);
        localStorage.setItem('anitracker_list', JSON.stringify(list));

        animeForm.reset();
        window.clearSearchAndReload();
        scrollToEpisodes();
    });
}

window.deleteAnimeById = (id) => {
    const list = JSON.parse(localStorage.getItem('anitracker_list') || '[]');
    const updatedList = list.filter(item => {
        const itemId = item.id || `${item.title}-${item.ep}`;
        return itemId !== id;
    });
    localStorage.setItem('anitracker_list', JSON.stringify(updatedList));
    const currentQuery = searchInput ? searchInput.value : '';
    loadAnimes(currentQuery);
};

// Botón "Seguir Anime" del Banner
if (btnWatch) {
    btnWatch.addEventListener('click', () => {
        const currentAnime = carouselData[currentSlide];
        if (currentAnime) {
            const titleInput = document.getElementById('anime-title');
            const epInput = document.getElementById('anime-ep');
            if (titleInput && epInput) {
                titleInput.value = currentAnime.title;
                epInput.value = '1';
                epInput.focus();
                titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

loadAnimes();