# Documentation du projet API Bibliotheque

Ce document sert a expliquer le projet de bout en bout, fichier par fichier, pour que tu puisses le lire dans l'editeur et l'expliquer ensuite a quelqu'un d'autre.

## 1. But du projet

L'objectif est de construire une API REST avec Express et MongoDB pour gerer:
- des utilisateurs
- des livres
- l'authentification avec JWT
- les droits d'acces entre proprietaire et administrateur

Le projet renvoie uniquement du JSON. Il n'y a pas de pages HTML, pas de vues, pas de moteur de rendu.

## 2. Arborescence generale

```text
mon-premier-serveur/
  .env
  .gitignore
  package.json
  package-lock.json
  README.md
  server.js
  src/
    config/
      db.js
    controllers/
      authController.js
      bookController.js
    middlewares/
      authMiddleware.js
      errorMiddleware.js
    models/
      User.js
      Book.js
    routes/
      authRoutes.js
      bookRoutes.js
    validators/
      authValidators.js
      bookValidators.js
```

Note:
- `node_modules/` existe apres `npm install`, mais il ne doit pas etre envoye sur GitHub.

## 3. Comment le projet fonctionne

Le flux normal est le suivant:
1. Le client appelle une route depuis le navigateur ou Postman.
2. La route envoie la requete vers un controller.
3. Un validator peut verifier les donnees avant d'entrer dans le controller.
4. Le controller lit ou ecrit dans MongoDB via un modele Mongoose.
5. Le middleware d'auth verifie le token JWT si la route est protegee.
6. L'API renvoie une reponse JSON.

Exemple simple:
- `POST /api/auth/login`
- la route appelle `login` dans `authController.js`
- le controller cherche l'utilisateur dans `User.js`
- si le mot de passe est bon, il cree un token JWT
- il renvoie `token + user`

## 4. Fichiers a la racine

### `.env`

Role:
- stocker les variables de configuration
- garder les secrets hors du code

Contenu actuel:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Pourquoi il est la:
- permet de changer de configuration sans modifier le code
- evite de mettre les secrets dans GitHub

Point cle:
- il ne doit pas etre pousse sur GitHub

### `.gitignore`

Role:
- dire a Git quels fichiers ignorer

Contenu important:
- `node_modules/`
- `.env`
- fichiers de logs

Pourquoi il est la:
- evite de pousser les dependances et les secrets
- garde le depot propre

### `package.json`

Role:
- decrire le projet Node.js
- lister les dependances
- definir les scripts

Contenu important:
- `dev`: lance `nodemon server.js`
- `start`: lance `node server.js`
- dependances: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `express-validator`, `dotenv`
- devDependency: `nodemon`

Pourquoi il est la:
- c'est le fichier central du projet Node
- il permet a npm de savoir comment lancer l'application

Point cle:
- meme si `main` est `index.js`, les vrais points d'entree sont `server.js` via les scripts

### `package-lock.json`

Role:
- verrouiller les versions exactes des paquets installes

Pourquoi il est la:
- garantit que tous les installs utilisent les memes versions
- rend le projet reproductible

### `README.md`

Role:
- donner la notice d'installation et de test

Contenu important:
- installation
- fichier `.env`
- lancement du serveur
- routes de test
- commandes pour vider la base

Pourquoi il est la:
- aide la personne qui clone le projet a le lancer rapidement

### `server.js`

Role:
- point de demarrage du serveur

Contenu important:
- charge `dotenv`
- charge `app`
- charge `connectDB`
- lance la connexion MongoDB
- demarre `app.listen(...)`

Pourquoi il est la:
- il separe le demarrage du serveur de la configuration Express
- c'est le fichier qu'on execute avec `npm run dev` ou `npm start`

Point cle:
- `server.js` ne doit pas contenir toute la logique metier
- il reste tres court volontairement

## 5. Dossier `src`

Le dossier `src` contient le vrai code de l'API.

### `server.js` (Express configuration + startup)

Role:
- configurer Express
- monter les routes
- gerer le `404`
- brancher le middleware d'erreur

Contenu important:
- `express.json()` pour lire les body JSON
- `app.use('/api/auth', authRoutes)`
- `app.use('/api/books', bookRoutes)`
- middleware `notFound`
- middleware `errorHandler`

Pourquoi il est la:
- il centralise la configuration de l'application Express
- il permet de garder `server.js` tres propre

