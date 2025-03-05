const express = require('express')
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const http = require('http');


require('dotenv').config();
const { connectDb } = require('./db');

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',  // 프론트엔드 주소
  credentials: true,                // 쿠키, 인증 정보 전송 허용
}));
const app = express()

// 세션 설정
app.use(passport.initialize());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1일 
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL, dbName: 'SADAJO' }),
}));

app.use(passport.session());

// JSON 파싱을 위한 미들웨어
app.use(express.json())

// 일반 라우터
const indexRouter = require('./routes/index')
app.use('/', indexRouter)

// API 라우터
const apiRouter = require('./routes/api')
app.use('/api', apiRouter)

const server = http.createServer(app);

// socket 코드 불러오기
const initializeSocket = require("./socket");
initializeSocket(server);


// 서버 실행 전에 MongoDB 연결 시도
connectDb().then(() => {
  server.listen(8080, () => {
    console.log('🚀 서버 실행 중: http://localhost:8080');
  });
}).catch(err => {
  console.error('❌ 서버 실행 실패:', err);
});
