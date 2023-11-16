export enum UserVertifyStatus {
  Unverified, // Chưa xác thực email, mặc định = 0
  Verified, // Đã xác thực email,
  Banned // Bị khoá
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Fail
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
