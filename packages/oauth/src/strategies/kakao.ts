/* eslint-disable @typescript-eslint/camelcase */

import axios from 'axios'
import { escape, stringify } from 'querystring'

import { OAuthStrategy, OAuthToken, OAuthUser } from '../interfaces/oauth'

interface TokenResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
  refresh_token_expires_in: number
}

interface UserResponse {
  id: number
  properties: {
    nickname: string,
    profile_image: string,
    thumbnail_image: string,
  }
  kakao_account: {
    profile_needs_agreement: boolean,
    profile: {
      nickname: string,
      thumbnail_image_url: string,
      profile_image_url: string,
    },
    email_needs_agreement: boolean,
    is_email_valid: boolean,
    is_email_verified: boolean,
    email?: string,
    age_range_needs_agreement: boolean,
    age_range?: string,
    birthday_needs_agreement: boolean,
    birthday?: string,
    gender_needs_agreement: boolean,
    gender?: string,
  }
}

export interface KakaoStrategyOptions {
  clientId: string
  redirectUri: string
}

export class KakaoStrategy implements OAuthStrategy {

  public constructor(
    public options: KakaoStrategyOptions
  ) {}

  public getCallbackUrl(redirectUri?: string) {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${this.options.clientId}&redirect_uri=${escape(redirectUri || this.options.redirectUri)}&response_type=code`
  }

  public async getToken(code: string, redirectUri?: string): Promise<OAuthToken> {
    try {
      const response = await axios.post<TokenResponse>('https://kauth.kakao.com/oauth/token', stringify({
        grant_type: 'authorization_code',
        client_id: this.options.clientId,
        redirect_uri: redirectUri || this.options.redirectUri,
        code,
      }))

      return {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,

        scope: response.data.scope,
        refreshTokenExpiresIn: response.data.refresh_token_expires_in,
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        throw Object.assign(new Error('expired code'), { code: 'EXPIRED_CODE' })
      }
      throw e
    }
  }

  public async getUser(token: OAuthToken): Promise<OAuthUser> {
    try {
      const response = await axios.get<UserResponse>('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      })
      return {
        id: `${response.data.id}`,
        ...response.data.kakao_account.email ? { email: response.data.kakao_account.email } : {},
        nickname: response.data.properties.nickname,
        avatar: response.data.properties.profile_image,
        raw: {
          ...response.data,
        },
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        throw Object.assign(new Error('expired code'), { code: 'EXPIRED_CODE' })
      }
      throw e
    }
  }
}
