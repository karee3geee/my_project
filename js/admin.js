/* Admin Panel Engine – Karim AI Studio */

document.addEventListener("DOMContentLoaded", () => { initAdmin(); });

let currentUser = null;
let allProjects = [];
let editingId = null;
let uploadedMediaUrl = null;

const CAT_LABELS = { images:"AI Images", videos:"AI Videos", automation:"Python Automation", workflows:"AI Workflows", creative:"Creative Projects" };

function initAdmin() {
  const login = document.getElementById("adminLogin");
  const dash  = document.getElementById("adminDashboard");
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      login.style.display = "none";
      dash.style.display  = "flex";
      const e = document.getElementById("adminUserEmail");
      if (e) e.textContent = user.email;
      loadProjects(); initSidebar(); initProjectForm(); initDropzone();
    } else { login.style.display = "flex"; dash.style.display = "none"; }
  });
  document.getElementById("loginForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const btn = document.getElementById("loginBtn");
    const err = document.getElementById("loginError");
    const email = document.getElementById("loginEmail").value;
    const pass  = document.getElementById("loginPassword").value;
    btn.disabled = true; btn.textContent = "Signing in...";
    try { await auth.signInWithEmailAndPassword(email, pass); }
    catch (ex) { err.style.display = "block"; err.textContent = ex.message; btn.disabled = false; btn.textContent = "Sign In"; }
  });
  document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());
}

function initSidebar() {
  const links = document.querySelectorAll(".sidebar-link[data-panel]");
  links.forEach(l => l.addEventListener("click", ev => {
    ev.preventDefault();
    links.forEach(x => x.classList.remove("active")); l.classList.add("active");
    showPanel(l.dataset.panel);
  }));
  document.getElementById("goAddProject").addEventListener("click", () => { showPanel("add"); resetForm(); });
}

function showPanel(name) {
  document.getElementById("panelProjects").style.display = name === "projects" ? "block" : "none";
  document.getElementById("panelAdd").style.display      = name === "add"      ? "block" : "none";
  document.getElementById("panelTitle").textContent = name === "projects" ? "Projects" : "Add / Edit Project";
}

function loadProjects() {
  const list = document.getElementById("projectsList");
  db.collection("projects").orderBy("order","asc").onSnapshot(snap => {
    allProjects = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderProjectsList(allProjects);
  }, () => { list.innerHTML = "<p style=color:#ef4444>Error loading. Check Firestore.</p>"; });
}

function renderProjectsList(projects) {
  const list = document.getElementById("projectsList");
  if (!projects.length) { list.innerHTML = "<p class=empty-msg>No projects yet.</p>"; return; }
  list.innerHTML = projects.map(p => {
    const t = p.thumbnail || p.src || "";
    return `<div class="project-row"><div class="proj-thumb-wrap">${t ? `<img class="proj-thumb" src="${t}" alt="">` : `<div class="proj-thumb-placeholder"></div>`}</div><div class="proj-info"><strong>${p.title}</strong><span class="proj-cat-badge">${CAT_LABELS[p.category]||p.category}</span></div><div class="proj-actions"><button class="btn btn-sm btn-ghost edit-btn" data-id="${p.id}">Edit</button><button class="btn btn-sm btn-danger del-btn" data-id="${p.id}">Delete</button></div></div>`;
  }).join("");
  list.querySelectorAll(".edit-btn").forEach(b => b.addEventListener("click", () => openEdit(b.dataset.id)));
  list.querySelectorAll(".del-btn").forEach(b => b.addEventListener("click", () => deleteProject(b.dataset.id)));
}

function initProjectForm() {
  document.getElementById("projectForm").addEventListener("submit", async ev => { ev.preventDefault(); await saveProject(); });
  document.getElementById("cancelEdit").addEventListener("click", () => { showPanel("projects"); resetForm(); });
  document.getElementById("projectSearch").addEventListener("input", ev => {
    const q = ev.target.value.toLowerCase();
    renderProjectsList(allProjects.filter(p => (p.title+p.description).toLowerCase().includes(q)));
  });
}

function resetForm() {
  editingId = null; uploadedMediaUrl = null;
  document.getElementById("projectForm").reset();
  document.getElementById("editProjectId").value = "";
  document.getElementById("formHeading").textContent = "Add New Project";
  document.getElementById("deleteProjectBtn").style.display = "none";
  document.getElementById("mediaPreview").innerHTML = "";
  document.getElementById("uploadProgress").style.display = "none";
  document.getElementById("projectFormMsg").style.display = "none";
}

