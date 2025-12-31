import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@politics/database";
import bcrypt from "bcryptjs";

// 환경 변수 검증
const kakaoClientId = process.env.KAKAO_CLIENT_ID;
const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;

if (!kakaoClientId || !kakaoClientSecret) {
  console.warn(
    "KAKAO_CLIENT_ID 또는 KAKAO_CLIENT_SECRET이 설정되지 않았습니다. 카카오 로그인이 비활성화됩니다."
  );
}

// 프로바이더 목록 생성
const providers: Provider[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "이메일", type: "email" },
      password: { label: "비밀번호", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("이메일과 비밀번호를 입력해주세요");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        throw new Error("계정을 찾을 수 없습니다");
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isValid) {
        throw new Error("비밀번호가 일치하지 않습니다");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

// 카카오 환경 변수가 설정된 경우에만 카카오 프로바이더 추가
if (kakaoClientId && kakaoClientSecret) {
  providers.unshift(
    KakaoProvider({
      clientId: kakaoClientId,
      clientSecret: kakaoClientSecret,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
