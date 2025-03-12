const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');

// 게시글 단건 조회
router.get('/:postId', postController.getPostById);

// 게시글 전체 조회
router.get('/', postController.getAllPosts);

// 게시글 생성
router.post('/', postController.createPost);

// 게시글 삭제
router.delete('/:postId/:userId', postController.deletePost);

// 게시글 수정
router.put('/:postId', postController.updatePost);

// // 댓글 작성
// router.post('/:postId/comments', postController.addComment);

module.exports = router;