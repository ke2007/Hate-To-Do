# 📅 Hate To Do

  "할 일을 싫어하는 사람들을 위한" Electron 기반 데스크톱 할 일 관리 애플리케이션입니다.

  ## ✨ 주요 기능

  ### 📊 대시보드
  - 할 일 완료율 통계
  - D3.js를 활용한 시각적 데이터 차트
  - 진행 상황 한눈에 보기
  - 생산성 트래킹

  ### 📅 캘린더 통합
  - 월별/주별 캘린더 뷰
  - 날짜별 할 일 관리
  - 일정 시각화
  - 마감일 알림

  ### ✅ 할 일 관리
  - 직관적인 할 일 추가/수정/삭제
  - 우선순위 설정
  - 카테고리별 분류
  - 완료 상태 토글

  ### 📝 메모 기능
  - 빠른 메모 작성
  - 할 일과 연동 가능한 노트
  - 아이디어 저장 공간

  ### 🎨 사용자 경험
  - 부드러운 애니메이션
  - 직관적인 UI/UX
  - 한글 폰트 최적화

  ## 🚀 시작하기

  ### 필수 요구사항
  - Node.js (v16 이상)
  - npm 또는 yarn

  ### 설치 및 실행

  ```bash
  # 저장소 클론
  git clone https://github.com/ke2007/Hate-To-Do.git
  cd Hate-To-Do

  # 의존성 설치
  npm install

  # 개발 모드 실행
  npm run dev

  # 또는 일반 실행
  npm start

  빌드 및 배포

  # Windows용 빌드
  npm run build:win

  📂 프로젝트 구조

  Hate-To-Do/
  ├── scripts/              # 프론트엔드 스크립트
  │   ├── app.js           # 메인 애플리케이션 로직
  │   ├── calendar.js      # 캘린더 기능
  │   ├── dashboard.js     # 대시보드 통계
  │   ├── todo-controller.js # 할 일 관리
  │   ├── memo.js          # 메모 기능
  │   ├── animations.js    # UI 애니메이션
  │   ├── api.js           # 데이터 API
  │   ├── state.js         # 상태 관리
  │   ├── ui.js            # UI 컨트롤러
  │   ├── utils.js         # 유틸리티 함수
  │   └── lib/             # 외부 라이브러리
  │       ├── d3.v7.min.js # D3.js 데이터 시각화
  │       ├── rough.min.js # 손그림 스타일 그래픽
  │       └── index.global.min.js
  ├── styles/
  │   └── app.css          # 메인 스타일시트
  ├── fonts/               # 한글 폰트 파일
  │   ├── BMJUA_ttf.ttf
  │   ├── GmarketSans*.ttf
  │   └── 경기천년제목*.ttf
  ├── image_claude/        # 스크린샷 및 이미지
  ├── main.js              # Electron 메인 프로세스
  ├── preload.js           # Electron 프리로드 스크립트
  ├── index.html           # 메인 HTML
  ├── splash.html          # 스플래시 화면
  └── package.json         # 프로젝트 설정

  🛠️ 기술 스택

  데스크톱 앱

  - Electron - 크로스 플랫폼 데스크톱 앱 프레임워크
  - Node.js - JavaScript 런타임

  프론트엔드

  - Vanilla JavaScript - 순수 JavaScript로 구현
  - HTML5/CSS3 - 현대적인 웹 표준
  - D3.js - 데이터 시각화
  - Rough.js - 손그림 스타일 그래픽

  디자인

  - 한글 폰트 지원 - 경기천년제목체
  - 반응형 디자인 - 다양한 화면 크기 지원
  - 애니메이션 - 부드러운 사용자 경험

  🎯 주요 특징

  💡 사용자 친화적 설계

  - "할 일을 싫어하는" 사용자를 위한 직관적 인터페이스
  - 복잡함을 배제한 심플한 디자인
  - 빠른 접근성과 사용 편의성 중시

  📈 생산성 향상

  - 시각적 진행률 표시
  - 목표 달성 동기부여
  - 효율적인 시간 관리 도구

  🎨 개성 있는 디자인

  - 손그림 스타일의 차트와 그래픽
  - 따뜻하고 친근한 UI
  - 한국어 사용자를 위한 폰트 최적화

  📋 사용법

  1. 할 일 추가

  - 메인 화면에서 "+" 버튼 클릭
  - 할 일 제목과 내용 입력
  - 우선순위 및 마감일 설정

  2. 캘린더 보기

  - 캘린더 탭에서 월별/주별 뷰 전환
  - 날짜 클릭으로 해당일 할 일 확인
  - 드래그 앤 드롭으로 일정 이동

  3. 대시보드 확인

  - 완료율 및 진행 통계 확인
  - 생산성 트렌드 분석
  - 목표 달성 현황 모니터링

  4. 메모 작성

  - 빠른 아이디어 기록
  - 할 일과 연결된 상세 메모
  - 검색 기능으로 빠른 조회

  🔧 개발 스크립트

  # 개발 서버 시작 (Hot Reload)
  npm run dev

  # 프로덕션 빌드
  npm run build

  # Electron 앱 시작
  npm start

  # 코드 린트 검사
  npm run lint

  # 테스트 실행
  npm test

  📦 빌드 및 배포

  Windows

  npm run build:win
  # → dist/Hate-To-Do Setup.exe

  🤝 기여하기

  1. 이 저장소를 포크합니다
  2. 새로운 기능 브랜치를 생성합니다 (git checkout -b feature/새기능)
  3. 변경사항을 커밋합니다 (git commit -am '새 기능 추가')
  4. 브랜치에 푸시합니다 (git push origin feature/새기능)
  5. Pull Request를 생성합니다


  🐛 알려진 이슈

  현재 알려진 주요 이슈가 없습니다. 버그를 발견하시면 이슈를 등록해 주세요.

  📄 라이선스

  이 프로젝트는 MIT 라이선스 하에 배포됩니다.

  🙋‍♂️ 문의 및 지원

  - 이슈 리포팅: GitHub Issues 탭에서 버그 신고 및 기능 제안
  - 기능 요청: Discussion 탭에서 새로운 아이디어 공유
  - 개발 문의: 프로젝트 관련 질문은 이슈로 등록

  ---
  "할 일을 싫어해도, 관리는 쉽게" - Hate To Do
