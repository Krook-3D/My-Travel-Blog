/* ─────────────────────────────
   STATE
───────────────────────────── */
let destinations = [];
let editingId     = null;
let currentDestId = null;
let imageDataUrl  = null;
 
/* ─────────────────────────────
   STORAGE
───────────────────────────── */
function load() {
  try {
    const saved = localStorage.getItem('travel_destinations');
    if (saved) destinations = JSON.parse(saved);
    const banner = localStorage.getItem('travel_header_photo');
if (banner) applyHeroBanner(banner);
  } catch (e) {
    destinations = [];
  }
  render();
}
 
function save() {
  try {
    localStorage.setItem('travel_destinations', JSON.stringify(destinations));
  } catch (e) {}
}
 
/* ─────────────────────────────
   UTILITIES
───────────────────────────── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
 
/* ─────────────────────────────
   TOAST NOTIFICATION
───────────────────────────── */
function showToast(msg, type = 'error') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 5.5rem; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'error' ? '#c0614a' : '#4a5c3a'};
    color: #fff; padding: 0.7rem 1.6rem;
    border-radius: 4px;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
    z-index: 9999; opacity: 0;
    transition: opacity 0.25s, transform 0.25s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    pointer-events: none; white-space: nowrap;
  `;
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2800);
}
 
/* ─────────────────────────────
   CUSTOM CONFIRM DIALOG
───────────────────────────── */
function showConfirm(msg, onYes) {
  let overlay = document.getElementById('confirmOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.innerHTML = `
      <div id="confirmBox" style="
        background: var(--parchment); border-radius: 6px; padding: 2rem;
        max-width: 380px; width: 90%;
        box-shadow: 0 20px 60px rgba(30,25,18,0.4);
        text-align: center; transform: scale(0.95); transition: transform 0.2s;
      ">
        <p id="confirmMsg" style="
          font-family: 'Playfair Display', serif; font-size: 1.1rem;
          color: var(--ink); margin-bottom: 1.5rem; line-height: 1.5;
        "></p>
        <div style="display: flex; gap: 0.8rem; justify-content: center;">
          <button id="confirmNo" style="
            padding: 0.6rem 1.4rem; border: 1.5px solid var(--sand2);
            background: transparent; border-radius: 4px; cursor: pointer;
            font-family: 'Josefin Sans', sans-serif; font-size: 0.75rem;
            letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted);
          ">Cancel</button>
          <button id="confirmYes" style="
            padding: 0.6rem 1.4rem; background: var(--terracotta); color: #fff;
            border: none; border-radius: 4px; cursor: pointer;
            font-family: 'Josefin Sans', sans-serif; font-size: 0.75rem;
            letter-spacing: 0.15em; text-transform: uppercase;
          ">Delete</button>
        </div>
      </div>`;
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 600;
      background: rgba(30,25,18,0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
    `;
    document.body.appendChild(overlay);
  }
 
  document.getElementById('confirmMsg').textContent = msg;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    document.getElementById('confirmBox').style.transform = 'scale(1)';
  });
 
  const close = () => {
    overlay.style.opacity = '0';
    document.getElementById('confirmBox').style.transform = 'scale(0.95)';
    setTimeout(() => (overlay.style.display = 'none'), 200);
  };
 
  document.getElementById('confirmYes').onclick = () => { close(); onYes(); };
  document.getElementById('confirmNo').onclick  = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}
 
