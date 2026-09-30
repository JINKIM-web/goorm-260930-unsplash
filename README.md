# 계절 명언 카드

Unsplash의 계절 사진 위에 명언을 얹어 인스타그램용 카드(1:1, 4:5)를 PNG로 만드는 웹앱입니다.
바이브코딩 실무활용 교육과정 실습 프로젝트이며, React + Vite로 만들고 GitHub Pages에 배포합니다.

- 계절 탭과 키워드로 Unsplash 사진 검색 (방향, 색상 필터)
- 내장 명언 선택 또는 직접 입력, 즐겨찾기
- 폰트, 글자 크기, 정렬, 위치, 글자색, 배경 어둡게 조절
- 1080×1080, 1080×1350 PNG 다운로드와 모바일 공유
- 최근 만든 카드 20개, 즐겨찾기, 검색 캐시를 브라우저 localStorage에 저장 (서버 없음)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # VITE_UNSPLASH_ACCESS_KEY에 Access Key 입력
npm run dev
```

`npm test`로 단위 테스트, `npm run build`로 배포용 빌드를 확인할 수 있습니다.

## GitHub Pages 배포

1. 저장소 **Settings → Secrets and variables → Actions**에서 `VITE_UNSPLASH_ACCESS_KEY` 시크릿을 추가합니다.
2. **Settings → Pages**에서 Source를 **GitHub Actions**로 바꿉니다.
3. `main`에 푸시하면 `Deploy to GitHub Pages` 워크플로가 빌드하고 `https://jinkim-web.github.io/goorm-260930-unsplash/`에 배포합니다.

저장소 이름을 바꾸면 `vite.config.ts`의 `base`도 같이 바꿔야 합니다.

## Unsplash API 사용 규칙

- 사진이 보이는 곳마다 "Photo by 작가 on Unsplash"를 링크와 함께 표기합니다. 카드 이미지 안에도 들어갑니다.
- 이미지는 Unsplash가 준 URL을 그대로 쓰고, 이미지 데이터를 저장하지 않습니다.
- PNG를 내려받거나 공유할 때마다 `download_location`을 호출합니다.
- 서버가 없으므로 Access Key는 빌드 결과물에 포함되어 누구나 볼 수 있습니다. 데모(시간당 50회) 키로만 쓰고, `.env.local`은 커밋하지 않습니다.

## 명언 출처

`src/data/quotes.json`에는 저작권 보호 기간이 지난 작가의 문장(일부는 번역)을 넣었습니다. 직접 쓴 문구로 바꾸거나 추가해도 됩니다.
