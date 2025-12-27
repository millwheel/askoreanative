/speckit.specify 내 프로젝트는 지금 fetc를 통해 api를 가져오고 있다. 서버쪽 route.ts는 supabase sdk를 통해 외부 값을 가져오고 있다. 서버쪽은 변경할 필요 없으나, 클라이언트 쪽 코드는 교체할 필요가 잇다. fetch가 아니라 axios를 통해 page 구현부를 좀더 간편하게 처리하고 싶은 거다. 그래서 예시를 가지고 왔다.

example이라는 디렉토리를 확인하라. 그 코드는 내가 다른 프로젝트를 처리할 때 사용하던 코드이다.
```typescript
const apiClient: AxiosInstance = axios.create({
    baseURL: "/api",          // ✅ 핵심
    withCredentials: true,    // ✅ Supabase 세션 쿠키 포함
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

```

그래서 새로 만드는 코드는 위와 같이 api client를 외부 서버가 아니라 그냥 nextjs의 내부의 /api 엔드포인트를 사용해야한다. 인증 정보도 access token을 수동으로 가져오는게 아니라 쿠키 기반으로 보내는 것이다.

새로 만드는 코드에서는
```typescript
getAccessToken();
isTokenExpired();
clearTokens();
config.headers.Authorization = `Bearer ...`;
```

이런 코드는 필요 없다.

자 이제 example에 있는 코드들을 분석하고, 나의 기존 src/app 코드들을 분석하여 fetch 대신 어떻게 axios를 사용할 수 있을지 알아보고 정리해봐.

정리하자면,

1. example 디렉토리에 있는 코드를 참고하여 현재 프로젝트 에 맞춤형인 axios 유틸기를 생성해야한다. (apiGet 등)
2. 현재 /src/app 에 있는 fetch를 호출하는 코드들을 모두 axios 유틸기를 사용하는 코드로 변경해야한다.