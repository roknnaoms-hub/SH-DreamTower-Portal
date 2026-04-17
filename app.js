const buildingData = [
  {
    floor: "14F",
    tenants: [
      {
        unit: "1401",
        name: "성호전자(주)",
        category: "전자부품",
        phone: "02-0000-1401",
        email: "contact1401@dreamtower.co.kr",
        website: "https://example.com/1401",
        description: "옥상정원 및 휴게공간 인접층 입주기업으로 내방객 안내 수요가 높은 기업입니다.",
      },
    ],
  },
  {
    floor: "13F",
    tenants: [
      {
        unit: "1301",
        name: "성호전자(주)",
        category: "전자부품",
        phone: "02-0000-1301",
        email: "contact1301@dreamtower.co.kr",
        website: "https://example.com/1301",
        description: "상층 회의실 인접 기업으로 회의실 예약 안내와 연동하기 좋습니다.",
      },
      {
        unit: "1302",
        name: "성호전자(주)",
        category: "전자부품",
        phone: "02-0000-1302",
        email: "contact1302@dreamtower.co.kr",
        website: "https://example.com/1302",
        description: "동일 기업 확장 호실입니다.",
      },
    ],
  },
  {
    floor: "12F",
    tenants: [
      {
        unit: "1201",
        name: "주식회사 투빅",
        category: "IT 서비스",
        phone: "02-0000-1201",
        email: "info@2big.co.kr",
        website: "https://example.com/1201",
        description: "플랫폼/웹 개발 중심 기업.",
      },
      {
        unit: "1204",
        name: "무사퇴근",
        category: "SaaS",
        phone: "02-0000-1204",
        email: "hello@musatoegeun.com",
        website: "https://example.com/1204",
        description: "업무 생산성 SaaS를 운영하는 스타트업.",
      },
    ],
  },
  {
    floor: "11F",
    tenants: [
      {
        unit: "1103",
        name: "세무회계 현솔",
        category: "전문서비스",
        phone: "02-0000-1103",
        email: "tax@hyeonsol.kr",
        website: "https://example.com/1103",
        description: "세무/회계 전문 법인.",
      },
      {
        unit: "1104",
        name: "YU & PARTNERS",
        category: "법률/자문",
        phone: "02-0000-1104",
        email: "info@yu-partners.com",
        website: "https://example.com/1104",
        description: "기업 자문 중심의 컨설팅 그룹.",
      },
    ],
  },
  {
    floor: "10F",
    tenants: [
      {
        unit: "1001",
        name: "(주)지엠에스지",
        category: "IT 솔루션",
        phone: "02-0000-1001",
        email: "info@gmsg.kr",
        website: "https://example.com/1001",
        description: "산업 특화 솔루션 개발 기업.",
      },
      {
        unit: "1004",
        name: "주식회사 카티더씨",
        category: "콘텐츠/미디어",
        phone: "02-0000-1004",
        email: "hello@catdc.com",
        website: "https://example.com/1004",
        description: "브랜드 콘텐츠 및 미디어 제작.",
      },
    ],
  },
  {
    floor: "9F",
    tenants: [
      {
        unit: "903",
        name: "주식회사 에스케이엠펀",
        category: "제조/유통",
        phone: "02-0000-0903",
        email: "info@skmfun.com",
        website: "https://example.com/0903",
        description: "제품 유통 및 운영 대행.",
      },
      {
        unit: "907",
        name: "DOWHAT",
        category: "브랜드",
        phone: "02-0000-0907",
        email: "contact@dowhat.co.kr",
        website: "https://example.com/0907",
        description: "브랜드 커뮤니케이션 전문 조직.",
      },
    ],
  },
  {
    floor: "8F",
    tenants: [
      {
        unit: "801",
        name: "유진세무회계사무소",
        category: "전문서비스",
        phone: "02-0000-0801",
        email: "office@yujintax.kr",
        website: "https://example.com/0801",
        description: "중소기업 대상 세무 서비스.",
      },
      {
        unit: "810",
        name: "SH인솔 주식회사",
        category: "B2B",
        phone: "02-0000-0810",
        email: "hello@shinsol.co.kr",
        website: "https://example.com/0810",
        description: "시설/운영 지원 서비스를 제공합니다.",
      },
    ],
  },
  {
    floor: "7F",
    tenants: [
      {
        unit: "704",
        name: "주식회사 카고쿨",
        category: "물류",
        phone: "02-0000-0704",
        email: "contact@cargocool.kr",
        website: "https://example.com/0704",
        description: "콜드체인 물류 서비스 운영.",
      },
      {
        unit: "711",
        name: "IR-TECHNIKA",
        category: "R&D",
        phone: "02-0000-0711",
        email: "lab@ir-technika.com",
        website: "https://example.com/0711",
        description: "전자기기 연구개발 중심 기업.",
      },
    ],
  },
  {
    floor: "6F",
    tenants: [
      {
        unit: "605",
        name: "무사퇴근캠퍼스",
        category: "교육",
        phone: "02-0000-0605",
        email: "campus@musatoegeun.com",
        website: "https://example.com/0605",
        description: "직무 교육 및 워크숍 제공.",
      },
      {
        unit: "614",
        name: "페토웍스",
        category: "펫테크",
        phone: "02-0000-0614",
        email: "hello@petoworks.kr",
        website: "https://example.com/0614",
        description: "반려동물 관련 디지털 서비스.",
      },
    ],
  },
  {
    floor: "5F",
    tenants: [
      {
        unit: "501",
        name: "DKOR",
        category: "디자인",
        phone: "02-0000-0501",
        email: "contact@dkor.kr",
        website: "https://example.com/0501",
        description: "브랜드/공간 디자인 스튜디오.",
      },
      {
        unit: "504",
        name: "THE-U",
        category: "컨설팅",
        phone: "02-0000-0504",
        email: "hello@the-u.co.kr",
        website: "https://example.com/0504",
        description: "기업 성장 컨설팅 제공.",
      },
    ],
  },
  {
    floor: "4F",
    tenants: [
      {
        unit: "406",
        name: "(주)에코제이원 개발연구소",
        category: "환경기술",
        phone: "02-0000-0406",
        email: "rnd@ecoj1.com",
        website: "https://example.com/0406",
        description: "친환경 소재 개발 연구소.",
      },
      {
        unit: "411",
        name: "BLACKLOCKS",
        category: "보안",
        phone: "02-0000-0411",
        email: "team@blacklocks.kr",
        website: "https://example.com/0411",
        description: "보안 장비 및 솔루션 개발.",
      },
    ],
  },
  {
    floor: "3F",
    tenants: [
      {
        unit: "305",
        name: "주식회사 위즈코",
        category: "플랫폼",
        phone: "02-0000-0305",
        email: "info@wizco.kr",
        website: "https://example.com/0305",
        description: "B2B 플랫폼 운영 기업.",
      },
      {
        unit: "311",
        name: "TI 주식회사 티유",
        category: "IT 서비스",
        phone: "02-0000-0311",
        email: "hello@tiyu.kr",
        website: "https://example.com/0311",
        description: "기업용 시스템 구축 및 유지보수.",
      },
    ],
  },
  {
    floor: "2F",
    tenants: [
      {
        unit: "201",
        name: "(주)숲온숲 SM_Free Lounge",
        category: "커뮤니티",
        phone: "02-0000-0201",
        email: "lounge@supsup.kr",
        website: "https://example.com/0201",
        description: "공유 라운지 및 커뮤니티 운영.",
      },
      {
        unit: "206",
        name: "세무회계 세로",
        category: "전문서비스",
        phone: "02-0000-0206",
        email: "tax@sero.kr",
        website: "https://example.com/0206",
        description: "세무/회계 상담 중심 사무소.",
      },
    ],
  },
  {
    floor: "1F",
    tenants: [
      {
        unit: "105",
        name: "SH성공드림 부동산",
        category: "부동산",
        phone: "02-0000-0105",
        email: "office@shdreamestate.co.kr",
        website: "https://example.com/0105",
        description: "입주 및 임대 관련 상담을 제공합니다.",
      },
      {
        unit: "관리사무소",
        name: "시설 관리사무소",
        category: "운영",
        phone: "02-0000-0199",
        email: "admin@shdreamtower.co.kr",
        website: "https://example.com/admin",
        description: "건물 운영 및 시설 민원 대응 창구.",
      },
    ],
  },
  {
    floor: "B1F",
    tenants: [
      {
        unit: "B101",
        name: "성호전자(주)",
        category: "전자부품",
        phone: "02-0000-1101",
        email: "b1@seongho.co.kr",
        website: "https://example.com/b101",
        description: "지하층 물류/보관 기능 연계 호실.",
      },
    ],
  },
  {
    floor: "B2F",
    tenants: [
      {
        unit: "주차장",
        name: "입주사 전용 주차",
        category: "공용시설",
        phone: "02-0000-0299",
        email: "parking@shdreamtower.co.kr",
        website: "https://example.com/parking",
        description: "입주사 및 방문객 전용 주차구역.",
      },
    ],
  },
  {
    floor: "B3F",
    tenants: [
      {
        unit: "주차장",
        name: "입주사 전용 주차",
        category: "공용시설",
        phone: "02-0000-0399",
        email: "parking@shdreamtower.co.kr",
        website: "https://example.com/parking",
        description: "장기 주차 중심의 지하층 구역.",
      },
    ],
  },
  {
    floor: "B4F",
    tenants: [
      {
        unit: "주차장",
        name: "입주사 전용 주차",
        category: "공용시설",
        phone: "02-0000-0499",
        email: "parking@shdreamtower.co.kr",
        website: "https://example.com/parking",
        description: "최하층 주차/설비 구역.",
      },
    ],
  },
];

const floorNav = document.getElementById("floorNav");
const selectedFloorEl = document.getElementById("selectedFloor");
const tenantListEl = document.getElementById("tenantList");
const tenantDetailEl = document.getElementById("tenantDetail");

let selectedFloor = buildingData[0];
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
      <div class="tenant-unit">${tenant.unit}</div>
      <div class="tenant-name">${tenant.name}</div>
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
    <h3>${selectedTenant.name}</h3>
    <div class="tag">${selectedTenant.category}</div>
    <div class="meta">
      <div>층/호실: ${selectedFloor.floor} / ${selectedTenant.unit}</div>
      <div>전화: ${selectedTenant.phone}</div>
      <div>이메일: ${selectedTenant.email}</div>
      <div>웹사이트: <a href="${selectedTenant.website}" target="_blank" rel="noreferrer">${selectedTenant.website}</a></div>
    </div>
    <p class="desc">${selectedTenant.description}</p>
  `;
}

function render() {
  selectedFloorEl.textContent = `${selectedFloor.floor} 선택됨`;
  createFloorButtons();
  createTenantCards();
  createTenantDetail();
}

render();
