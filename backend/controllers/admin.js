const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
const utilsjwtoken = require('../utils/jwtoken');
const checkinput = require('../utils/checkinput');
let currentUser ;

 exports.postModeration = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.KEY_TOKEN);
  const postId = req.params.id;
  currentUser = decodedToken.userId;
  
      models.User.findOne({
          attributes: ["role"],
          where: {id: currentUser}
        })
      .then(user => {
          if (user.role == 2) {
             models.Post.update({
              status: 1 // authorise l article a etre visible 
          },
          {where: {id: postId}}
          )
          .then(()=>res.status(200).json("Article valide par administrateur"))
          .catch(error=>res.status(500).json("Modification Impossible"))   
        }
        else{
        return res.status(400).json("Droits reservés aux administrateurs")
        }
      })
      .catch(error => {
          return res.status(500).json({
              'error': error
          })
      });
};

exports.userModeration = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.KEY_TOKEN);
  const UserId = req.params.id;
  currentUser = decodedToken.userId;
  models.User.findOne({
    attributes: ["role"],
    where: {id: currentUser}
  })
  .then(user => {
    if (user.role == 2) {
             models.User.update({
              role: 1 // authorise l user a etre visible 
          },
          {where: {id: UserId}}
          )
          
          .then(()=>res.status(200).json("Utilisateur valide par administrateur"))
          .catch(error=>res.status(500).json("Modification Impossible"))   
        }
        else{
        return res.status(400).json("Droits reservés aux administrateurs")
        }
      })
      .catch(error => {
          return res.status(500).json({
              'error': error,
              'userId': userId
          })
      });
};

exports.commentModeration = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.KEY_TOKEN);
  const commentId = req.params.id
  currentUser = decodedToken.userId;
      models.User.findOne({
          attributes: ["role"],
          where: {id: currentUser}
      })
      .then(user => {
          if (user.role == 2) {
             models.Comment.update({
              status: 1 // authorise le commentaire a etre visible 
          },
          {where: {id: commentId}}
          )
          .then(()=>res.status(200).json("Commentaire valide par administrateur"))
          .catch(error=>res.status(500).json("Modification Impossible"))   
        }
        else{
        return res.status(400).json("Droits reservés aux administrateurs")
        }
      })
      .catch(error => {
          return res.status(500).json({
              'error': error,
              'userId': userId
          })
      });
};

exports.getAllPublications = (req, res, next) => { 
  models.Post.findAll({
    include:[{ //identifier le post
        model:models.User, attributes: ["firstName", "lastName"]
    }],
    where:{status:0},  
    order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
  })
  .then((posts) => {
      if(posts.length > null){
        return res.status(200).json(posts)
      }
      else if(posts.length == 0){
        return res.status(200).json("Aucun article")
      }
      else{
        
    return res.status(400).json("Aucun article")
}})
.catch(error=>res.status(500).json(error))
};

exports.getAllUsers = (req, res, next) => { 
    models.User.findAll({
      where:{role:0},  
      order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
    })
    .then((users) => {
        if(users.length > null){
          return res.status(200).json(users)
        }
        else if(users.length == 0){
          return res.status(200).json("Aucun Utilisateur nouveaux")
        }
        else{
      return res.status(400).json("Aucun Nouvel Utilisateur")
  }})
  .catch(error=>res.status(500).json(error))
  };


  exports.getAllComments = (req, res, next) => { 
    models.Comment.findAll({
      include:[{ //identifier le post
          model:models.User, attributes: ["firstName", "lastName"],
          model:models.Post, attributes: ["title", "content"]
      }],
      where:{status:0},  
      order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
    })
    .then((comments) => {
        if(comments.length > null){
          return res.status(200).json(comments)
        }
        else if(comments.length == 0){
          return res.status(200).json("Aucun Commentaire nouveaux")
        }
        else{
      return res.status(400).json("Aucun Nouveau Commentaire")
  }})
  .catch(error=>res.status(500).json(error))
  };


  exports.statistics = (req, res, next) => {
      //combien d user, comments, et posts  
    models.User.findAll({
        order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
      })
      .then((users) => {
          if(users.length > null){
            models.Post.findAll({
                order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
              })
              .then((posts) => {
                  if(posts.length > null){
                    models.Comment.findAll({
                        order:[["createdAt", "DESC"]]//on voit le plus recent d abord pour admin il fadrau n ehere ou status = 0 car ils sont a moderer
                      })
                      .then((comments) => {
                          if(comments.length > null){
                            const combine = {
                                "post": posts,
                                "comment": comments,
                                "user":users
                            }
                            return res.status(200).json(combine)
                          }
                          else{
                        return res.status(400).json("Aucun Nouveau Commentaire")
                    }})
                    .catch(error=>res.status(500).json(error))
                  }
                  else{
                return res.status(400).json("Aucun Post")
            }})
            .catch(error=>res.status(500).json(error))
          }
          else{
        return res.status(400).json("Aucun Utilisateur")
    }})
    .catch(error=>res.status(500).json(error))
      //date des dernieres modif COMMENT USER POST

      //date des dernieres creations
  };