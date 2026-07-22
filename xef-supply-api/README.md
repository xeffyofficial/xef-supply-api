# XEF Supply API — Vercel 배포 가이드 (비개발자용)

## 이 프로젝트가 하는 일

Google Sheet의 토큰노믹스(TGE 날짜, 클리프, 베스팅 기간)를 코드로 그대로 옮겨서, **날짜가 지날 때마다 자동으로 계산되는 API**를 만듭니다. 코인게코/CMC에 제출할 때 이 API 주소만 넣으면 됩니다.

- **Total Supply**: `6,000,000,000` (고정값)
- **Circulating Supply**: 매 요청마다 오늘 날짜 기준으로 자동 재계산 (사람이 매번 엑셀 갱신 안 해도 됨)

시트 값(2026-07-22 기준 1,497,420,246)과 **정확히 일치하도록 검증 완료**된 로직입니다.

## 파일 구조 (다운로드 후 반드시 이 구조로 정리하세요)

```
xef-supply-api/
├── package.json
├── lib/
│   └── vesting.js
└── api/
    ├── total-supply.js
    ├── circulating-supply.js
    └── supply/
        ├── index.js
        └── breakdown.js
```

⚠️ **가장 중요한 주의사항**: 파일을 다운로드하면 폴더 구조가 사라지고 파일명만 남습니다. 컴퓨터에서 위 구조 그대로 폴더/하위폴더를 직접 만들어서 파일을 넣어주셔야 해요. (`api` 폴더 안에 `supply`라는 하위 폴더가 있고, 그 안에 `index.js`와 `breakdown.js`가 들어갑니다 — `lib` 폴더 안에 `api` 폴더가 잘못 들어가지 않도록 최상단에 나란히 두세요)

## 단계별 배포

### 1. GitHub 저장소 만들기

1. [github.com](https://github.com) 로그인 → 오른쪽 위 `+` → **New repository**
2. 이름 입력 (예: `xef-supply-api`) → **Create repository**

### 2. 파일 업로드

1. 저장소 페이지에서 **Add file → Upload files**
2. 컴퓨터에서 위 폴더 구조대로 정리해둔 `xef-supply-api` 폴더를 **통째로** 화면에 드래그 앤 드롭
   - 폴더째로 드래그하면 GitHub가 내부 구조(`lib/`, `api/`, `api/supply/`)를 그대로 인식합니다
3. 하단 **Commit changes** 클릭

**업로드 후 꼭 확인하세요**: 저장소 메인 페이지에 `package.json`, `lib`, `api`가 **바로** 보여야 합니다. `xef-supply-api`라는 폴더 하나만 보이고 그 안에 들어가야 파일이 나오면, 폴더가 한 겹 더 씌워진 것이니 다시 정리해서 올려주세요.

### 3. Vercel에 배포

1. [vercel.com](https://vercel.com) → **Sign Up** → **Continue with GitHub**
2. 대시보드에서 **Add New... → Project**
3. 방금 만든 `xef-supply-api` 저장소 옆 **Import** 클릭
4. 설정 화면에서 아무것도 건드리지 말고 **Deploy** 클릭
5. 30초~1분 후 배포 완료, `https://xef-supply-api-xxxx.vercel.app` 같은 주소가 자동 생성됨

### 4. 작동 확인

브라우저에서 아래 두 주소를 각각 열어보세요:

```
https://당신의주소.vercel.app/api/total-supply
→ 6000000000 이라는 숫자만 나오면 성공

https://당신의주소.vercel.app/api/circulating-supply
→ 1497420246 근처의 숫자만 나오면 성공 (날짜 지날수록 조금씩 증가함)
```

## 코인게코/CMC 제출 시 넣을 값

| 항목 | 값 |
|---|---|
| Total Supply API | `https://당신의주소.vercel.app/api/total-supply` |
| Circulating Supply API | `https://당신의주소.vercel.app/api/circulating-supply` |

두 엔드포인트 모두 **인증 없이 접근 가능한 순수 텍스트 숫자**를 반환하므로, 거래소/데이터 사이트의 표준 형식 요건을 그대로 충족합니다.

## 참고용 추가 엔드포인트 (선택)

- `https://당신의주소.vercel.app/api/supply` → total/circulating을 JSON으로 한 번에 확인
- `https://당신의주소.vercel.app/api/supply/breakdown` → 카테고리별 상세 내역 (심사 시 근거자료로 첨부하면 좋음)

## 나중에 토큰노믹스가 바뀌면?

`lib/vesting.js` 파일 안의 `CATEGORIES` 배열 숫자만 수정해서 GitHub에 다시 커밋하면, Vercel이 몇 초 안에 자동으로 재배포합니다. 서버를 새로 만들 필요 없습니다.

## 문제가 생기면

- **404 에러가 뜬다** → 대부분 폴더 구조 문제입니다. Vercel 프로젝트 → Deployments → 최근 배포 클릭 → "Source" 탭에서 실제로 어떤 파일이 올라갔는지 확인해보세요.
- **숫자 대신 에러 메시지가 뜬다** → Vercel 프로젝트 → Deployments → 최근 배포 → Build Logs에서 에러 내용을 확인해보세요.