/* ─────────────────────────────
   RENDER HOME GRID
───────────────────────────── */
function render() {
  const grid  = document.getElementById('destinationsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('heroCount');
 
  count.innerHTML = `<strong>${destinations.length}</strong> destination${destinations.length !== 1 ? 's' : ''} collected`;
 
  // Remove existing cards but keep the empty-state element
  grid.querySelectorAll('.dest-card').forEach(c => c.remove());
 
  if (destinations.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
 
  destinations.slice().reverse().forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    card.style.animationDelay = (i * 0.06) + 's';
 
    const dateStr = d.date
      ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '';
 
    const imgHtml = d.image
      ? `<img src="${d.image}" alt="${d.city}" loading="lazy">`
      : `<div class="no-img"><span class="icon">🌍</span><span>No photo</span></div>`;
 
    card.innerHTML = `
      <div class="card-tape"></div>
      <div class="card-img">${imgHtml}</div>
      <div class="card-body">
        <div class="card-country">${d.country || ''}</div>
        <div class="card-title">${d.city}</div>
        <div class="card-desc">${d.description || ''}</div>
      </div>
      <div class="card-footer">
        <span class="card-date">${dateStr}</span>
        <span class="card-arrow">→</span>
      </div>
      <button class="card-delete" title="Delete" onclick="deleteCard(event, '${d.id}')">✕</button>
    `;
 
    card.addEventListener('click', () => showDest(d.id));
    grid.appendChild(card);
  });
}

/* ─────────────────────────────
   HERO BANNER PHOTO
───────────────────────────── */
function applyHeroBanner(src) {
  const bg   = document.getElementById('heroBg');
  const hero = document.getElementById('heroBanner');
  bg.style.backgroundImage = `url('${src}')`;
  hero.classList.add('has-photo');
  document.getElementById('heroBannerBtnText').textContent = '📷 Change Header Photo';
}

document.getElementById('heroBannerInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;
  const compressed = await compressImage(file, 1800, 0.8);
  try {
    localStorage.setItem('travel_header_photo', compressed);
  } catch(e) {
    showToast('Photo too large to save, try a smaller image.');
    return;
  }
  applyHeroBanner(compressed);
  showToast('Header photo saved!', 'success');
  this.value = '';
});

// Load saved banner on startup — add this line inside the existing load() function
// after destinations = JSON.parse(saved):
//   const banner = localStorage.getItem('travel_header_photo');
//   if (banner) applyHeroBanner(banner);
 
/* ─────────────────────────────
   PAGE NAVIGATION
───────────────────────────── */
function showHome() {
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('dest-page').style.display = 'none';
  document.getElementById('dest-page').classList.remove('active');
  document.getElementById('navBack').style.display = 'none';
  document.getElementById('addBtn').style.display   = 'flex';
  currentDestId = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}
 
function showDest(id) {
  const d = destinations.find(x => x.id === id);
  if (!d) return;
  currentDestId = id;
 
  // Build hero section
  const hero    = document.getElementById('destHero');
  const dateStr = d.date
    ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
 
  hero.innerHTML = `
    ${d.image
      ? `<img src="${d.image}" alt="${d.city}">`
      : `<div class="dest-hero-no-img">🌍</div>`}
    <div class="dest-hero-overlay"></div>
    <div class="dest-hero-text">
      <div class="dest-hero-country">${d.country || ''}</div>
      <div class="dest-hero-title">${d.city}</div>
      ${dateStr ? `<div class="dest-hero-date">${dateStr}</div>` : ''}
    </div>
  `;
 
  // Build description
  const desc       = document.getElementById('destDescription');
  const paragraphs = (d.description || '').split('\n').filter(p => p.trim());
  desc.innerHTML   = paragraphs.map(p => `<p>${p}</p>`).join('')
    || '<p style="color:var(--muted);font-style:italic;">No description added.</p>';
 
  // Wire action buttons
  document.getElementById('destEditBtn').onclick = () => openModal(id);
  document.getElementById('destDelBtn').onclick  = () => deleteDest(id);
 
  // Switch view
  document.getElementById('home-page').style.display = 'none';
  const dp = document.getElementById('dest-page');
  dp.style.display = 'block';
  dp.classList.add('active');
  document.getElementById('navBack').style.display = 'flex';
  document.getElementById('addBtn').style.display  = 'none';
  window.scrollTo({ top: 0, behavior: 'instant' });
 
  // Render gallery
  renderGallery(id);
}
 
