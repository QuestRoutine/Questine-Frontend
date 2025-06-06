# 🚀 Questine (퀘스틴)

<img width="256" alt="Image" src="https://github.com/user-attachments/assets/03be92e5-e401-492f-b6f3-aa9af5f1ead1" />

# 🔗 프로젝트 배포 주소

<div align="center">

| [Android](#) | [IOS](#) |
| :----------: | :------: |

</div>
<br />

> 목차
>
> - [⚙️ 기술 스택](#-기술-스택)
> - [🌟 Questine이란?](#-questine이란)
> - [🧩 서비스 주요 기능](#-서비스-주요-기능)
> - [🔧 FE 핵심 개발 영역](#-fe-핵심-개발-영역)
> - [📁 폴더 구조](#-폴더-구조)
> - [📄 참고 자료](#-참고-자료)

---

# 🌟 개요

**Questine**은 레벌업과 같은 RPG 요소가 살짝 가미돼 있는 할 일 관리 서비스입니다. 사용자는 매일 할 일을 기록하고, 할 일 달성 시, 캐릭터가 성장합니다. 재미와 동기부여를 동시에 제공하는 새로운 경험을 목표로 합니다.

# ⚙️ 기술 스택

![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React Query](https://img.shields.io/badge/React%20Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)

## ERD

<img width="1200" alt="Image" src="https://github.com/user-attachments/assets/0030ad9d-8fad-42b5-b124-19570d79bb5b" />

# 🧩 서비스 주요 기능

<div align="center">

### 할 일 등록/삭제

<table>
  <tr>
    <td max-width="500">
      <img width="300" src="https://github.com/user-attachments/assets/2cfdc55e-00d2-441a-a022-56834104b1df" />
    </td>
    <td>
      할 일 추가 및 삭제를 할 수 있습니다. <br/>
      완료한 할 일 개수에 따라 그라데이션 색상이 적용됩니다. <br/>
      </td>
  </tr>
</table>

**업적**

<table>
  <tr>
    <td max-width="500">
      <img width="300" src="https://github.com/user-attachments/assets/e04c055c-58cb-4633-bb2d-dd7153983673" />
    </td>
    <td>
      할 일을 완료하면서 활성화된 업적과 비활성화된 업적을 확인할 수 있습니다.<br/>
      재미를 위해서 아직 해금되지 않은 업적 조건은 확인할 수 없습니다.<br/>
    </td>
  </tr>
</table>

**캐릭터**

<table>
  <tr>
    <td max-width="500">
      <img width="300" src="https://github.com/user-attachments/assets/f8e2692d-7b39-40d1-8326-522891509d76" />
    </td>
    <td>
      <b>레벨</b> - 완료한 할 일 개수에 따라 경험치를 올릴 수 있습니다.<br/>
      <b>이미지</b> - 레벨에 따라 다양한 이미지를 제공합니다.<br/>
    </td>
  </tr>
</table>

**랭킹**

<table>
  <tr>
    <td max-width="500">
      <img width="300" src="https://github.com/user-attachments/assets/d2ffe967-b448-4ab7-babd-bed4b6038c1b" />
    </td>
    <td>
      <b>랭킹</b> - 전체 이용자의 랭킹을 확인할 수 있습니다.<br/>
    </td>
  </tr>
</table>
</div>

<br/>

---

# 🔧 FE 핵심 개발 영역

1.

2.
3.

---

# 📁 폴더 구조

<div align="left">

`app/` : 라우팅 및 주요 화면 컴포넌트 (file-based routing)

`tabs/` : 메인 탭 화면 (Achievement, Character, Profile, Rank 등)

`auth/` : 인증 관련 화면 (Login, Register 등)

`settings/` : 설정 관련 화면

`components/` : 재사용 가능한 UI 컴포넌트 및 입력 컴포넌트

`constants/` : 상수 및 공통 값 정의 (예: Colors, Calendars)

`hooks/` : 커스텀 훅 (예: useAuth, useTodo)

`api/` : API 통신 및 쿼리 클라이언트

`utils/` : 유틸리티 함수

`assets/` : 이미지, 폰트 등 정적 리소스

`types/` : 타입 정의

</div>

---

# 📄 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 공식 문서](https://reactnative.dev/)
