import argv from 'minimist'
import 'dotenv/config'

const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,
  // Database
  dbUserName: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,
  dbUserCollection: process.env.DB_USERS_COLLECTION as string,
  dbRefreshTokenCollection: process.env.DB_REFRESHTOKEN_COLLECTION as string,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION as string,
  dbVideoStatusCollection: process.env.DB_VIDEO_STATUS_COLLECTION as string,
  dbTweetCollection: process.env.DB_TWEET_COLLECTION as string,
  dbHashtagCollection: process.env.DB_HASHTAG_COLLECTION as string,
  dbBookmarkCollection: process.env.DB_BOOKMARK_COLLECTION as string,
  dbLikeTweetCollection: process.env.DB_LIKE_TWEET_COLLECTION as string,
  dbConversationCollection: process.env.DB_CONVERSATION_COLLECTION as string,
  // hashPassword
  secretPassword: process.env.PASSWORD_SECRET as string,
  // JWT
  accessTokenJWTSecret: process.env.ACCESS_TOKEN_JWT_SECRET as string,
  refreshTokenJWTSecret: process.env.REFRESH_TOKEN_JWT_SECRET as string,
  verifyEmailTokenJWTSecret: process.env.VERIFY_EMAIL_TOKEN_JWT_SECRET as string,
  verifyForgotPasswordTokenJWTSecret: process.env.VERIFY_FORGOT_PASSWORD_TOKEN_JWT_SECRET as string,
  accessTokenExpired: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpired: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  verifyEmailJWTExpired: process.env.VERIFY_EMAIL_TOKEN_JWT_EXPIRES_IN as string,
  verifyForgotPasswordTokenExpired: process.env.VERIFY_FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  // Oauth2
  googleClientID: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectURI: process.env.GOOGLE_REDIRECT_URI as string,
  ClientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBAC as string
}
