import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4100",
});

const EMPTY_DETAIL = "층에서 기업을 선택하면 상세정보가 표시됩니다.";
const ADMIN_SESSION_KEY = "shdt_admin_authed";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "Dream@12";
const EIGHT_WITH_SPECIAL = /^(?=.*[^A-Za-z0-9]).{8}$/;

function PortalPage() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (!selectedFloor) {
      return;
    }
    fetchTenantsByFloor(selectedFloor);
  }, [selectedFloor]);

  const selectedFloorLabel = useMemo(() => {
    if (!selectedFloor) {
      return "층 선택 필요";
    }
    return `${selectedFloor} 선택됨`;
  }, [selectedFloor]);

  async function fetchFloors() {
    try {
      const { data } = await api.get("/api/floors");
      const nextFloors = data.floors || [];
      setFloors(nextFloors);
      if (nextFloors.length > 0) {
        setSelectedFloor(nextFloors[0].floorCode);
      }
    } catch (error) {
      setMessage(`층 정보 조회 실패: ${error.message}`);
    }
  }

  async function fetchTenantsByFloor(floorCode) {
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
      return;
    }

    try {
      const { data } = await api.get("/api/tenants", {
        params: { keyword: keyword.trim() },
      });
      setSearchResult(data.tenants || []);
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
          <a className="nav-link" href="/admin">
            관리자 이동
          </a>
        </div>
      </header>

      {message ? <div className="message">{message}</div> : null}

      <section className="model-wrap panel">
        <div className="panel-title">건물 모델링 이미지</div>
        <img src="/SHDREAMTOWER.png" alt="SH드림타워 건물 모델링" className="model-image" />
      </section>

      <section className="layout">
        <aside className="panel floors-panel">
          <div className="panel-title">층 선택</div>
          <nav className="floor-nav">
            {floors.map((floor) => (
              <button
                key={floor.floorCode}
                className={`floor-btn ${selectedFloor === floor.floorCode ? "active" : ""}`}
                onClick={() => setSelectedFloor(floor.floorCode)}
              >
                <span>{floor.floorCode}</span>
                <small>{floor.tenantCount}개사</small>
              </button>
            ))}
          </nav>
        </aside>

        <section className="panel tenants-panel">
          <div className="panel-title-row">
            <div className="panel-title">입주기업 목록</div>
            <div className="chip">{selectedFloorLabel}</div>
          </div>

          <form className="search-row" onSubmit={handleSearch}>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="기업명/호실 검색"
            />
            <button type="submit">검색</button>
          </form>

          <div className="tenant-list">
            {(searchResult.length > 0 ? searchResult : tenants).map((tenant) => (
              <article
                key={tenant.id}
                className={`tenant-card ${selectedTenant?.id === tenant.id ? "active" : ""}`}
                onClick={() => setSelectedTenant(tenant)}
              >
                <div className="tenant-unit">{tenant.floorCode} / {tenant.unit}</div>
                <div className="tenant-name">{tenant.name}</div>
                <div className="tenant-category">{tenant.category}</div>
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
                <div>
                  웹사이트: {selectedTenant.website ? <a href={selectedTenant.website}>{selectedTenant.website}</a> : "-"}
                </div>
              </div>
              <p className="desc">{selectedTenant.description || "상세 설명이 없습니다."}</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function AdminPage() {
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthed, setIsAuthed] = useState(() => {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  });

  function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    if (!EIGHT_WITH_SPECIAL.test(password)) {
      setAuthError("비밀번호 형식 오류: 특수기호 포함 정확히 8자리여야 합니다.");
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setAuthError("비밀번호가 일치하지 않습니다.");
      return;
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    setIsAuthed(true);
    setPassword("");
    setMessage("관리자 인증이 완료되었습니다.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
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

    const form = new FormData();
    form.append("file", uploadFile);

    try {
      setLoading(true);
      const { data } = await api.post("/api/admin/tenants/import", form, {
        headers: {
          "Content-Type": "multipart/form-data",
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
          <a className="nav-link" href="/">
            포털 이동
          </a>
        </div>
      </header>

      {message ? <div className="message">{message}</div> : null}

      {!isAuthed ? (
        <section className="panel admin-panel">
          <div className="panel-title">관리자 로그인</div>
          <p className="admin-desc">비밀번호는 특수기호 포함 8자리입니다.</p>

          <form className="admin-form" onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="관리자 비밀번호"
            />
            <button type="submit">로그인</button>
          </form>

          {authError ? <div className="error-message">{authError}</div> : null}
        </section>
      ) : (
        <section className="panel admin-panel">
          <div className="panel-title">데이터 업로드</div>
          <p className="admin-desc">
            첫 시트 컬럼: floorCode, unit, name, category, phone, email, website, description, status
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
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminPage /> : <PortalPage />;
}

export default App;