function openEdit(id) {
  const p = allProjects.find(x => x.id === id); if (!p) return;
  editingId = id; showPanel("add");
  document.getElementById("formHeading").textContent = "Edit Project";
  document.getElementById("editProjectId").value = id;
  document.getElementById("pTitle").value = p.title||"";
  document.getElementById("pCategory").value = p.category||"images";
  document.getElementById("pDescription").value = p.description||"";
  document.getElementById("pTags").value = (p.tags||[]).join(", ");
  document.getElementById("pOrder").value = p.order||0;
  document.getElementById("pFeatured").checked = p.featured||false;
  document.getElementById("pMediaUrl").value = p.src||p.thumbnail||"";
  document.getElementById("deleteProjectBtn").style.display = "inline-flex";
  const prev = document.getElementById("mediaPreview");
  const url = p.src||p.thumbnail;
  if (url) prev.innerHTML = p.mediaType==="video"
    ? `<video src="${url}" controls style="max-height:180px;border-radius:8px"></video>`
    : `<img src="${url}" style="max-height:180px;border-radius:8px;object-fit:contain">`;
}

async function saveProject() {
  const btn = document.getElementById("saveProjectBtn");
  const msg = document.getElementById("projectFormMsg");
  btn.disabled = true; btn.textContent = "Saving...";
  const title    = document.getElementById("pTitle").value.trim();
  const category = document.getElementById("pCategory").value;
  const desc     = document.getElementById("pDescription").value.trim();
  const tagsRaw  = document.getElementById("pTags").value;
  const order    = parseInt(document.getElementById("pOrder").value)||0;
  const featured = document.getElementById("pFeatured").checked;
  const urlField = document.getElementById("pMediaUrl").value.trim();
  const tags     = tagsRaw.split(",").map(t=>t.trim()).filter(Boolean);
  const finalUrl = uploadedMediaUrl || urlField;
  const data = { title, category, categoryLabel:CAT_LABELS[category]||category, description:desc, tags, order, featured,
    src:finalUrl||"", thumbnail:finalUrl||"",
    mediaType: finalUrl && /\.(mp4|webm|mov)$/i.test(finalUrl) ? "video" : "image",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
  try {
    if (editingId) { await db.collection("projects").doc(editingId).update(data); }
    else { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection("projects").add(data); }
    msg.style.display="block"; msg.style.color="#10B981";
    msg.textContent = editingId ? "Project updated!" : "Project added!";
    setTimeout(()=>{ showPanel("projects"); resetForm(); }, 1200);
  } catch(ex) {
    msg.style.display="block"; msg.style.color="#ef4444"; msg.textContent="Error: "+ex.message;
    btn.disabled=false; btn.textContent="Save Project";
  }
}

async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;
  await db.collection("projects").doc(id).delete();
}

function initDropzone() {
  const zone = document.getElementById("mediaDropzone");
  const inp  = document.getElementById("mediaFile");
  zone.addEventListener("click", ()=>inp.click());
  zone.addEventListener("dragover", ev=>{ev.preventDefault(); zone.classList.add("dragover");});
  zone.addEventListener("dragleave", ()=>zone.classList.remove("dragover"));
  zone.addEventListener("drop", ev=>{ev.preventDefault(); zone.classList.remove("dragover"); if(ev.dataTransfer.files[0]) handleFile(ev.dataTransfer.files[0]);});
  inp.addEventListener("change", ev=>{if(ev.target.files[0]) handleFile(ev.target.files[0]);});
}

function handleFile(file) {
  const isVideo = file.type.startsWith("video");
  const prev  = document.getElementById("mediaPreview");
  const prog  = document.getElementById("uploadProgress");
  const fill  = document.getElementById("progressFill");
  const label = document.getElementById("progressLabel");
  const objUrl = URL.createObjectURL(file);
  prev.innerHTML = isVideo
    ? `<video src="${objUrl}" controls style="max-height:180px;border-radius:8px"></video>`
    : `<img src="${objUrl}" style="max-height:180px;border-radius:8px;object-fit:contain">`;
  if (typeof storage !== "undefined" && typeof firebase !== "undefined" && firebase.apps.length) {
    const ref  = storage.ref("projects/" + Date.now() + "_" + file.name);
    const task = ref.put(file);
    prog.style.display = "flex";
    task.on("state_changed",
      snap => { const pct=Math.round((snap.bytesTransferred/snap.totalBytes)*100); fill.style.width=pct+"%"; label.textContent=pct+"%"; },
      err  => { label.textContent="Upload failed: "+err.message; },
      async () => { uploadedMediaUrl=await ref.getDownloadURL(); document.getElementById("pMediaUrl").value=uploadedMediaUrl; label.textContent="Uploaded!"; }
    );
  } else { uploadedMediaUrl = objUrl; }
}