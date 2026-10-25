import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const api = axios.create({ baseURL: API_BASE_URL || window.location.origin, timeout: 15000 });
const EMPTY_DETAIL = "층에서 기업을 선택하면 상세정보가 표시됩니다.";
function adminApiReady() {
  if (!API_BASE_URL) return false;
  try {
    const url = new URL(API_BASE_URL);
    return url.protocol === "https:" || (import.meta.env.DEV && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  } catch { return false; }
}
function safeWebsite(value) {
  return /^https?:\/\//i.test(value || "") ? value : "";
}

function IndustryDetails({ industry }) {
  if (!industry) return null;
  const verified = industry.status === "verified";
  const sources = (industry.sources || []).filter((source) => safeWebsite(source.url));
  return (
    <section className="industry-evidence" aria-label="업종 확인 근거">
      <h4>공개자료 기준 업종</h4>
      <p className={`industry-status ${verified ? "verified" : "unverified"}`}>
        {verified ? (industry.sourceType === "official" ? "공식자료 확인" : "공개 기업정보 확인") : "확인 근거 부족"}
        {industry.reviewedAt ? ` · ${industry.reviewedAt}` : ""}
      </p>
      {industry.industryDetail ? <p>{industry.industryDetail}</p> : null}
      {industry.note ? <p className="industry-note">{industry.note}</p> : null}
      {sources.length ? (
        <ul className="industry-sources">
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.title || "업종 확인 자료"}</a>
              {source.evidence ? <p>{source.evidence}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {industry.matchBasis ? <p className="industry-match">대조 기준: {industry.matchBasis}</p> : null}
    </section>
  );
}
const SMAP_BASE_URL = import.meta.env.VITE_SMAP_URL || "https://smap.seoul.go.kr/";
const BUILDING_LAT = Number(import.meta.env.VITE_BUILDING_LAT || 37.4796);
const BUILDING_LNG = Number(import.meta.env.VITE_BUILDING_LNG || 126.8844);

function buildSMapLink() {
  const url = new URL(SMAP_BASE_URL);
  const params = new URLSearchParams(url.search);

  // 좌표 전달: S-MAP이 사용하는 파라미터가 변경될 수 있어 일반 좌표 키를 함께 전달합니다.
  params.set("lat", String(BUILDING_LAT));
  params.set("lng", String(BUILDING_LNG));
  params.set("lon", String(BUILDING_LNG));
  params.set("center", `${BUILDING_LNG},${BUILDING_LAT}`);
  params.set("zoom", "18");
  params.set("source", "sh-dreamtower-portal");

  url.search = params.toString();
  return url.toString();
}

function compareFloors(a, b) {
  const parse = (value) => {
    const basementMatch = value.match(/^B(\d+)F$/i);
    if (basementMatch) {
      return -Number(basementMatch[1]);
    }

    const floorMatch = value.match(/^(\d+)F$/i);
    if (floorMatch) {
      return Number(floorMatch[1]);
    }

    return -999;
  };

  return parse(b) - parse(a);
}

function buildFloorsFromTenants(tenantList) {
  const floorMap = new Map();
  tenantList.forEach((tenant) => {
    floorMap.set(tenant.floorCode, (floorMap.get(tenant.floorCode) || 0) + 1);
  });

  return Array.from(floorMap.entries())
    .map(([floorCode, tenantCount]) => ({ floorCode, tenantCount }))
    .sort((a, b) => compareFloors(a.floorCode, b.floorCode));
}

function PortalPage() {
  const [dataMode, setDataMode] = useState(
    !API_BASE_URL ? "static" : "api"
  );
  const [floors, setFloors] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [sourceInfo, setSourceInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (!selectedFloor) {
      return;
    }
    fetchTenantsByFloor(selectedFloor);
  }, [selectedFloor, dataMode, allTenants]);

  const selectedFloorLabel = useMemo(() => {
    if (!selectedFloor) {
      return "층 선택 필요";
    }
    return `${selectedFloor} 선택됨`;
  }, [selectedFloor]);

  async function loadStaticTenants() {
    const response = await fetch(`${import.meta.env.BASE_URL}data/tenants.json`);
    if (!response.ok) {
      throw new Error(`정적 데이터 로드 실패(${response.status})`);
    }
    const data = await response.json();
    setSourceInfo(data);
    return data.tenants || [];
  }

  async function fetchFloors() {
    if (dataMode === "static") {
      try {
        const staticTenants = await loadStaticTenants();
        const nextFloors = buildFloorsFromTenants(staticTenants);
        setAllTenants(staticTenants);
        setFloors(nextFloors);
        if (nextFloors.length > 0) {
          setSelectedFloor(nextFloors[0].floorCode);
        }
        setMessage("");
      } catch (error) {
        setMessage(`정적 데이터 조회 실패: ${error.message}`);
      }
      return;
    }

    try {
      const { data } = await api.get("/api/floors");
      setSourceInfo(data);
      const nextFloors = data.floors || [];
      setFloors(nextFloors);
      if (nextFloors.length > 0) {
        setSelectedFloor(nextFloors[0].floorCode);
      }
      setMessage("");
    } catch (error) {
      try {
        const staticTenants = await loadStaticTenants();
        const nextFloors = buildFloorsFromTenants(staticTenants);
        setDataMode("static");
        setAllTenants(staticTenants);
        setFloors(nextFloors);
        if (nextFloors.length > 0) {
          setSelectedFloor(nextFloors[0].floorCode);
        }
        setMessage("최근 저장된 입주사 안내를 표시합니다.");
      } catch (fallbackError) {
        setMessage(`층 정보 조회 실패: ${fallbackError.message}`);
      }
    }
  }

  async function fetchTenantsByFloor(floorCode) {
    if (dataMode === "static") {
      const filtered = allTenants
        .filter((tenant) => tenant.floorCode === floorCode)
        .sort((a, b) => String(a.unit).localeCompare(String(b.unit)));
      setTenants(filtered);
      setSelectedTenant(null);
      return;
    }

    try {
      const { data } = await api.get(`/api/floors/${floorCode}/tenants`);
      setTenants(data.tenants || []);
      setSelectedTenant(null);
    } catch (error) {
      setMessage(`층별 기업 조회 실패: ${error.message}`);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!keyword.trim()) {
      setSearchResult([]);
      setSearchedKeyword("");
      return;
    }

    if (dataMode === "static") {
      const normalized = keyword.trim().toLowerCase();
      const filtered = allTenants.filter((tenant) => {
        return [tenant.name, tenant.unit, tenant.floorCode, tenant.category, tenant.industry?.industryDetail, tenant.description, ...(tenant.aliases || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      });
      setSearchResult(filtered);
      setSearchedKeyword(keyword.trim());
      setSelectedTenant(null);
      return;
    }

    try {
      const { data } = await api.get("/api/tenants", {
        params: { keyword: keyword.trim() },
      });
      setSearchResult(data.tenants || []);
      setSearchedKeyword(keyword.trim());
      setSelectedTenant(null);
    } catch (error) {
      setMessage(`검색 실패: ${error.message}`);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">SH DREAMTOWER LIVE PORTAL</p>
          <h1>운영형 층별 입주기업 포털</h1>
          <p className="subtitle">층 선택과 기업 상세정보 조회를 단일 화면에서 제공합니다.</p>
        </div>
        <div className="hero-actions">
          <a className="nav-link" href={buildSMapLink()} target="_blank" rel="noreferrer">
            S-MAP 바로가기
          </a>
          <a className="nav-link" href={`${import.meta.env.BASE_URL}?admin=1`}>
            관리자 이동
          </a>
        </div>
      </header>

      {message ? <div className="message">{message}</div> : null}

      {sourceInfo?.updatedAt ? (
        <section className="panel source-note" aria-label="입주사 정보 출처">
          <strong>입주사 안내 · {(sourceInfo.boardUpdatedAt || sourceInfo.updatedAt).slice(0, 10)} 반영</strong>
          <p>{sourceInfo.source || "입주사 안내 자료"}</p>
          <p>{sourceInfo.sourceNote || "동일 기업의 복수 호실은 각각 표시합니다."}</p>
          <p>안내판 미표기 호실은 공실 여부가 확인되지 않은 곳입니다.</p>
          {sourceInfo.industrySummary ? (
            <div className="industry-summary">
              <strong>입주업종 · {sourceInfo.industryUpdatedAt} 인터넷 조사</strong>
              <p>상호 기준 {sourceInfo.industrySummary.reviewedCompanies}개 조사 · 업종 확인 {sourceInfo.industrySummary.verifiedCompanies}개 · 미확인 {sourceInfo.industrySummary.unverifiedCompanies}개</p>
              <p>기업을 선택하면 사업분야와 확인 출처를 볼 수 있습니다. 업종으로도 검색할 수 있습니다.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="model-wrap panel">
        <div className="panel-title">건물 모델링 이미지</div>
        <img src={`${import.meta.env.BASE_URL}SHDREAMTOWER.png`} alt="SH드림타워 건물 모델링" className="model-image" />
      </section>

      <section className="layout">
        <aside className="panel floors-panel">
          <div className="panel-title">층 선택</div>
          <nav className="floor-nav">
            {floors.map((floor) => (
              <button
                key={floor.floorCode}
                className={`floor-btn ${selectedFloor === floor.floorCode ? "active" : ""}`}
                onClick={() => {
                  setSelectedFloor(floor.floorCode);
                  setKeyword("");
                  setSearchedKeyword("");
                  setSearchResult([]);
                  setSelectedTenant(null);
                }}
              >
                <span>{floor.floorCode}</span>
                <small>{floor.tenantCount}개 항목</small>
              </button>
            ))}
          </nav>
        </aside>

        <section className="panel tenants-panel">
          <div className="panel-title-row">
            <div className="panel-title">입주기업 목록</div>
            <div className="chip">{searchedKeyword ? "전체 층 검색" : selectedFloorLabel}</div>
          </div>

          <form className="search-row" onSubmit={handleSearch}>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="기업명 / 호실 / 업종 검색"
              aria-label="기업명, 호실 또는 업종 검색"
            />
            <button type="submit">검색</button>
          </form>

          {searchedKeyword ? <p className="search-summary" role="status">“{searchedKeyword}” 검색 결과 {searchResult.length}건</p> : null}
          {searchedKeyword && searchResult.length === 0 ? <p className="detail-empty">일치하는 기업·호실·업종이 없습니다.</p> : null}
          <div className="tenant-list">
            {(searchedKeyword ? searchResult : tenants).map((tenant) => (
              <article
                key={tenant.id}
                className={`tenant-card ${selectedTenant?.id === tenant.id ? "active" : ""}`}
                onClick={() => setSelectedTenant(tenant)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTenant(tenant);
                  }
                }}
              >
                <div className="tenant-unit">{tenant.floorCode} / {tenant.unit}</div>
                <div className="tenant-name">{tenant.name}</div>
                <div className="tenant-category">{tenant.category}</div>
                {tenant.transcriptionNote ? <div className="transcription-note">상호명 판독 확인 필요</div> : null}
              </article>
            ))}
          </div>
        </section>

        <aside className="panel detail-panel">
          <div className="panel-title">기업 상세정보</div>
          {!selectedTenant ? (
            <div className="detail-empty">{EMPTY_DETAIL}</div>
          ) : (
            <div className="detail">
              <h3>{selectedTenant.name}</h3>
              <div className="tag">{selectedTenant.category}</div>
              <div className="meta">
                <div>층/호실: {selectedTenant.floorCode} / {selectedTenant.unit}</div>
                <div>전화: {selectedTenant.phone || "-"}</div>
                <div>이메일: {selectedTenant.email || "-"}</div>
                <div>좌표: {BUILDING_LAT}, {BUILDING_LNG}</div>
                <div>
                  웹사이트: {safeWebsite(selectedTenant.website) ? <a href={safeWebsite(selectedTenant.website)}>{selectedTenant.website}</a> : "-"}
                </div>
              </div>
              <p className="desc">{selectedTenant.description || "상세 설명이 없습니다."}</p>
              <IndustryDetails industry={selectedTenant.industry} />
              {selectedTenant.transcriptionNote ? <p className="transcription-note">{selectedTenant.transcriptionNote}</p> : null}
              <a className="map-link" href={buildSMapLink()} target="_blank" rel="noreferrer">
                S-MAP에서 건물 위치 보기
              </a>
            </div>
          )}
        </aside>
      </section>
      {sourceInfo?.sourceImage === "data/tenant-board-2026-10-25.jpg" ? (
        <details className="panel source-board">
          <summary>입주사 안내판 원본 보기</summary>
          <a href={`${import.meta.env.BASE_URL}${sourceInfo.sourceImage}`} target="_blank" rel="noreferrer">원본 크게 보기</a>
          <img src={`${import.meta.env.BASE_URL}${sourceInfo.sourceImage}`} alt="2026년 10월 25일 제공된 SH드림타워 입주사 안내판. 촬영일 미상." loading="lazy" />
        </details>
      ) : null}
    </main>
  );
}

function AdminPage() {
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [token, setToken] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    if (!adminApiReady()) { setAuthError("관리자 서버가 설정되지 않았습니다. 공개 안내는 계속 이용하실 수 있습니다."); return; }
    try {
      await api.get("/api/admin/session", { headers: { Authorization: `Bearer ${password}` } });
      setToken(password);
      setPassword("");
      setIsAuthed(true);
      setMessage("관리자 인증이 완료되었습니다.");
    } catch { setAuthError("관리자 인증에 실패했습니다. 키와 서버 설정을 확인하세요."); }
  }

  function handleLogout() {
    setToken("");
    setIsAuthed(false);
    setUploadFile(null);
    setPassword("");
    setMessage("로그아웃되었습니다.");
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!uploadFile) {
      setMessage("업로드할 파일을 선택하세요.");
      return;
    }

    if (uploadFile.size > 2 * 1024 * 1024) { setMessage("2MB 이하의 파일만 업로드할 수 있습니다."); return; }
    const form = new FormData();
    form.append("file", uploadFile);

    try {
      setLoading(true);
      const { data } = await api.post("/api/admin/tenants/import", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(`업로드 완료: ${data.importedCount}건 반영, 총 ${data.totalCount}건`);
      setUploadFile(null);
    } catch (error) {
      setMessage(`업로드 실패: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell admin-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">SH DREAMTOWER ADMIN</p>
          <h1>입주기업 관리자</h1>
          <p className="subtitle">엑셀/CSV 파일 업로드로 입주기업 데이터를 일괄 반영합니다.</p>
        </div>
        <div className="hero-actions">
          {isAuthed ? (
            <button className="nav-link" onClick={handleLogout} type="button">
              로그아웃
            </button>
          ) : null}
          <a className="nav-link" href={import.meta.env.BASE_URL}>
            포털 이동
          </a>
        </div>
      </header>

      {message ? <div className="message">{message}</div> : null}

      {!isAuthed ? (
        <section className="panel admin-panel">
          <div className="panel-title">관리자 로그인</div>
          <p className="admin-desc">서버에서 발급한 관리자 키로 로그인합니다. 키는 이 창을 닫으면 삭제됩니다.</p>

          <form className="admin-form" onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="관리자 키"
              autoComplete="off"
            />
            <button type="submit">로그인</button>
          </form>

          {authError ? <div className="error-message">{authError}</div> : null}
        </section>
      ) : (
        <section className="panel admin-panel">
          <div className="panel-title">데이터 업로드</div>
          <p className="admin-desc">
            최대 2MB / 2,000행. 첫 시트 컬럼: floorCode, unit, name, category, phone, email, website, description, status
          </p>

          <form className="admin-form" onSubmit={handleUpload}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "업로드 중..." : "업로드 반영"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function App() {
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1" || window.location.pathname.endsWith("/admin");
  return isAdmin ? <AdminPage /> : <PortalPage />;
}

export default App;