Point cle:
- la configuration Express et `app.listen()` sont maintenant dans `server.js`
- ce fichier construit l'application, il ne la demarre pas

### `src/config/db.js`

Role:
- ouvrir la connexion a MongoDB avec Mongoose

Contenu important:
- `mongoose.connect(process.env.MONGODB_URI)`
- gestion d'erreur avec `try/catch`
- sortie du process si MongoDB ne repond pas

Pourquoi il est la:
- evite de melanger le code de connexion avec le reste de l'application
- facilite la maintenance

Point cle:
- si la base ne demarre pas, le serveur ne doit pas continuer silencieusement

## 6. Dossier `models`

Les models definissent la forme des donnees en base.

### `src/models/User.js`

Role:
- definir la structure d'un utilisateur

Contenu important:
- `name`
- `email`
- `password`
- `role`
- `timestamps: true`
- `password` avec `select: false`

Pourquoi il est la:
- MongoDB stocke les users selon cette structure
- Mongoose applique les regles de validation

Points cle:
- `email` est unique
- `password` est cache par defaut
- `role` permet de distinguer `user` et `admin`
- `timestamps: true` ajoute `createdAt` et `updatedAt`

### `src/models/Book.js`

Role:
- definir la structure d'un livre

Contenu important:
- `title`
- `author`
- `isbn`
- `description`
- `owner`
- `timestamps: true`

Pourquoi il est la:
- chaque livre suit la meme structure
- le lien `owner` permet de savoir qui a cree le livre

Points cle:
- `isbn` est unique
- `owner` reference `User`
- `timestamps: true` ajoute `createdAt` et `updatedAt`

## 7. Dossier `controllers`

Les controllers contiennent la logique metier.

### `src/controllers/authController.js`

Role:
- gerer l'inscription
- gerer la connexion
- retourner le profil de l'utilisateur connecte

Fonctions importantes:
- `register`
- `login`
- `me`

Contenu cle:
- `validationResult(req)` pour lire les erreurs de validation
- `bcryptjs` pour hacher et comparer les mots de passe
- `jsonwebtoken` pour creer les tokens JWT
- `createToken(user)` pour signer le token
- `toUserData(user)` pour ne jamais renvoyer le mot de passe

Pourquoi il est la:
- il regroupe toute la logique d'authentification
- les routes restent simples et lisibles

Points cle:
- le mot de passe est hache avant insertion
- le login compare le mot de passe saisi avec celui de la base
- `me` lit `req.user` ajoute par le middleware d'auth

### `src/controllers/bookController.js`

Role:
- gerer toutes les actions sur les livres

Fonctions importantes:
- `getBooks`
- `getBookById`
- `createBook`
- `updateBook`
- `deleteBook`

Contenu cle:
- utilisation de `validationResult(req)`
- verification d'un `ObjectId` valide
- verification du proprietaire avec `isOwnerOrAdmin`
- `populate('owner')` pour afficher les infos du proprietaire

Pourquoi il est la:
- c'est le coeur de la logique metier des livres
- il decide qui a le droit de modifier ou supprimer

Points cle:
- lecture publique pour `GET`
- creation protegee par token
- modification et suppression reservees au proprietaire ou a l'admin
- `isbn` unique pour eviter les doublons

## 8. Dossier `routes`

Les routes definissent les URLs de l'API.

### `src/routes/authRoutes.js`

Role:
- relier les URLs d'auth a leurs controllers

Routes importantes:
- `POST /register`
- `POST /login`
- `GET /me`

Contenu cle:
- `registerValidation`
- `loginValidation`
- `protect`

Pourquoi il est la:
- il fait le lien entre l'URL et la logique metier
- il garde l'organisation claire

### `src/routes/bookRoutes.js`

Role:
- relier les URLs des livres a leurs controllers

Routes importantes:
- `GET /`
- `GET /:id`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

Contenu cle:
- `protect` pour les routes privees
- `bookValidation` pour verifier les donnees d'un livre

Pourquoi il est la:
- il separe les routes des livres des autres routes
- il rend l'API facile a lire

## 9. Dossier `middlewares`

Les middlewares traitent les requetes avant le controller ou apres une erreur.

### `src/middlewares/authMiddleware.js`

Role:
- proteger les routes avec un JWT
- gerer les roles

Fonctions importantes:
- `protect`
- `authorizeRoles`

