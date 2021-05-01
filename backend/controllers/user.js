const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
const utilsjwtoken = require('../utils/jwtoken');
const checkinput = require('../utils/checkinput');


//CREATION COMPTE fct signup qui va crypter password, va cree un nouveau user avec ce password et l email, et l'enregistre
exports.signup = (req, res) => {
    let email = req.body.email;
    let lastName = req.body.lastName;
    let firstName = req.body.firstName;
    let password = req.body.password;
    if (email == null || lastName == null || firstName == null || password == null) {
        res.status(400).json({ error: 'Tous les champs sont obligatoires' })
    }
    //vérification inputs user
    let emailOK = checkinput.validEmail(email);
    let passwordOK = checkinput.validPassword(password);
    let lastNameOK = checkinput.validUsername(lastName);
    let firstNameOK = checkinput.validUsername(firstName);
    console.log(emailOK, passwordOK, lastNameOK, firstNameOK)
    if (emailOK == true && passwordOK == true && lastNameOK == true && firstNameOK == true) {
        //vérification si user n'existe pas déjà
        models.User.findOne({
            attributes: ['email'],
            where: { email: email }
        })
            .then(user => {
                console.log("ok1");
                if (!user) {
                  console.log("ok2");
                    bcrypt.hash(password, 10, function (error, hash) {
                        //création user
                        const newUser = models.User.create({
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            password: hash
                        })
                            .then(userNew => { res.status(201).json({ 'Utilisateur créé ! Id': userNew.idUser }) })
                            .catch(err => {
                                res.status(500).json({ error })
                            })
                    })
                }
                else {
                    res.status(400).json({ error: 'Cet utilisateur existe déjà' })
                }
            })
            .catch(error => { res.status(501).json({ error }) })
    } else {
        console.log('Erreur')
    }
};

exports.login = (req, res) => {
    //récupération et validation des paramètres
    let email = req.body.email;
    let password = req.body.password;
    if (email == null || password == null) {
        res.status(400).json({ error: 'Il manque une information' })
    }
    //user existe-t-il?
    models.User.findOne({
        where: { email: email }
    })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (errComparePassword, resComparePassword) => {
                    if (resComparePassword) {
                         res.status(200).json({
                             userId: user.id,
                             token: utilsjwtoken.generateToken(user),
                             name: user.firstName
                         })
                    } else {
                        res.status(403).json({ error: 'invalid password' });
                    };
                })
            } else {
                res.status(404).json({ 'erreur': 'Cet utilisateur n\'existe pas' })
            }
        })
        .catch(err => { res.status(500).json({ err }) })
};


exports.getUser = (req, res, next) => {
    const idUser = req.params.id 
    models.User.findOne ({
        attributes: ["email", "firstName", "lastName", "Role", "id"],
        where: {id: idUser}
    })
    .then((user) => {
        if(user == null){
          return res.status(400).json("Utilisateur non trouvé")
        }
        else{
            return res.status(200).json(user)
    }
      })
      
  .catch(error=>res.status(500).json(error))
};
