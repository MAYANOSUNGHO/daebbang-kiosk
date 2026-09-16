# 대빵오락실 뽑기 키오스크

같은 코드로 세 곳에서 씁니다.

- PC 테스트: `npm run dev` → `http://localhost:5173`
- 안드로이드 태블릿: APK 설치
- 매니저 아이패드: 깃허브 페이지 주소를 홈 화면에 추가

## PC에서 테스트

```bash
npm install
npm run dev
```

## 에셋

- `public/assets/ui/Logo.png` 메인 로고
- `public/assets/ui/icon-192.png`, `icon-512.png` 홈 화면 아이콘
- `src/assets/fonts/Paperlogy-6SemiBold.ttf` 화면 폰트
- `public/assets/audio/` 소리 (없으면 그 소리만 안 남)

`E:\대빵 키오스크` 에 mp3를 같은 이름으로 넣고 `npm run dev` 나 `npm run build` 를 다시 하면 자동 복사됩니다.

- `BGM.mp3` 무한 반복. 뽑기 화면에서 -10dB, 메인 복귀 시 원래 볼륨
- `UI_sound.mp3` 버튼 / `gacha.mp3` 뽑기 / `Loading.mp3` 뽑는 중 / `congratulation.mp3` 상품 등장

## 안드로이드 APK

```bash
npm run apk
cd android
gradlew.bat assembleDebug
```

결과물: `android/app/build/outputs/apk/debug/app-debug.apk`

## 아이패드 (깃허브 페이지 + 홈 화면 추가)

아이폰·아이패드는 APK를 설치할 수 없어서, 웹 주소를 홈 화면에 추가해 앱처럼 씁니다.

### 최초 1회 설정

1. 깃허브에서 새 저장소를 만든다. (예: `daebbang-kiosk`, Public)
2. 이 폴더의 `업로드.bat` 을 실행하고, 물어보면 저장소 주소를 붙여넣는다.
   - 예: `https://github.com/내아이디/daebbang-kiosk.git`
3. 깃허브 저장소 → **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 바꾼다.
4. **Actions** 탭에서 초록색 체크가 뜨면 주소가 나온다.
   - `https://내아이디.github.io/daebbang-kiosk/`
5. 아이패드 사파리로 그 주소를 열고 **공유 → 홈 화면에 추가**.

홈 화면 아이콘으로 열면 주소창 없이 전체화면으로 뜨고, 한 번 열어 둔 뒤에는 인터넷이 없어도 실행됩니다.

### 업데이트

화면을 고친 뒤 `업로드.bat` 을 실행하면 됩니다. 1~2분 뒤 아이패드에서 앱을 닫고 다시 열면 새 버전이 뜹니다.

## 알아둘 점

- 품목·재고·PIN은 **기기마다 따로** 저장됩니다. 태블릿과 아이패드는 목록이 공유되지 않습니다.
- 확률은 등급끼리만 적용되고, 같은 등급 안에서는 남은 재고가 많을수록 자주 나옵니다.
- 뽑기 화면의 확률 고지는 설정을 저장하면 바로 반영됩니다.
- 직원 PIN 기본값: `1234`
