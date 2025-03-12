const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const Post = require('../models/Post');

// 게시글 생성
const createPost = async ({ userId, title, content, tags }) => {
    const db = getDb();

    // 사용자 존재 여부 확인
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error('존재하지 않는 사용자입니다.');
    }

    // todo: 태크가 존재하는지 (나중에 class 추가하든지 해야할듯)
    const newPost = new Post(userId, title, content, tags);
    const result = await db.collection('posts').insertOne(newPost);
    return { _id: result.insertedId, ...newPost };
};

// 모든 게시글 조회
const getAllPosts = async () => {
    const db = getDb();
    const posts = await db.collection('posts')
        .find()
        .sort({ createdAt: -1 })
        .toArray();
    return posts;
};

// 특정 게시글 조회
const getPostById = async (postId) => {
    const db = getDb();
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    return post;
};

// 게시글 수정
const updatePost = async (postId, { userId, title, content, tags }) => {
    const db = getDb();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error('존재하지 않는 사용자입니다.');
    }

    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    if (!post) {
        throw new Error('존재하지 않는 게시글입니다.');
    }

    if (post.userId !== userId) {
        throw new Error('해당 게시글의 작성자가 아닙니다.');
    }

    const updatedPost = {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
        updatedAt: new Date()
    };

    const result = await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        { $set: updatedPost }
    );

    if (result.matchedCount === 0) {
        throw new Error('존재하지 않는 게시글입니다.');
    }

    return updatedPost;
};

// 게시글 삭제
const deletePost = async (postId, userId) => {
    const db = getDb();

    // 사용자 검증
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error('존재하지 않는 사용자입니다.');
    }

    // 게시글 조회
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });  //hun
    if (!post) { //hun
        throw new Error("존재하지 않는 게시글입니다."); //hun
    }

    // 작성자 검증
    if (post.userId !== userId) {
        throw new Error('해당 게시글의 작성자가 아닙니다.');
    }

    // 게시글 삭제
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });
    if (result.deletedCount === 0) {
        throw new Error("게시글 삭제에 실패했습니다.");
    }

    return "게시글이 성공적으로 삭제되었습니다.";
};


// // 댓글 추가 (내장 문서 사용)
// const addComment = async (postId, { userId, content }) => {
//     const db = getDb();
//     const comment = {
//         _id: new ObjectId(),
//         userId,
//         content,
//         createdAt: new Date()
//     };

//     const result = await db.collection('posts').updateOne(
//         { _id: new ObjectId(postId) },
//         { $push: { comments: comment } }
//     );

//     if (result.matchedCount === 0) {
//         throw new Error(`Post ${postId} not found`);
//     }

//     return { message: 'Comment added', comment };
// };

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    // addComment
};