Contenu cle:
- lecture de `Authorization: Bearer <token>`
- verification du token avec `jwt.verify(...)`
- ajout de `req.user`
- rejet avec `401` ou `403`

Pourquoi il est la:
- il evite de recopier la meme logique dans chaque controller
- il centralise la securite

Points cle:
- `Bearer` indique que le token est porte dans l'en-tete Authorization
- sans token valide, la route est bloquee

### `src/middlewares/errorMiddleware.js`

Role:
- gerer les erreurs et les routes inconnues

Contenu cle:
- `notFound`
- `errorHandler`

Pourquoi il est la:
- toutes les erreurs renvoient du JSON propre
- une route inexistante renvoie un `404` lisible

Points cle:
- `notFound` renvoie `Route introuvable`
- `errorHandler` renvoie `Erreur serveur` ou le message de l'erreur

## 10. Dossier `validators`

Les validators verifient les donnees recues dans le body.

### `src/validators/authValidators.js`

Role:
- verifier les donnees d'inscription et de connexion

Contenu cle:
- `registerValidation`
- `loginValidation`
- regles sur `name`, `email`, `password`

Pourquoi il est la:
- evite de laisser passer des donnees vides ou invalides
- reduit les erreurs dans les controllers

Points cle:
- `name` minimum 2 caracteres
- `email` doit etre valide
- `password` minimum 8 caracteres a l'inscription

### `src/validators/bookValidators.js`

Role:
- verifier les donnees d'un livre avant creation ou modification

Contenu cle:
- `bookValidation`
- regles sur `title`, `author`, `isbn`, `description`

Pourquoi il est la:
- garde la base propre
- evite d'enregistrer des livres incomplets

Points cle:
- `isbn` doit avoir une longueur raisonnable
- `description` doit avoir au moins 10 caracteres

Note importante:
- le dossier `validators` n'est pas obligatoire pour que l'API fonctionne, mais il est tres utile pour la qualite du projet

## 11. Ce que fait chaque grande brique

### Express
- gere le serveur HTTP
- recoit les requetes
- envoie les reponses

### Mongoose
- parle avec MongoDB
- definie les schemas
- valide les donnees

### JWT
- permet de reconnaitre un utilisateur connecte
- evite de renvoyer le mot de passe a chaque requete

### bcryptjs
- chiffre les mots de passe
- compare les mots de passe lors du login

### express-validator
- controle les donnees avant le controller
- renvoie des erreurs lisibles

## 12. Statuts HTTP les plus importants

- `200` : requete reussie
- `201` : ressource creee
- `400` : donnees invalides
- `401` : non authentifie ou token invalide
- `403` : acces refuse
- `404` : ressource ou route introuvable
- `409` : conflit, par exemple email ou ISBN deja utilise
- `500` : erreur serveur

## 13. Points techniques a retenir pour expliquer le projet

- `owner` represente l'utilisateur qui a cree le livre
- `timestamps: true` ajoute automatiquement `createdAt` et `updatedAt`
- `select: false` cache le mot de passe par defaut
- `Authorization: Bearer <token>` est le format utilise pour envoyer le JWT
- une route publique peut etre lue sans token
- une route protegee a besoin de `protect`
- un admin peut supprimer un livre meme s'il ne l'a pas cree

## 14. Pourquoi cette architecture est propre

Cette organisation permet de:
- separer les responsabilites
- garder le code lisible
- tester plus facilement
- corriger plus vite
- ajouter des fonctions plus tard sans tout casser

## 15. Ce qui est volontairement absent

Le projet ne contient pas:
- moteur de vues
- refresh token
- reset password
- pagination
- front-end HTML

Le but est d'avoir une API simple, claire et demonstrable.

## 16. Mini resume oral

Si tu dois l'expliquer rapidement:
- `server.js` demarre l'application
- `server.js` configure Express et demarre l'application
- `db.js` connecte MongoDB
- `models` definissent les donnees
- `controllers` contiennent la logique
- `routes` definissent les URLs
- `middlewares` gerent la securite et les erreurs
- `validators` controlent les donnees
- `README.md` explique comment installer et tester

## 17. Conclusion

Ce projet montre une API REST complete avec:
- authentification JWT
- gestion des roles
- gestion des livres
- protection des donnees sensibles
- reponses JSON propres

C'est une base solide pour expliquer le fonctionnement d'une API Node.js/MongoDB pendant une soutenance ou une revue de code.
