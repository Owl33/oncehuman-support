# Vercel 간단 배포 가이드

## 🚀 즉시 배포 가능

**현재 상태로 환경 변수 설정 없이도 바로 배포됩니다!**

```bash
git add .
git commit -m "Initial deployment"
git push
```

## 📝 나중에 추가할 수 있는 선택사항들

### Google Analytics (필요시):
```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Google Search Console (필요시):
```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

## Google Search Console 설정

### 1. Google Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" 클릭
3. "URL 접두어" 선택 후 배포된 도메인 입력
4. 소유권 확인을 위해 HTML 태그 방법 선택
5. 제공된 verification 코드를 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 환경 변수에 추가

### 2. 사이트맵 제출
1. Search Console에서 "Sitemaps" 메뉴 선택
2. `https://your-domain.vercel.app/sitemap.xml` 제출
3. 인덱싱 상태 모니터링

### 3. robots.txt 확인
- `https://your-domain.vercel.app/robots.txt` 접속하여 정상 작동 확인

## Google Analytics 설정 (선택사항)

### 1. Google Analytics 4 설정
1. [Google Analytics](https://analytics.google.com) 접속
2. 새 속성 생성
3. 측정 ID (G-XXXXXXXXXX) 복사
4. `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` 환경 변수에 추가

### 2. Analytics 컴포넌트 추가
기본 설정이 완료되어 있으며, 환경 변수만 설정하면 자동으로 활성화됩니다.

## 배포 체크리스트

### SEO 최적화 ✅
- [x] 메타데이터 설정
- [x] 사이트맵 생성
- [x] robots.txt 설정
- [x] Open Graph 태그
- [x] Twitter 카드 태그
- [x] 구조화된 데이터

### 성능 최적화 ✅
- [x] 이미지 최적화
- [x] 번들 분석
- [x] 압축 설정
- [x] 캐싱 헤더

### 보안 설정 ✅
- [x] 보안 헤더
- [x] CSP 설정
- [x] HTTPS 강제
- [x] 취약점 스캔

### 모니터링
- [ ] Google Analytics 설정
- [ ] 에러 트래킹 설정
- [ ] 성능 모니터링 설정

## 배포 후 확인사항

1. **기본 기능 테스트**
   - 페이지 로딩 확인
   - 네비게이션 동작 확인
   - 캐릭터 생성/수정/삭제 테스트
   - 스위치 포인트 계산기 테스트

2. **SEO 확인**
   - Google Search Console에서 인덱싱 상태 확인
   - 사이트맵 제출 및 처리 상태 확인
   - 모바일 친화성 테스트

3. **성능 확인**
   - PageSpeed Insights 테스트
   - Core Web Vitals 측정
   - 로딩 속도 최적화 확인

4. **보안 확인**
   - SSL 인증서 확인
   - 보안 헤더 테스트
   - 취약점 스캔 결과 확인

## 문제 해결

### 일반적인 문제들

1. **환경 변수 적용 안됨**
   - Vercel에서 환경 변수 재설정
   - 새로 배포하여 적용 확인

2. **사이트맵 인식 안됨**
   - URL 확인: `/sitemap.xml`
   - Search Console에서 다시 제출

3. **Google 인증 실패**
   - verification 코드 재확인
   - HTML 태그 방법으로 재시도

4. **성능 문제**
   - 이미지 최적화 확인
   - 번들 크기 분석
   - 캐싱 설정 확인