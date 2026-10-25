function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function websiteLink(value) {
  return /^https?:\/\//i.test(value || "") ? `<a href="${escapeHtml(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>` : "-";
}
const floorNav = document.getElementById("floorNav");
const selectedFloorEl = document.getElementById("selectedFloor");
const tenantListEl = document.getElementById("tenantList");
const tenantDetailEl = document.getElementById("tenantDetail");

let buildingData = [];
let selectedFloor = null;
let selectedTenant = null;

function createFloorButtons() {
  floorNav.innerHTML = "";

  buildingData.forEach((floorData) => {
    const button = document.createElement("button");
    button.className = "floor-btn";
    button.textContent = floorData.floor;

    if (floorData.floor === selectedFloor.floor) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedFloor = floorData;
      selectedTenant = null;
      render();
    });

    floorNav.appendChild(button);
  });
}

function createTenantCards() {
  tenantListEl.innerHTML = "";

  selectedFloor.tenants.forEach((tenant) => {
    const card = document.createElement("article");
    card.className = "tenant-card";
    if (selectedTenant && selectedTenant.unit === tenant.unit) {
      card.classList.add("active");
    }

    card.innerHTML = `
      <div class="tenant-unit">${escapeHtml(tenant.unit)}</div>
      <div class="tenant-name">${escapeHtml(tenant.name)}</div>
    `;

    card.addEventListener("click", () => {
      selectedTenant = tenant;
      render();
    });

    tenantListEl.appendChild(card);
  });
}

function createTenantDetail() {
  if (!selectedTenant) {
    tenantDetailEl.className = "detail-empty";
    tenantDetailEl.innerHTML = "기업 카드를 선택하면 상세 정보가 표시됩니다.";
    return;
  }

  tenantDetailEl.className = "detail";
  tenantDetailEl.innerHTML = `
    <h3>${escapeHtml(selectedTenant.name)}</h3>
    <div class="tag">${escapeHtml(selectedTenant.category)}</div>
    <div class="meta">
      <div>층/호실: ${escapeHtml(selectedFloor.floor)} / ${escapeHtml(selectedTenant.unit)}</div>
      <div>전화: ${escapeHtml(selectedTenant.phone || "-")}</div>
      <div>이메일: ${escapeHtml(selectedTenant.email || "-")}</div>
      <div>웹사이트: ${websiteLink(selectedTenant.website)}</div>
    </div>
    <p class="desc">${escapeHtml([selectedTenant.description, selectedTenant.transcriptionNote].filter(Boolean).join(" "))}</p>
  `;
}

function render() {
  selectedFloorEl.textContent = `${escapeHtml(selectedFloor.floor)} 선택됨`;
  createFloorButtons();
  createTenantCards();
  createTenantDetail();
}

async function loadDirectory() {
  try {
    const response = await fetch("./client/public/data/tenants.json");
    if (!response.ok) throw new Error("입주사 자료를 불러올 수 없습니다.");
    const data = await response.json();
    const byFloor = new Map();
    data.tenants.forEach((tenant) => {
      if (!byFloor.has(tenant.floorCode)) byFloor.set(tenant.floorCode, []);
      byFloor.get(tenant.floorCode).push(tenant);
    });
    buildingData = Array.from(byFloor, ([floor, tenants]) => ({ floor, tenants }));
    selectedFloor = buildingData[0];
    document.querySelector(".subtitle").textContent = `${data.updatedAt} 반영 · 제공된 입주사 안내판 기준 · 미표기는 공실을 뜻하지 않습니다.`;
    if (selectedFloor) render();
  } catch (error) {
    tenantListEl.textContent = error.message;
  }
}
loadDirectory();
