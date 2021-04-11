const express = require('express');
const Copies = require('../models/copy');
const router = express.Router();
const Users = require('../models/users');

router.post('/getcopy', async (req, res) => {
   if (req.session.userId) {
      //회원
      if (req.body.pathName === 'view') {
         const randomContent = await Copies.aggregate([
            {
               $project: {
                  id: '$_id',
                  title: 1,
                  writer: 1,
                  content: 1,
                  category: 1,
                  likeCount: 1,
               },
            },
            {
               $sample: { size: 1 },
            },
         ]);
         return res.status(200).send({ result: randomContent });
      } else {
         const content = await Copies.aggregate([
            {
               $match: { category: req.body.pathName },
            },
            {
               $project: {
                  id: '$_id',
                  title: 1,
                  writer: 1,
                  content: 1,
                  category: 1,
                  likeCount: 1,
               },
            },
            {
               $sample: { size: 20 },
            },
         ]);
         return res.status(200).send({ result: content });
      }
   } else {
      //비회원
      if (req.body.pathName === 'view') {
         const randomContent = await Copies.aggregate([
            {
               $project: {
                  id: '$_id',
                  title: 1,
                  writer: 1,
                  content: 1,
                  category: 1,
                  likeCount: 1,
               },
            },
            {
               $sample: { size: 1 },
            },
            {
               $limit: 20,
            },
         ]);
         return res.status(200).send({ result: randomContent });
      } else {
         const content = await Copies.aggregate([
            {
               $match: { category: req.body.pathName },
            },
            {
               $project: {
                  id: '$_id',
                  title: 1,
                  writer: 1,
                  content: 1,
                  category: 1,
                  likeCount: 1,
               },
            },
            {
               $sample: { size: 10 },
            },
            {
               $limit: 20,
            },
         ]);
         return res.status(200).send({ result: content });
      }
   }
});

router.post('/postcopy', async (req, res) => {
   console.log(req.session.userId);
   const resultPost = await Copies.create({
      title: req.body.title,
      writer: req.body.writer,
      content: req.body.content,
      category: req.body.category,
   });
   await Users.create({
      posting: resultPost._id,
   });
   return res.status(200).send({ result: [resultPost] });
});

router.post('/addlike', async (req, res) => {
   console.log(req.session);
   const insertBookmark = await Users.findOne({
      _id: req.session.userId,
   });

   console.log(insertBookmark);

   insertBookmark.bookmark.push(req.body.id);
   insertBookmark.save();

   const addlike = await Copies.findOneAndUpdate(
      { _id: req.body.id },
      { $inc: { likeCount: 1 } },
      { new: true }
   );

   return res.status(200).send({
      message: 'like success!',
      likeCount: addlike.likeCount,
      bookmarkList: insertBookmark.bookmark,
   });
});

router.post('/removelike', async (req, res) => {
   const findBookmark = await Users.findOne({
      _id: req.session.userId,
   });

   findBookmark.bookmark.pull({
      _id: req.body.id,
   });

   findBookmark.save();

   const removeLike = await Copies.findOneAndUpdate(
      { _id: req.body.id },
      { $inc: { likeCount: -1 } },
      { new: true }
   );

   return res.status(200).send({
      message: 'like success!',
      likeCount: removeLike.likeCount,
      bookmarkList: findBookmark.bookmark,
   });
});

module.exports = router;