/* ─────────────────────────────
   MODAL
───────────────────────────── */
function openModal(id = null) {
  editingId    = id;
  imageDataUrl = null;
 
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const btn   = document.getElementById('submitBtn');
 
  // Reset all fields
  document.getElementById('inputCity').value    = '';
  document.getElementById('inputCountry').value = '';
  document.getElementById('inputDate').value    = '';
  document.getElementById('inputDesc').value    = '';
  document.getElementById('imgInput').value     = '';
  document.getElementById('uploadPreview').src  = '';
  document.getElementById('uploadPreview').classList.remove('show');
  document.getElementById('uploadPlaceholder').style.display = '';
  document.getElementById('uploadChange').classList.remove('show');
 
  if (id) {
    const d = destinations.find(x => x.id === id);
    if (d) {
      title.innerHTML  = 'Edit <span>Destination</span>';
      btn.textContent  = '✦ Save Changes';
      document.getElementById('inputCity').value    = d.city        || '';
      document.getElementById('inputCountry').value = d.country     || '';
      document.getElementById('inputDate').value    = d.date        || '';
      document.getElementById('inputDesc').value    = d.description || '';
      if (d.image) {
        imageDataUrl = d.image;
        document.getElementById('uploadPreview').src = d.image;
        document.getElementById('uploadPreview').classList.add('show');
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadChange').classList.add('show');
      }
    }
  } else {
    title.innerHTML = 'New <span>Destination</span>';
    btn.textContent = '✦ Add Destination';
  }
 
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('inputCity').focus(), 300);
}
 
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  editingId    = null;
  imageDataUrl = null;
}
 
/* ─────────────────────────────
   SAVE DESTINATION
───────────────────────────── */
function saveDestination() {
  const city        = document.getElementById('inputCity').value.trim();
  const country     = document.getElementById('inputCountry').value.trim();
  const date        = document.getElementById('inputDate').value;
  const description = document.getElementById('inputDesc').value.trim();
 
  if (!city) {
    showToast('Please enter a city or place name.');
    document.getElementById('inputCity').focus();
    return;
  }
 
  if (editingId) {
    const idx = destinations.findIndex(x => x.id === editingId);
    if (idx !== -1) {
      destinations[idx] = {
        ...destinations[idx],
        city, country, date, description,
        image: imageDataUrl || destinations[idx].image
      };
    }
  } else {
    destinations.push({ id: uid(), city, country, date, description, image: imageDataUrl });
  }
 
  save();
  closeModal();
 
  if (editingId && currentDestId === editingId) {
    showDest(editingId);
  } else {
    showHome();
  }
}
 
/* ─────────────────────────────
   DELETE
───────────────────────────── */
function deleteCard(e, id) {
  e.stopPropagation();
  showConfirm('Remove this destination?', () => {
    destinations = destinations.filter(x => x.id !== id);
    save();
    render();
  });
}
 
function deleteDest(id) {
  showConfirm('Delete this destination permanently?', () => {
    destinations = destinations.filter(x => x.id !== id);
    save();
    showHome();
  });
}
 
/* ─────────────────────────────
   IMAGE COMPRESSION
   Resizes to max 1200px and compresses to ~0.75 quality.
   Keeps a phone photo under ~200KB instead of 3–5MB.
───────────────────────────── */
function compressImage(file, maxPx = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Work out new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height / width) * maxPx);
            width  = maxPx;
          } else {
            width  = Math.round((width / height) * maxPx);
            height = maxPx;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
 
/* ─────────────────────────────
   IMAGE UPLOAD
───────────────────────────── */
document.getElementById('imgInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  handleImage(file);
});
 
async function handleImage(file) {
  const compressed = await compressImage(file);
  imageDataUrl = compressed;
  const prev   = document.getElementById('uploadPreview');
  prev.src     = imageDataUrl;
  prev.classList.add('show');
  document.getElementById('uploadPlaceholder').style.display = 'none';
  document.getElementById('uploadChange').classList.add('show');
}
 
