<template>
 <!-- Page renseignant infos de l'utilisteur. 
 Sert au moderateur pour avoir acces aux ARTICLES UTILISATEURS COMMENTAIRES a moderer
 Affiche aussi les stats  -->
  <div class="login-box">
    <h2 class="cardTitle textShadow">Mon Profil<div v-if=" role == 2 ">administrateur</div></h2>
    <form>
  <div class="infoUser"> 
    <!-- Info utilisateur -->
   <div class="profileInfo">
      <table class="textShadow profileInfo__table">
        <tr>
          <th>Prénom:</th>
          <td>{{ firstName }}</td>
        </tr>
        <tr>
          <th>Nom:</th>
          <td>{{ lastName }}</td>
        </tr>
        <tr>
          <th>Date d'inscription:</th>
          <td v-if="createdAt"> {{ createdAt.split("-")[2].split("T")[0] }}/{{ createdAt.split("-")[1] }}/{{ createdAt.split("-")[0] }}</td>
        </tr>
      </table>
     <!-- Debut Extension du profile pour ADMIN -->
        <div v-if=" role == 2 ">
            <table class="textShadow profileInfo__table">
        <tr>
          <th>Nombre d'articles Totales:</th>
          <td> {{ postReallyAnimated }}</td>
        </tr>
        <tr>
          <th>Nombre de commentaires Totales:</th>
          <td>{{ commentReallyAnimated }}</td>
        </tr>
        <tr>
          <th>Nombre d'utilisateurs Totales:</th>
          <td>{{ userReallyAnimated }}</td>
        </tr>
      </table>
   </div>
  </div>
  <div v-if=" role == 2 ">
          <h2 id="titleDisplay" class="textShadow">Nouveaux Utilisateurs</h2>
          <div class="infoUsersDisplay">
            <p v-if="users.length == 0">Aucun Nouvel Utilisateur</p>
            <div class="articles user"  v-for="user in users" :key="user.userId">
<div class="infoHeight">
                  <table>
                    <tr>
                      <th>Prénom:</th>
                      <td>{{ user.firstName }}</td>
                    </tr>
                    <tr>
                      <th>Nom:</th>
                      <td>{{ user.lastName }}</td>
                    </tr>
                    <tr>
                      <th class="articles--italique">Créé le:</th>
                      <td>{{ user.createdAt.split("-")[2].split("T")[0] }}/{{ user.createdAt.split("-")[1] }}/{{ user.createdAt.split("-")[0] }}</td>
                    </tr>
                  </table>
</div>
                <a class="showButton borderBtn"  type="submit" @click.prevent="validateUser(user.id)">Authoriser l'utilisateur</a>
            </div>
          </div>
          <h2 id="titleDisplay" class="textShadow">Nouveaux Articles</h2>
          <div class="infoUsersDisplay">
            <p v-if="posts.length == 0">Aucun Nouvel Article</p>
            <div class="articles post"  v-for="post in posts" :key="post">
              <div class="infoHeight--post">
                <h3>{{ post.title }}</h3>
                <p class="postContent textShadow">{{ post.content }}</p>
                <div class="imageRow">
                    <img class="imagePostFocus" :src= "post.image" alt="" >
                </div>
                <div class="diplayAttribute">
                  <p class="dateStamp articles--italique" >Datant du: {{ post.updatedAt.split("-")[2].split("T")[0] }}/{{ post.updatedAt.split("-")[1] }}/{{ post.updatedAt.split("-")[0] }}</p>
                </div>
                <p class="auteur" >par: {{ post.User.firstName }} {{ post.User.lastName }}</p>
              </div>
                <a class="showButton borderBtn"  type="submit" @click.prevent="validatePost(post.id)">Authoriser la Publication</a>
            </div>
          </div>
          <h2  id="titleDisplay" class=" textShadow">Nouveaux Commentaires</h2>
          <div class="infoUsersDisplay">
            <p v-if="comments.length == 0">Aucun Nouveau Commentaire</p>
            <div class="articles comment" v-for="comment in comments" :key="comment">
              <div class="infoHeight--comment">
                <p>{{ comment.content }}</p>
                <p class="dateStamp articles--italique">Créé le: {{  comment.createdAt.split("-")[2].split("T")[0] }}/{{ comment.createdAt.split("-")[1] }}/{{ comment.createdAt.split("-")[0] }}</p>
              </div>
                <a class="showButton borderBtn"  type="submit" @click.prevent="validateComment(comment.id)">Authoriser le commentaire</a>
          </div>
          </div>
      </div>
      <img class="logoProfile" src="../assets/logos/icon-left-font-monochrome-black.svg" alt="">
  </div>
      <a href="/Post">Créer Un Nouvel Article</a>
      <a @click="deleteUser">Supprimer Le Profil</a>
      <a href="/" >Retour a l'accueil</a>
    </form>
  </div>
  
</template>

