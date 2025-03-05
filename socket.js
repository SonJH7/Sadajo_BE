// socket.js
const socketIo = require('socket.io');

const chatService = require('./services/chatService');
const messageService = require('./services/messageService.js');


module.exports = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('새 클라이언트 접속:', socket.id);

        // 채팅방 생성 이벤트
        socket.on('createChat', async ({ requesterId, accepterId }) => {
            try {
                // 1. 채팅방 생성
                const chat = await chatService.createChat({ requesterId, accepterId });
                // 2. 채팅방의 ID를 room 이름으로 사용하여 생성된 방에 join
                socket.join(chat._id.toString());
                // 3. 프론트에 채팅방 완성됐다고 emit
                socket.emit('chatCreated', chat);
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });

        // 채팅방 입장 이벤트
        socket.on('joinChat', ({ chatId }) => {
            socket.join(chatId);
            socket.emit('joinedChat', { chatId });
        });

        // 메시지 송신 이벤트
        socket.on('sendMessage', async ({ chatId, senderId, message }) => {
            try {
                // 1. 메시지 저장
                await messageService.createMessage({ chatId, senderId, message });
                // 2. 채팅 데이터들을 json으로 담음
                const msgData = {
                    chatId,
                    senderId,
                    message,
                    createdAt: new Date()
                };
                // 3. to로 해당 채팅방에만 메시지 emit
                io.to(chatId).emit('message', msgData);
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('disconnect', () => {
            console.log('클라이언트 연결 종료:', socket.id);
        });
    });
};