/* ─────────────────────────────
   DRAG & DROP
───────────────────────────── */
const zone = document.getElementById('uploadZone');
 
zone.addEventListener('dragover', (e) => {
  e.preventDefault();
  zone.classList.add('drag');
});
zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImage(file);
});
 
/* ─────────────────────────────
   GALLERY
───────────────────────────── */
function renderGallery(id) {
  const d     = destinations.find(x => x.id === id);
  const grid  = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  if (!d) return;
 
  // Remove existing gallery items
  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());
 
  const photos = d.gallery || [];
 
  if (photos.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
 
  photos.forEach((src, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${src}" alt="Photo ${idx + 1}" loading="lazy">
      <div class="gallery-item-overlay">
        <span class="gallery-zoom-icon">⤢</span>
      </div>
      <button class="gallery-item-delete" title="Remove photo" onclick="deleteGalleryPhoto(event,'${id}',${idx})">✕</button>
    `;
    item.addEventListener('click', () => openLightbox(id, idx));
    grid.appendChild(item);
  });
}
 
function deleteGalleryPhoto(e, destId, idx) {
  e.stopPropagation();
  showConfirm('Remove this photo?', () => {
    const d = destinations.find(x => x.id === destId);
    if (!d || !d.gallery) return;
    d.gallery.splice(idx, 1);
    save();
    renderGallery(destId);
    // update lightbox index if open
    if (document.getElementById('lightbox').classList.contains('open')) {
      closeLightbox();
    }
  });
}
 
// Handle gallery file input
document.getElementById('galleryInput').addEventListener('change', async function () {
  const files = Array.from(this.files);
  if (!files.length || !currentDestId) return;
  const d = destinations.find(x => x.id === currentDestId);
  if (!d) return;
  if (!d.gallery) d.gallery = [];
 
  showToast('Compressing photos…', 'success');
 
  // Compress all files in parallel
  const compressed = await Promise.all(
    files.map(file => compressImage(file, 1200, 0.75))
  );
 
  compressed.forEach(src => d.gallery.push(src));
  save();
  renderGallery(currentDestId);
  showToast(`${files.length} photo${files.length > 1 ? 's' : ''} added!`, 'success');
 
  this.value = ''; // reset so same files can be re-added
});
 
/* ─────────────────────────────
   LIGHTBOX
───────────────────────────── */
let lightboxIndex = 0;
let lightboxDestId = null;
 
function openLightbox(destId, idx) {
  const d = destinations.find(x => x.id === destId);
  if (!d || !d.gallery || !d.gallery.length) return;
  lightboxDestId = destId;
  lightboxIndex  = idx;
  updateLightboxImage();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
 
function updateLightboxImage() {
  const d = destinations.find(x => x.id === lightboxDestId);
  if (!d || !d.gallery) return;
  const photos = d.gallery;
  document.getElementById('lightboxImg').src         = photos[lightboxIndex];
  document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${photos.length}`;
  document.getElementById('lightboxPrev').style.display = photos.length > 1 ? 'flex' : 'none';
  document.getElementById('lightboxNext').style.display = photos.length > 1 ? 'flex' : 'none';
}
 
function lightboxNav(e, dir) {
  e.stopPropagation();
  const d = destinations.find(x => x.id === lightboxDestId);
  if (!d || !d.gallery) return;
  lightboxIndex = (lightboxIndex + dir + d.gallery.length) % d.gallery.length;
  updateLightboxImage();
}
 
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
 
// Keyboard nav for lightbox
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (lb.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  lightboxNav(e, -1);
    if (e.key === 'ArrowRight') lightboxNav(e,  1);
    if (e.key === 'Escape')     closeLightbox();
    return;
  }
  if (e.key === 'Escape') closeModal();
});
 
/* ─────────────────────────────
   GLOBAL EVENT LISTENERS
───────────────────────────── */
// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
 
/* ─────────────────────────────
   INIT
───────────────────────────── */
load();
 