<script>
import axios from "axios";
import gsap from "gsap";
export default {
    data () {
      return {
        token: localStorage.getItem('token'),
        user_id:localStorage.getItem("id"),
        posts: '',
        post:'',
        post_id:'',
        users: '',
        user: '',
        comments:'',
        image:'',
        email:'',
        firstName:'',
        lastName:'',
        createdAt:'',
        role:'',
        userNumber:'',
        postNumber:'',
        commentNumber:'',
        postNumberAnimated : 0,
        userNumberAnimated : 0,
        commentNumberAnimated : 0
        };
    },
    mounted(){
       this.profileUser(),
       this.moderatePost(),
       this.moderateUser(),
       this.moderateComment(),
       this.getStats()  
    },
    //Debut Animation des stats
    computed: {
      postReallyAnimated(){
        return this.postNumberAnimated.toFixed(0);
      },
      commentReallyAnimated(){
        return this.commentNumberAnimated.toFixed(0);
      },
      userReallyAnimated(){
        return this.userNumberAnimated.toFixed(0);
      }
    },
    watch: {
      postNumber(newValue) {
        gsap.to(this.$data, { duration: .75, postNumberAnimated: newValue });
      },
      userNumber(newValue) {
        gsap.to(this.$data, { duration: .75, userNumberAnimated: newValue });
      },
      commentNumber(newValue) {
        gsap.to(this.$data, { duration: .75, commentNumberAnimated: newValue });
      }
    //Fin Animation des stats
    },
    methods:{
      //Affiche le profile de l'utilisateur
      profileUser(){
        const token = localStorage.getItem('token');
        const user_id = localStorage.getItem("id");
        axios.get("http://localhost:3000/api/auth/infouser/"+user_id, {
          headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          })
          .then(res => {
            const data = res.data;
              this.firstName = data.firstName;
              this.lastName = data.lastName;
              this.createdAt = data.createdAt;
              this.updatedAt = data.updatedAt;
              this.role = data.Role;
              if(this.user.UserId == this.user_id){
                this.author = true;
              }
          })
          .catch(error => console.log({error}));
      },
      //moderate### Permet a l'admin d'afficher les ARTICLES, UTILISATEURS et COMMENTAIRES a moderer
      //validate### Permet a l'admin d'authoriser la publication des ARTICLES, UTILISATEURS et COMMENTAIRES 
      moderatePost(){
        const token = localStorage.getItem('token');
          axios.get("http://localhost:3000/admin/showPost", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                const data = res.data;
                this.post = data;
                if(typeof data == 'object'){
                  this.posts = data;
                }
            })
            .catch(error => console.log({error}));
      },
      validatePost(id){
         axios.put("http://localhost:3000/admin/postModeration/"+ id,null
          , {
           headers: {
                       'Content-Type': 'application/json',
                       'Authorization': 'Bearer ' + this.token
                   }
         } )
                    .then(() => {
                      alert("L'article selectionné a bien été validé")
                        location.reload();
                    })
                    .catch((error) => console.log(error));
      },
      moderateUser(){
        const token = localStorage.getItem('token');
            axios.get("http://localhost:3000/admin/showUser", {
              headers: {
                'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              })
              .then(res => {
                const data = res.data;
                if(typeof data == 'object'){
                  this.users = data;
                }
              })
              .catch(() => alert("Ceci est un message a modifie")); // changer pour l alerte correspondante ()
      },
      validateUser(id){
         axios.put("http://localhost:3000/admin/userModeration/"+ id,null
          , {
           headers: {
                       'Content-Type': 'application/json',
                       'Authorization': 'Bearer ' + this.token
                   }
         } )
                    .then(() => {
                       alert("L'utilisateur selectionné a bien été validé")
                        location.reload();
                    })
                    .catch((error) => console.log(error));
      },
      moderateComment(){
      const token = localStorage.getItem('token');
        axios.get("http://localhost:3000/admin/showComment", {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          })
          .then(res => {
              const data = res.data;
               if(typeof data == 'object'){
                  this.comments = data;
                }
          })
          .catch(error => console.log({error}));
      },
      validateComment(id){
        axios.put("http://localhost:3000/admin/commentModeration/"+ id,null
          , {
           headers: {
                       'Content-Type': 'application/json',
                       'Authorization': 'Bearer ' + this.token
                   }
         } )
                    .then(() => {
                        alert("Le commentaire selectionné a bien été validé")
                        location.reload();
                    })
                    .catch((error) => console.log(error));
      },
      //Affiche les statistiques, soit le nombre des ARTICLES, UTILISATEURS et COMMENTAIRES existant
      getStats(){
        const token = localStorage.getItem('token');
            axios.get("http://localhost:3000/admin/statistics", {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              })
            .then(res => {
                const data = res.data;
                let userStats = data.user.length;
                this.userNumber = userStats;
                let postStats = data.post.length;
                this.postNumber = postStats;
                let commentStats = data.comment.length;
                this.commentNumber = commentStats;
            })
            .catch(error => console.log({error}));
      },
      //Permet a un utilisateur de supprimer son profile/compte ses articles et ses commentaires de la base de donées
      deleteUser(){
        const data = {
          currentUser: this.user_id
        }
        axios.put("http://localhost:3000/api/auth/deleteUser", data, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${this.token}`
              }
          })
          .then(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('name');
              localStorage.removeItem('id');
              alert("Votre compte a bien été supprimé.")
              window.location.replace("/")
          })
          .catch(error => console.log({error}));
      }
    }
}
</script>

<style  lang="scss">
$base-color: #fff;
.profileInfo{
display: flex;
justify-content: space-evenly;
font-size: 1.5rem;
}
.infoUsersDisplay{
  display: flex;
  flex-wrap: wrap;
}
.articles{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  position: relative;
  border: 1px solid $base-color;
  padding: 1rem;
  margin:1rem;
  max-width: 24rem;
    &--italique{
      font-style: italic;
    }
}
#titleDisplay{
  padding-top:6rem;
  font-size: 2rem;
}
.infoHeight{
min-height: 150px;
  &--post{
    min-height: 205px;
  }
  &--comment{
    min-height: 115px;
  }
}
.imagePostFocus{
  width: 50%;
}
@media screen and (max-width: 1024px){
#titleDisplay{
  padding-top: 2rem;
}
}
</style>